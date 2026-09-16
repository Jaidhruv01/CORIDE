from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.entities import Ride, Booking, Payment, User
from app.core.config import settings
from app.services.notification_service import create_notification


def reserve_seats_atomic(
    db: Session,
    ride_id: str,
    rider: User,
    seats: int = 1,
    pickup_stop: Optional[str] = None,
    drop_stop: Optional[str] = None
) -> Booking:
    # 1. Begin atomic transaction / query ride
    # If using postgresql, query.with_for_update() is used. For sqlite, transaction is serialized.
    try:
        if db.bind.dialect.name == "postgresql":
            ride = db.query(Ride).filter(Ride.id == ride_id).with_for_update().first()
        else:
            ride = db.query(Ride).filter(Ride.id == ride_id).first()

        if not ride:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ride not found"
            )

        if ride.driver_id == rider.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot book seats on your own ride"
            )

        if ride.status != "PUBLISHED":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ride is not available for booking (Status: {ride.status})"
            )

        if ride.seats_available < seats:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Not enough seats available. Requested: {seats}, Available: {ride.seats_available}"
            )

        # 2. Calculate fare & fees
        subtotal = round(ride.price_per_seat * seats, 2)
        fee_calc = subtotal * (settings.PLATFORM_FEE_PERCENTAGE / 100.0)
        service_fee = round(max(settings.MIN_PLATFORM_FEE, fee_calc), 2)
        total = round(subtotal + service_fee, 2)

        booking_status = "CONFIRMED" if ride.booking_mode == "INSTANT" else "PENDING"

        # 3. Create booking
        booking = Booking(
            ride_id=ride.id,
            rider_id=rider.id,
            seats=seats,
            pickup_stop_name=pickup_stop or ride.origin_text,
            drop_stop_name=drop_stop or ride.destination_text,
            subtotal=subtotal,
            service_fee=service_fee,
            total=total,
            status=booking_status
        )
        db.add(booking)
        db.flush()  # assign booking.id

        # 4. Create initial Payment record
        payment = Payment(
            booking_id=booking.id,
            provider="razorpay",
            provider_order_id=f"order_{booking.booking_code}",
            provider_payment_id=f"pay_{booking.booking_code}_simulated",
            amount=total,
            currency="INR",
            status="CAPTURED" if booking_status == "CONFIRMED" else "CREATED",
            webhook_verified=True
        )
        db.add(payment)

        # 5. Decrement seats
        ride.seats_available -= seats
        if ride.seats_available == 0:
            ride.status = "FULL"

        db.commit()
        db.refresh(booking)

        # 6. Notify Driver and Rider
        if booking_status == "PENDING":
          create_notification(
              db=db,
              user_id=ride.driver_id,
              notif_type="BOOKING_REQUEST",
              title="New Booking Request!",
              body=f"{rider.name} requested {seats} seat(s) on your ride from {ride.origin_text} to {ride.destination_text}. Review and accept or decline.",
              data={"booking_id": booking.id, "ride_id": ride.id}
          )
          create_notification(
              db=db,
              user_id=rider.id,
              notif_type="BOOKING_PENDING",
              title="Booking Request Sent",
              body=f"Your request for {seats} seat(s) on {ride.origin_text} -> {ride.destination_text} is waiting for driver approval.",
              data={"booking_id": booking.id, "ride_id": ride.id}
          )
        else:
          create_notification(
              db=db,
              user_id=ride.driver_id,
              notif_type="BOOKING_NEW",
              title="New Seat Reservation!",
              body=f"{rider.name} booked {seats} seat(s) on your ride from {ride.origin_text} to {ride.destination_text}.",
              data={"booking_id": booking.id, "ride_id": ride.id}
          )
          create_notification(
              db=db,
              user_id=rider.id,
              notif_type="BOOKING_CONFIRMED",
              title="Ride Booked Successfully!",
              body=f"Your seat(s) from {booking.pickup_stop_name} to {booking.drop_stop_name} are confirmed! Booking Code: {booking.booking_code}",
              data={"booking_id": booking.id, "ride_id": ride.id}
          )

        return booking


    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete seat reservation: {str(e)}"
        )


def cancel_booking_service(
    db: Session,
    booking_id: str,
    user_id: str,
    reason: Optional[str] = None
) -> Booking:
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    ride = db.query(Ride).filter(Ride.id == booking.ride_id).first()
    if not ride:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Associated ride not found")

    is_rider = booking.rider_id == user_id
    is_driver = ride.driver_id == user_id
    is_admin = db.query(User).filter(User.id == user_id, User.is_admin.is_(True)).first() is not None

    if not (is_rider or is_driver or is_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to cancel this booking")

    if booking.status in ["CANCELLED", "REJECTED", "COMPLETED"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Booking is already {booking.status}")

    # Restore seats
    ride.seats_available += booking.seats
    if ride.status == "FULL" and ride.seats_available > 0:
        ride.status = "PUBLISHED"

    booking.status = "CANCELLED"
    booking.cancelled_at = datetime.utcnow()
    booking.cancellation_reason = reason or "Cancelled by user"

    # Refund calculation
    # If cancelled by driver or > 2 hours before departure -> full refund
    now = datetime.utcnow()
    time_diff = ride.departure_at - now
    hours_before = time_diff.total_seconds() / 3600.0

    refund_amount = booking.total
    if is_rider and hours_before < 2.0 and hours_before > 0:
        # 50% refund for late rider cancellation
        refund_amount = round(booking.subtotal * 0.5, 2)
    elif is_rider and hours_before <= 0:
        # No refund post departure
        refund_amount = 0.0

    payment = db.query(Payment).filter(Payment.booking_id == booking.id).first()
    if payment:
        payment.status = "REFUNDED" if refund_amount > 0 else payment.status
        payment.refund_amount = refund_amount

    db.commit()
    db.refresh(booking)

    # Notify counterpart
    if is_rider:
        create_notification(
            db=db,
            user_id=ride.driver_id,
            notif_type="BOOKING_CANCELLED",
            title="Passenger Cancelled Booking",
            body=f"A passenger cancelled their booking for {ride.origin_text} -> {ride.destination_text}. {booking.seats} seat(s) restored.",
            data={"booking_id": booking.id, "ride_id": ride.id}
        )
    else:
        create_notification(
            db=db,
            user_id=booking.rider_id,
            notif_type="BOOKING_CANCELLED",
            title="Ride Cancelled by Driver",
            body=f"Your booking {booking.booking_code} was cancelled. A refund of ₹{refund_amount} has been initiated.",
            data={"booking_id": booking.id, "ride_id": ride.id}
        )

    return booking
