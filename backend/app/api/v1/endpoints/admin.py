import json
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from app.core.config import settings
from app.core.database import get_db
from app.api.deps import get_current_admin
from app.models.entities import (
    User, UserVerification, Vehicle, Ride, Booking, Payment, Report, AdminAuditLog
)
from app.schemas.schemas import (
    AdminStatsOut, UserOut, UserVerificationOut, ReportOut, RideOut,
    BookingOut, PaymentOut, ApiResponse,
    AdminUnlockRequest, AdminChangePinRequest, AdminAuditLogOut
)
from app.services.notification_service import create_notification

router = APIRouter()


# --- Security & Master Key Clearance ---

@router.post("/auth/unlock")
def unlock_admin_vault(
    payload: AdminUnlockRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    pin = payload.pin.strip() if payload.pin else ""
    key = payload.key.strip() if payload.key else ""

    is_valid_pin = pin and pin == settings.ADMIN_SECURITY_PIN
    is_valid_key = key and key == settings.ADMIN_SECURITY_KEY

    if not (is_valid_pin or is_valid_key):
        # Log failed attempt
        audit_fail = AdminAuditLog(
            admin_id=current_admin.id,
            action="VAULT_UNLOCK_FAILED",
            entity_type="SYSTEM",
            entity_id="ADMIN_GATE",
            metadata_json=json.dumps({"attempt_type": "PIN" if pin else "KEY", "timestamp": datetime.utcnow().isoformat()})
        )
        db.add(audit_fail)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Master Security PIN or Secret Key. Clearance Denied."
        )

    # Log successful clearance
    audit_success = AdminAuditLog(
        admin_id=current_admin.id,
        action="VAULT_CLEARANCE_GRANTED",
        entity_type="SYSTEM",
        entity_id="ADMIN_GATE",
        metadata_json=json.dumps({"method": "MASTER_PIN" if is_valid_pin else "SECRET_KEY", "timestamp": datetime.utcnow().isoformat()})
    )
    db.add(audit_success)
    db.commit()

    return {
        "success": True,
        "message": "Master Admin Clearance Granted",
        "expires_in_minutes": 15,
        "unlocked_at": datetime.utcnow().isoformat(),
        "admin_name": current_admin.name
    }


@router.post("/auth/change-pin")
def change_admin_security_pin(
    payload: AdminChangePinRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    if payload.current_pin.strip() != settings.ADMIN_SECURITY_PIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current Master PIN is incorrect."
        )

    new_pin = payload.new_pin.strip()
    if len(new_pin) < 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New Master PIN must be at least 4 digits."
        )

    settings.ADMIN_SECURITY_PIN = new_pin

    audit = AdminAuditLog(
        admin_id=current_admin.id,
        action="MASTER_PIN_CHANGED",
        entity_type="SYSTEM",
        entity_id="SECURITY_SETTINGS",
        metadata_json=json.dumps({"changed_by": current_admin.email, "timestamp": datetime.utcnow().isoformat()})
    )
    db.add(audit)
    db.commit()

    return {"success": True, "message": "Master Admin Security PIN updated successfully."}


@router.get("/audit-logs", response_model=List[AdminAuditLogOut])
def get_admin_audit_logs(
    limit: int = Query(50, le=200),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    logs = (
        db.query(AdminAuditLog)
        .order_by(AdminAuditLog.created_at.desc())
        .limit(limit)
        .all()
    )
    return logs



@router.get("/stats", response_model=AdminStatsOut)
def get_admin_stats(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_drivers = db.query(User).filter(User.is_driver.is_(True)).count()
    total_rides = db.query(Ride).count()
    active_rides = db.query(Ride).filter(Ride.status.in_(["PUBLISHED", "IN_PROGRESS", "FULL"])).count()
    completed_rides = db.query(Ride).filter(Ride.status == "COMPLETED").count()
    total_bookings = db.query(Booking).count()
    confirmed_bookings = db.query(Booking).filter(Booking.status.in_(["CONFIRMED", "COMPLETED"])).count()

    # Financials
    completed_or_confirmed = db.query(Booking).filter(Booking.status.in_(["CONFIRMED", "COMPLETED"])).all()
    gross_booking_value = round(sum(b.total for b in completed_or_confirmed), 2)
    platform_revenue = round(sum(b.service_fee for b in completed_or_confirmed), 2)

    pending_verifications = db.query(UserVerification).filter(UserVerification.status == "PENDING").count()
    pending_reports = db.query(Report).filter(Report.status.in_(["PENDING", "UNDER_REVIEW"])).count()

    # Seat utilization
    all_published_rides = db.query(Ride).all()
    total_seats_offered = sum(r.seats_total for r in all_published_rides) if all_published_rides else 1
    total_seats_booked = sum(b.seats for b in completed_or_confirmed) if completed_or_confirmed else 0
    seat_utilization_rate = round((total_seats_booked / total_seats_offered) * 100, 1) if total_seats_offered > 0 else 0.0

    return AdminStatsOut(
        total_users=total_users,
        total_drivers=total_drivers,
        total_rides=total_rides,
        active_rides=active_rides,
        completed_rides=completed_rides,
        total_bookings=total_bookings,
        confirmed_bookings=confirmed_bookings,
        total_gross_booking_value=gross_booking_value,
        total_platform_revenue=platform_revenue,
        pending_verifications=pending_verifications,
        pending_reports=pending_reports,
        seat_utilization_rate=seat_utilization_rate
    )


@router.get("/users", response_model=List[UserOut])
def get_all_users(
    query: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    q = db.query(User)
    if query:
        search_pattern = f"%{query}%"
        q = q.filter((User.name.ilike(search_pattern)) | (User.email.ilike(search_pattern)))
    if status_filter:
        q = q.filter(User.status == status_filter)
    return q.order_by(User.created_at.desc()).all()


@router.patch("/users/{user_id}/status", response_model=UserOut)
def update_user_status(
    user_id: str,
    payload: dict,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    new_status = payload.get("status", "ACTIVE")
    old_status = user.status
    user.status = new_status

    audit = AdminAuditLog(
        admin_id=current_admin.id,
        action="USER_STATUS_UPDATED",
        entity_type="USER",
        entity_id=user.id,
        metadata_json=json.dumps({"old_status": old_status, "new_status": new_status, "user_email": user.email})
    )
    db.add(audit)
    db.commit()
    db.refresh(user)
    return user


@router.get("/verifications", response_model=List[UserVerificationOut])
def get_verifications(
    status_filter: Optional[str] = Query(None),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    q = db.query(UserVerification)
    if status_filter:
        q = q.filter(UserVerification.status == status_filter)
    return q.order_by(UserVerification.created_at.desc()).all()


@router.post("/verifications/{verification_id}/review", response_model=UserVerificationOut)
def review_verification(
    verification_id: str,
    payload: dict,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    verif = db.query(UserVerification).filter(UserVerification.id == verification_id).first()
    if not verif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Verification record not found")

    verif_status = payload.get("status", "VERIFIED")  # VERIFIED or REJECTED
    verif.status = verif_status
    verif.reviewed_by = current_admin.id
    verif.reviewed_at = datetime.utcnow()
    verif.rejection_reason = payload.get("rejection_reason")

    if verif_status == "VERIFIED":
        user = db.query(User).filter(User.id == verif.user_id).first()
        if user:
            user.is_driver = True
            db.commit()

        create_notification(
            db=db,
            user_id=verif.user_id,
            notif_type="VERIFICATION_APPROVED",
            title="Verification Approved! 🎉",
            body="Your verification documents have been verified. Driver mode is active.",
            data={"verification_id": verif.id}
        )
    elif verif_status == "REJECTED":
        create_notification(
            db=db,
            user_id=verif.user_id,
            notif_type="VERIFICATION_REJECTED",
            title="Verification Update",
            body=f"Your verification document was rejected: {verif.rejection_reason or 'Document unreadable'}.",
            data={"verification_id": verif.id}
        )

    audit = AdminAuditLog(
        admin_id=current_admin.id,
        action=f"VERIFICATION_{verif_status}",
        entity_type="VERIFICATION",
        entity_id=verif.id,
        metadata_json=json.dumps({"target_user_id": verif.user_id, "doc_type": verif.type, "status": verif_status})
    )
    db.add(audit)
    db.commit()
    db.refresh(verif)
    return verif



@router.get("/reports", response_model=List[ReportOut])
def get_all_reports(
    status_filter: Optional[str] = Query(None),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    q = db.query(Report)
    if status_filter:
        q = q.filter(Report.status == status_filter)
    return q.order_by(Report.created_at.desc()).all()


@router.post("/reports/{report_id}/resolve", response_model=ReportOut)
def resolve_report(
    report_id: str,
    payload: dict,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    rep = db.query(Report).filter(Report.id == report_id).first()
    if not rep:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    new_status = payload.get("status", "RESOLVED")
    admin_notes = payload.get("admin_notes", "Resolved by Admin")
    rep.status = new_status
    rep.admin_notes = admin_notes

    audit = AdminAuditLog(
        admin_id=current_admin.id,
        action=f"REPORT_{new_status}",
        entity_type="REPORT",
        entity_id=rep.id,
        metadata_json=json.dumps({"category": rep.category, "reporter_id": rep.reporter_id, "notes": admin_notes})
    )
    db.add(audit)
    db.commit()
    db.refresh(rep)
    return rep



@router.get("/rides", response_model=List[RideOut])
def get_admin_rides(
    status_filter: Optional[str] = Query(None),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    q = db.query(Ride).options(
        joinedload(Ride.driver),
        joinedload(Ride.vehicle),
        joinedload(Ride.stops)
    )
    if status_filter:
        q = q.filter(Ride.status == status_filter)
    return q.order_by(Ride.created_at.desc()).limit(100).all()


@router.get("/bookings", response_model=List[BookingOut])
def get_admin_bookings(
    status_filter: Optional[str] = Query(None),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    q = db.query(Booking).options(
        joinedload(Booking.ride).joinedload(Ride.driver),
        joinedload(Booking.ride).joinedload(Ride.vehicle),
        joinedload(Booking.rider)
    )
    if status_filter:
        q = q.filter(Booking.status == status_filter)
    return q.order_by(Booking.booked_at.desc()).limit(100).all()


@router.get("/payments", response_model=List[PaymentOut])
def get_admin_payments(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return db.query(Payment).order_by(Payment.created_at.desc()).limit(100).all()
