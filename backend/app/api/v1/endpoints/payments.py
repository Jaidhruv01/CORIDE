from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.entities import Payment, Booking, Ride, User
from app.schemas.schemas import PaymentOrderCreate, PaymentVerifyRequest, PaymentOut, ApiResponse

router = APIRouter()


@router.post("/order", response_model=PaymentOut)
def create_payment_order(
    req: PaymentOrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == req.booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    if booking.rider_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    provider = req.provider or "razorpay"
    payment = db.query(Payment).filter(Payment.booking_id == booking.id).first()
    if not payment:
        payment = Payment(
            booking_id=booking.id,
            provider=provider,
            provider_order_id=f"order_{booking.booking_code}",
            amount=booking.total,
            currency="INR",
            status="PENDING_CASH" if provider == "cash" else "CREATED"
        )
        db.add(payment)
        db.commit()
        db.refresh(payment)
    else:
        if req.provider:
            payment.provider = provider
            if provider == "cash":
                payment.status = "PENDING_CASH"
            db.commit()
            db.refresh(payment)

    return payment


@router.post("/verify", response_model=ApiResponse)
def verify_payment(
    req: PaymentVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    payment = db.query(Payment).filter(Payment.booking_id == req.booking_id).first()
    booking = db.query(Booking).filter(Booking.id == req.booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    provider = req.provider or (payment.provider if payment else "razorpay")

    if not payment:
        payment = Payment(
            booking_id=booking.id,
            provider=provider,
            provider_order_id=f"order_{booking.booking_code}",
            amount=booking.total,
            currency="INR",
            status="PENDING_CASH" if provider == "cash" else "CAPTURED"
        )
        db.add(payment)

    payment.provider = provider
    if provider == "cash":
        payment.provider_payment_id = req.provider_payment_id or f"cash_{booking.booking_code}"
        payment.provider_signature = req.provider_signature or "cash_on_pickup_agreed"
        payment.status = "PENDING_CASH"  # Cash will be collected by driver upon pickup
    else:
        payment.provider_payment_id = req.provider_payment_id or f"pay_{booking.booking_code}_simulated"
        payment.provider_signature = req.provider_signature or "verified_mock_sig"
        payment.status = "CAPTURED"
    
    payment.webhook_verified = True

    # If ride mode is INSTANT, confirm booking immediately
    if booking.status == "PENDING" and (not booking.ride or booking.ride.booking_mode == "INSTANT"):
        booking.status = "CONFIRMED"

    db.commit()
    db.refresh(payment)

    success_msg = "Cash payment option selected. Please pay cash to driver upon boarding." if provider == "cash" else "Payment verified successfully"
    return ApiResponse(success=True, message=success_msg, data={"status": payment.status, "provider": payment.provider})


@router.post("/webhook")
def payment_webhook(payload: dict, db: Session = Depends(get_db)):
    # Webhook handler
    event = payload.get("event", "payment.captured")
    payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
    order_id = payment_entity.get("order_id")

    if order_id:
        payment = db.query(Payment).filter(Payment.provider_order_id == order_id).first()
        if payment:
            payment.status = "CAPTURED"
            payment.webhook_verified = True
            db.commit()

    return {"status": "ok"}


@router.get("/my/transactions")
def get_user_transactions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Rider payment records
    rider_bookings = db.query(Booking).filter(Booking.rider_id == current_user.id).all()
    booking_ids = [b.id for b in rider_bookings]
    rider_payments = db.query(Payment).filter(Payment.booking_id.in_(booking_ids)).all() if booking_ids else []

    # Driver earnings
    driver_rides = db.query(Ride).filter(Ride.driver_id == current_user.id).all()
    ride_ids = [r.id for r in driver_rides]
    driver_bookings = db.query(Booking).filter(Booking.ride_id.in_(ride_ids), Booking.status.in_(["CONFIRMED", "COMPLETED"])).all() if ride_ids else []

    total_driver_earnings = sum(b.subtotal for b in driver_bookings)

    return {
        "rider_payments": [PaymentOut.model_validate(p) for p in rider_payments],
        "driver_earnings": {
            "total_earnings": total_driver_earnings,
            "completed_trips_count": len(driver_bookings),
            "payout_available": total_driver_earnings,
            "payout_status": "READY" if total_driver_earnings > 0 else "NO_BALANCE"
        }
    }
