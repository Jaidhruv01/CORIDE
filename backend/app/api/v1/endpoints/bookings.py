from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.entities import Booking, Ride, User, Payment
from app.schemas.schemas import BookingCreate, BookingCancelRequest, BookingOut, ApiResponse
from app.services.booking_service import reserve_seats_atomic, cancel_booking_service
from app.services.notification_service import create_notification

router = APIRouter()


@router.post("/rides/{ride_id}/bookings", response_model=BookingOut)
def create_booking(
    ride_id: str,
    booking_in: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = reserve_seats_atomic(
        db=db,
        ride_id=ride_id,
        rider=current_user,
        seats=booking_in.seats,
        pickup_stop=booking_in.pickup_stop_name,
        drop_stop=booking_in.drop_stop_name
    )
    # Reload full booking with relations
    return (
        db.query(Booking)
        .options(
            joinedload(Booking.ride).joinedload(Ride.driver),
            joinedload(Booking.ride).joinedload(Ride.vehicle),
            joinedload(Booking.rider)
        )
        .filter(Booking.id == booking.id)
        .first()
    )


@router.get("/bookings/my/trips", response_model=List[BookingOut])
def get_my_trips(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bookings = (
        db.query(Booking)
        .options(
            joinedload(Booking.ride).joinedload(Ride.driver),
            joinedload(Booking.ride).joinedload(Ride.vehicle),
            joinedload(Booking.rider)
        )
        .filter(Booking.rider_id == current_user.id)
        .order_by(Booking.booked_at.desc())
        .all()
    )
    return bookings


@router.get("/bookings/{booking_id}", response_model=BookingOut)
def get_booking(
    booking_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = (
        db.query(Booking)
        .options(
            joinedload(Booking.ride).joinedload(Ride.driver),
            joinedload(Booking.ride).joinedload(Ride.vehicle),
            joinedload(Booking.rider)
        )
        .filter(Booking.id == booking_id)
        .first()
    )
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    is_rider = booking.rider_id == current_user.id
    is_driver = booking.ride.driver_id == current_user.id if booking.ride else False
    if not (is_rider or is_driver or current_user.is_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this booking")

    return booking


@router.post("/bookings/{booking_id}/cancel", response_model=BookingOut)
def cancel_booking(
    booking_id: str,
    req: BookingCancelRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = cancel_booking_service(
        db=db,
        booking_id=booking_id,
        user_id=current_user.id,
        reason=req.cancellation_reason
    )
    return (
        db.query(Booking)
        .options(
            joinedload(Booking.ride).joinedload(Ride.driver),
            joinedload(Booking.ride).joinedload(Ride.vehicle),
            joinedload(Booking.rider)
        )
        .filter(Booking.id == booking.id)
        .first()
    )


@router.get("/bookings/driver/requests", response_model=List[BookingOut])
def get_driver_booking_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    driver_rides = db.query(Ride.id).filter(Ride.driver_id == current_user.id).all()
    driver_ride_ids = [r[0] for r in driver_rides]
    if not driver_ride_ids:
        return []

    bookings = (
        db.query(Booking)
        .options(
            joinedload(Booking.ride).joinedload(Ride.driver),
            joinedload(Booking.ride).joinedload(Ride.vehicle),
            joinedload(Booking.rider)
        )
        .filter(Booking.ride_id.in_(driver_ride_ids))
        .order_by(Booking.booked_at.desc())
        .all()
    )
    return bookings


@router.post("/bookings/{booking_id}/accept", response_model=BookingOut)
def accept_booking(
    booking_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    ride = db.query(Ride).filter(Ride.id == booking.ride_id).first()
    if not ride or (ride.driver_id != current_user.id and not current_user.is_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    booking.status = "CONFIRMED"

    # Update payment if exists
    payment = db.query(Payment).filter(Payment.booking_id == booking.id).first()
    if payment and payment.status != "CAPTURED":
        payment.status = "CAPTURED"

    db.commit()

    create_notification(
        db=db,
        user_id=booking.rider_id,
        notif_type="BOOKING_ACCEPTED",
        title="Booking Request Accepted! 🎉",
        body=f"Your driver accepted your booking {booking.booking_code} for {ride.origin_text} -> {ride.destination_text}.",
        data={"booking_id": booking.id, "ride_id": ride.id}
    )

    return (
        db.query(Booking)
        .options(
            joinedload(Booking.ride).joinedload(Ride.driver),
            joinedload(Booking.ride).joinedload(Ride.vehicle),
            joinedload(Booking.rider)
        )
        .filter(Booking.id == booking.id)
        .first()
    )


@router.post("/bookings/{booking_id}/reject", response_model=BookingOut)
def reject_booking(
    booking_id: str,
    payload: dict = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    ride = db.query(Ride).filter(Ride.id == booking.ride_id).first()
    if not ride or (ride.driver_id != current_user.id and not current_user.is_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    if booking.status in ["PENDING", "CONFIRMED"]:
        # Restore seats
        ride.seats_available += booking.seats
        if ride.status == "FULL":
            ride.status = "PUBLISHED"

    booking.status = "REJECTED"
    booking.cancellation_reason = (payload or {}).get("reason", "Declined by driver")

    payment = db.query(Payment).filter(Payment.booking_id == booking.id).first()
    if payment:
        payment.status = "REFUNDED"
        payment.refund_amount = booking.total

    db.commit()

    create_notification(
        db=db,
        user_id=booking.rider_id,
        notif_type="BOOKING_REJECTED",
        title="Booking Request Declined",
        body=f"Your booking request for {ride.origin_text} -> {ride.destination_text} was declined by the driver.",
        data={"booking_id": booking.id, "ride_id": ride.id}
    )

    return (
        db.query(Booking)
        .options(
            joinedload(Booking.ride).joinedload(Ride.driver),
            joinedload(Booking.ride).joinedload(Ride.vehicle),
            joinedload(Booking.rider)
        )
        .filter(Booking.id == booking.id)
        .first()
    )

