from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.entities import Ride, RideStop, Booking, User, Vehicle, Payment
from app.schemas.schemas import RideCreate, RideUpdate, RideOut, BookingOut, ApiResponse
from app.services.notification_service import create_notification

router = APIRouter()


@router.post("", response_model=RideOut)
def create_ride(
    ride_in: RideCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Ensure user has driver mode enabled
    current_user.is_driver = True

    # If vehicle_id is not specified, get user's primary vehicle
    vehicle_id = ride_in.vehicle_id
    if not vehicle_id:
        veh = db.query(Vehicle).filter(Vehicle.owner_id == current_user.id).first()
        if veh:
            vehicle_id = veh.id

    ride = Ride(
        driver_id=current_user.id,
        vehicle_id=vehicle_id,
        origin_text=ride_in.origin_text,
        destination_text=ride_in.destination_text,
        origin_lat=ride_in.origin_lat,
        origin_lng=ride_in.origin_lng,
        destination_lat=ride_in.destination_lat,
        destination_lng=ride_in.destination_lng,
        departure_at=ride_in.departure_at,
        estimated_arrival=ride_in.estimated_arrival,
        seats_total=ride_in.seats_total,
        seats_available=ride_in.seats_total,
        price_per_seat=ride_in.price_per_seat,
        status="PUBLISHED",
        booking_mode=ride_in.booking_mode,
        luggage_size=ride_in.luggage_size,
        ac=ride_in.ac,
        smoking_allowed=ride_in.smoking_allowed,
        pets_allowed=ride_in.pets_allowed,
        women_only=ride_in.women_only,
        notes=ride_in.notes
    )
    db.add(ride)
    db.flush()

    # Add intermediate stops if provided
    if ride_in.stops:
        for stop in ride_in.stops:
            r_stop = RideStop(
                ride_id=ride.id,
                stop_order=stop.stop_order,
                place_name=stop.place_name,
                lat=stop.lat,
                lng=stop.lng,
                planned_at=stop.planned_at,
                price_from_origin=stop.price_from_origin,
                pickup_allowed=stop.pickup_allowed,
                drop_allowed=stop.drop_allowed
            )
            db.add(r_stop)

    db.commit()
    
    # Reload full ride with relations
    full_ride = (
        db.query(Ride)
        .options(
            joinedload(Ride.driver),
            joinedload(Ride.vehicle),
            joinedload(Ride.stops)
        )
        .filter(Ride.id == ride.id)
        .first()
    )
    return full_ride


@router.get("/driver/my-rides", response_model=List[RideOut])
def get_driver_rides(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rides = (
        db.query(Ride)
        .options(
            joinedload(Ride.driver),
            joinedload(Ride.vehicle),
            joinedload(Ride.stops)
        )
        .filter(Ride.driver_id == current_user.id)
        .order_by(Ride.departure_at.desc())
        .all()
    )
    return rides


@router.get("/{ride_id}", response_model=RideOut)
def get_ride(ride_id: str, db: Session = Depends(get_db)):
    ride = (
        db.query(Ride)
        .options(
            joinedload(Ride.driver),
            joinedload(Ride.vehicle),
            joinedload(Ride.stops)
        )
        .filter(Ride.id == ride_id)
        .first()
    )
    if not ride:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ride not found")
    return ride


@router.patch("/{ride_id}", response_model=RideOut)
def update_ride(
    ride_id: str,
    ride_in: RideUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ride = db.query(Ride).filter(Ride.id == ride_id).first()
    if not ride:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ride not found")
    if ride.driver_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to edit this ride")

    update_data = ride_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(ride, field, value)

    db.commit()
    db.refresh(ride)
    return ride


@router.post("/{ride_id}/cancel", response_model=ApiResponse)
def cancel_ride(
    ride_id: str,
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ride = db.query(Ride).filter(Ride.id == ride_id).first()
    if not ride:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ride not found")
    if ride.driver_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to cancel this ride")

    reason = payload.get("reason", "Cancelled by driver")
    ride.status = "CANCELLED"

    # Cancel all confirmed/pending bookings and initiate full refunds
    bookings = db.query(Booking).filter(
        Booking.ride_id == ride.id,
        Booking.status.in_(["PENDING", "CONFIRMED"])
    ).all()

    for booking in bookings:
        booking.status = "CANCELLED"
        booking.cancelled_at = datetime.utcnow()
        booking.cancellation_reason = reason

        payment = db.query(Payment).filter(Payment.booking_id == booking.id).first()
        if payment:
            payment.status = "REFUNDED"
            payment.refund_amount = booking.total

        create_notification(
            db=db,
            user_id=booking.rider_id,
            notif_type="RIDE_CANCELLED",
            title="Trip Cancelled by Driver",
            body=f"Ride from {ride.origin_text} to {ride.destination_text} was cancelled. Full refund of ₹{booking.total} has been issued.",
            data={"ride_id": ride.id, "booking_id": booking.id}
        )

    db.commit()
    return ApiResponse(success=True, message="Ride and all associated bookings cancelled successfully")


@router.post("/{ride_id}/arrive", response_model=RideOut)
def mark_driver_arrived(
    ride_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ride = db.query(Ride).filter(Ride.id == ride_id, Ride.driver_id == current_user.id).first()
    if not ride:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ride not found")

    ride.driver_arrived_at = datetime.utcnow()
    db.commit()

    # Notify riders
    bookings = db.query(Booking).filter(Booking.ride_id == ride.id, Booking.status == "CONFIRMED").all()
    for b in bookings:
        create_notification(
            db=db,
            user_id=b.rider_id,
            notif_type="DRIVER_ARRIVED",
            title="Driver Has Arrived!",
            body=f"Your driver {current_user.name} has arrived at the pickup location.",
            data={"ride_id": ride.id, "booking_id": b.id}
        )

    return ride


@router.post("/{ride_id}/start", response_model=RideOut)
def start_ride(
    ride_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ride = db.query(Ride).filter(Ride.id == ride_id, Ride.driver_id == current_user.id).first()
    if not ride:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ride not found")

    ride.status = "IN_PROGRESS"
    ride.started_at = datetime.utcnow()
    db.commit()

    # Notify riders
    bookings = db.query(Booking).filter(Booking.ride_id == ride.id, Booking.status == "CONFIRMED").all()
    for b in bookings:
        create_notification(
            db=db,
            user_id=b.rider_id,
            notif_type="RIDE_STARTED",
            title="Trip Started!",
            body=f"Your trip to {ride.destination_text} is now underway. Have a safe journey!",
            data={"ride_id": ride.id, "booking_id": b.id}
        )

    return ride


@router.post("/{ride_id}/complete", response_model=RideOut)
def complete_ride(
    ride_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ride = db.query(Ride).filter(Ride.id == ride_id, Ride.driver_id == current_user.id).first()
    if not ride:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ride not found")

    ride.status = "COMPLETED"
    ride.completed_at = datetime.utcnow()
    current_user.trips_count += 1

    # Mark confirmed bookings as completed and increment rider trips_count
    bookings = db.query(Booking).filter(Booking.ride_id == ride.id, Booking.status == "CONFIRMED").all()
    for b in bookings:
        b.status = "COMPLETED"
        if b.payment and b.payment.status == "PENDING_CASH":
            b.payment.status = "CAPTURED"
            
        rider = db.query(User).filter(User.id == b.rider_id).first()
        if rider:
            rider.trips_count += 1

        create_notification(
            db=db,
            user_id=b.rider_id,
            notif_type="RIDE_COMPLETED",
            title="You Have Arrived!",
            body="Your trip is complete! Please take a moment to rate and review your driver.",
            data={"ride_id": ride.id, "booking_id": b.id}
        )

    db.commit()
    return ride


@router.get("/{ride_id}/manifest", response_model=List[BookingOut])
def get_passenger_manifest(
    ride_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ride = db.query(Ride).filter(Ride.id == ride_id).first()
    if not ride:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ride not found")
    if ride.driver_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view manifest")

    manifest = (
        db.query(Booking)
        .options(
            joinedload(Booking.rider),
            joinedload(Booking.ride)
        )
        .filter(Booking.ride_id == ride.id)
        .order_by(Booking.booked_at.desc())
        .all()
    )
    return manifest

