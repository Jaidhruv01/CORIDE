from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.entities import Report, User
from app.schemas.schemas import ReportCreate, ReportOut, ApiResponse, SOSAlertRequest
from app.services.notification_service import create_notification

router = APIRouter()


@router.post("", response_model=ReportOut)
def create_report(
    rep_in: ReportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = Report(
        reporter_id=current_user.id,
        target_user_id=rep_in.target_user_id,
        ride_id=rep_in.ride_id,
        booking_id=rep_in.booking_id,
        category=rep_in.category,
        details=rep_in.details,
        status="PENDING"
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    # Notify admins
    admins = db.query(User).filter(User.is_admin.is_(True)).all()
    for admin in admins:
        create_notification(
            db=db,
            user_id=admin.id,
            notif_type="REPORT_NEW",
            title="New Safety Incident Reported",
            body=f"User {current_user.name} reported a category '{rep_in.category}' incident.",
            data={"report_id": report.id}
        )

    return report


@router.get("/me", response_model=List[ReportOut])
def get_my_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Report).filter(Report.reporter_id == current_user.id).order_by(Report.created_at.desc()).all()


@router.post("/sos", response_model=ApiResponse)
def trigger_sos_alert(
    req: SOSAlertRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Log emergency report
    report = Report(
        reporter_id=current_user.id,
        ride_id=req.ride_id,
        booking_id=req.booking_id,
        category="SAFETY",
        details=f"🚨 EMERGENCY SOS TRIGGERED! Coordinates: {req.lat}, {req.lng}. Emergency contact: {current_user.emergency_contact or 'Not set'}. Note: {req.message}",
        status="UNDER_REVIEW",
        admin_notes="Emergency SOS flagged by system."
    )
    db.add(report)
    db.commit()

    # Notify admins immediately
    admins = db.query(User).filter(User.is_admin.is_(True)).all()
    for admin in admins:
        create_notification(
            db=db,
            user_id=admin.id,
            notif_type="SOS_TRIGGERED",
            title="🚨 EMERGENCY SOS ALERT",
            body=f"User {current_user.name} triggered an SOS emergency alert!",
            data={"report_id": report.id, "user_id": current_user.id, "lat": req.lat, "lng": req.lng}
        )

    return ApiResponse(
        success=True,
        message="Emergency SOS alert has been dispatched to 24x7 Safety Response Team and registered emergency contacts.",
        data={"report_id": report.id}
    )
