import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, Enum
)
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_uuid():
    return str(uuid.uuid4())


def generate_booking_code():
    return f"CR-{uuid.uuid4().hex[:6].upper()}"


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    phone = Column(String(30), nullable=True)
    password_hash = Column(String(255), nullable=False)
    photo_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    emergency_contact = Column(String(100), nullable=True)
    rating_avg = Column(Float, default=5.0)
    trips_count = Column(Integer, default=0)
    email_verified = Column(Boolean, default=True)
    phone_verified = Column(Boolean, default=False)
    is_driver = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)
    status = Column(String(30), default="ACTIVE")  # ACTIVE, SUSPENDED, DEACTIVATED

    # Relationships
    vehicles = relationship("Vehicle", back_populates="owner", cascade="all, delete-orphan")
    driver_rides = relationship("Ride", back_populates="driver", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="rider", cascade="all, delete-orphan")
    verifications = relationship("UserVerification", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    saved_places = relationship("SavedPlace", back_populates="user", cascade="all, delete-orphan")


class UserVerification(Base):
    __tablename__ = "user_verifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    type = Column(String(50), nullable=False)  # DRIVER_LICENSE, GOVT_ID, STUDENT_ID
    document_url = Column(String(500), nullable=False)
    document_number = Column(String(100), nullable=True)
    status = Column(String(30), default="PENDING")  # PENDING, VERIFIED, REJECTED, EXPIRED
    reviewed_by = Column(String(36), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    expiry_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="verifications")


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    owner_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    vehicle_type = Column(String(30), default="CAR")  # CAR, BIKE
    make = Column(String(50), nullable=False)  # e.g. Hyundai, Honda, Tata, Royal Enfield
    model = Column(String(50), nullable=False)  # e.g. Creta, City, Nexon, Classic 350
    year = Column(Integer, nullable=True, default=2022)
    color = Column(String(30), nullable=False)
    registration_no = Column(String(50), unique=True, index=True, nullable=False)
    seats_total = Column(Integer, default=4, nullable=False)
    image_url = Column(String(500), nullable=True)
    ac = Column(Boolean, default=True)
    helmet_provided = Column(Boolean, default=False)
    luggage_capacity = Column(String(30), default="MEDIUM")  # SMALL, MEDIUM, LARGE
    smoking_allowed = Column(Boolean, default=False)
    pets_allowed = Column(Boolean, default=False)
    verified = Column(String(30), default="VERIFIED")  # PENDING, VERIFIED, REJECTED

    owner = relationship("User", back_populates="vehicles")
    rides = relationship("Ride", back_populates="vehicle")


class Ride(Base):
    __tablename__ = "rides"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    driver_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    vehicle_id = Column(String(36), ForeignKey("vehicles.id"), nullable=True)
    ride_type = Column(String(30), default="CARPOOL")  # CARPOOL, BIKEPOOL
    origin_text = Column(String(200), nullable=False, index=True)
    destination_text = Column(String(200), nullable=False, index=True)
    origin_lat = Column(Float, nullable=False)
    origin_lng = Column(Float, nullable=False)
    destination_lat = Column(Float, nullable=False)
    destination_lng = Column(Float, nullable=False)
    departure_at = Column(DateTime, nullable=False, index=True)
    estimated_arrival = Column(DateTime, nullable=True)
    seats_total = Column(Integer, default=3, nullable=False)
    seats_available = Column(Integer, default=3, nullable=False)
    price_per_seat = Column(Float, nullable=False)
    status = Column(String(30), default="PUBLISHED", index=True)  # DRAFT, PUBLISHED, FULL, IN_PROGRESS, COMPLETED, CANCELLED, EXPIRED
    booking_mode = Column(String(30), default="INSTANT")  # INSTANT, APPROVAL
    luggage_size = Column(String(30), default="MEDIUM")  # SMALL, MEDIUM, LARGE
    ac = Column(Boolean, default=True)
    helmet_provided = Column(Boolean, default=False)
    smoking_allowed = Column(Boolean, default=False)
    pets_allowed = Column(Boolean, default=False)
    women_only = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    current_lat = Column(Float, nullable=True)
    current_lng = Column(Float, nullable=True)
    driver_arrived_at = Column(DateTime, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    driver = relationship("User", back_populates="driver_rides")
    vehicle = relationship("Vehicle", back_populates="rides")
    stops = relationship("RideStop", back_populates="ride", order_by="RideStop.stop_order", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="ride", cascade="all, delete-orphan")


class RideStop(Base):
    __tablename__ = "ride_stops"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    ride_id = Column(String(36), ForeignKey("rides.id"), nullable=False)
    stop_order = Column(Integer, nullable=False)
    place_name = Column(String(200), nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    planned_at = Column(DateTime, nullable=True)
    price_from_origin = Column(Float, nullable=True)
    pickup_allowed = Column(Boolean, default=True)
    drop_allowed = Column(Boolean, default=True)

    ride = relationship("Ride", back_populates="stops")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    booking_code = Column(String(30), unique=True, default=generate_booking_code, index=True)
    ride_id = Column(String(36), ForeignKey("rides.id"), nullable=False, index=True)
    rider_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    seats = Column(Integer, default=1, nullable=False)
    pickup_stop_name = Column(String(200), nullable=True)
    drop_stop_name = Column(String(200), nullable=True)
    subtotal = Column(Float, nullable=False)
    service_fee = Column(Float, default=0.0)
    total = Column(Float, nullable=False)
    status = Column(String(30), default="CONFIRMED", index=True)  # PENDING, CONFIRMED, REJECTED, CANCELLED, COMPLETED, NO_SHOW
    booked_at = Column(DateTime, default=datetime.utcnow)
    cancelled_at = Column(DateTime, nullable=True)
    cancellation_reason = Column(Text, nullable=True)

    ride = relationship("Ride", back_populates="bookings")
    rider = relationship("User", back_populates="bookings")
    payment = relationship("Payment", back_populates="booking", uselist=False, cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="booking", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="booking", cascade="all, delete-orphan")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    booking_id = Column(String(36), ForeignKey("bookings.id"), nullable=False, unique=True)
    provider = Column(String(30), default="razorpay")  # razorpay, stripe, mock
    provider_order_id = Column(String(100), nullable=True)
    provider_payment_id = Column(String(100), nullable=True)
    provider_signature = Column(String(200), nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    status = Column(String(30), default="CAPTURED")  # CREATED, AUTHORIZED, CAPTURED, REFUNDED, FAILED
    refund_amount = Column(Float, default=0.0)
    webhook_verified = Column(Boolean, default=True)

    booking = relationship("Booking", back_populates="payment")


class Message(Base):
    __tablename__ = "messages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    booking_id = Column(String(36), ForeignKey("bookings.id"), nullable=False, index=True)
    sender_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    sender_name = Column(String(100), nullable=False)
    body = Column(Text, nullable=False)
    is_system = Column(Boolean, default=False)
    read_at = Column(DateTime, nullable=True)

    booking = relationship("Booking", back_populates="messages")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    booking_id = Column(String(36), ForeignKey("bookings.id"), nullable=False)
    reviewer_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    reviewee_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, default=5, nullable=False)
    text = Column(Text, nullable=True)
    punctuality_rating = Column(Integer, default=5)
    driving_rating = Column(Integer, default=5)
    cleanliness_rating = Column(Integer, default=5)
    communication_rating = Column(Integer, default=5)
    hidden_at = Column(DateTime, nullable=True)

    booking = relationship("Booking", back_populates="reviews")
    reviewer = relationship("User", foreign_keys=[reviewer_id])
    reviewee = relationship("User", foreign_keys=[reviewee_id])


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    type = Column(String(50), nullable=False)  # BOOKING_CONFIRMED, RIDE_UPDATE, PAYMENT_SUCCESS, CHAT, SOS, VERIFICATION
    title = Column(String(150), nullable=False)
    body = Column(Text, nullable=False)
    data_json = Column(Text, nullable=True)
    read_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="notifications")


class Report(Base):
    __tablename__ = "reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    reporter_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    target_user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    ride_id = Column(String(36), ForeignKey("rides.id"), nullable=True)
    booking_id = Column(String(36), ForeignKey("bookings.id"), nullable=True)
    category = Column(String(50), nullable=False)  # SAFETY, NO_SHOW, HARASSMENT, VEHICLE_MISMATCH, OVERCHARGING, OTHER
    details = Column(Text, nullable=False)
    status = Column(String(30), default="PENDING")  # PENDING, UNDER_REVIEW, RESOLVED, DISMISSED
    admin_notes = Column(Text, nullable=True)


class SavedPlace(Base):
    __tablename__ = "saved_places"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    label = Column(String(50), nullable=False)  # Home, Work, University
    address = Column(String(200), nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)

    user = relationship("User", back_populates="saved_places")


class AdminAuditLog(Base):
    __tablename__ = "admin_audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    admin_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(String(36), nullable=False)
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

