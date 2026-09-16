from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr, Field, ConfigDict


# Generic API response convention
class ApiResponse(BaseModel):
    success: bool = True
    message: Optional[str] = "Operation successful"
    data: Optional[Any] = None


class ApiError(BaseModel):
    success: bool = False
    error: Dict[str, str]


# --- Auth & User Schemas ---
class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    photo_url: Optional[str] = None
    bio: Optional[str] = None
    emergency_contact: Optional[str] = None


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    is_driver: Optional[bool] = False


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    token: str
    new_password: str


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    photo_url: Optional[str] = None
    bio: Optional[str] = None
    emergency_contact: Optional[str] = None
    is_driver: Optional[bool] = None


class UserOut(UserBase):
    id: str
    rating_avg: float
    trips_count: int
    email_verified: bool
    phone_verified: bool
    is_driver: bool
    is_admin: bool
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserPublicOut(BaseModel):
    id: str
    name: str
    photo_url: Optional[str] = None
    bio: Optional[str] = None
    rating_avg: float
    trips_count: int
    email_verified: bool
    phone_verified: bool
    is_driver: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Vehicle Schemas ---
class VehicleBase(BaseModel):
    make: str
    model: str
    year: Optional[int] = 2023
    color: str
    registration_no: str
    seats_total: int = 4
    image_url: Optional[str] = None
    ac: bool = True
    luggage_capacity: str = "MEDIUM"
    smoking_allowed: bool = False
    pets_allowed: bool = False


class VehicleCreate(VehicleBase):
    pass


class VehicleUpdate(BaseModel):
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    color: Optional[str] = None
    registration_no: Optional[str] = None
    seats_total: Optional[int] = None
    image_url: Optional[str] = None
    ac: Optional[bool] = None
    luggage_capacity: Optional[str] = None
    smoking_allowed: Optional[bool] = None
    pets_allowed: Optional[bool] = None


class VehicleOut(VehicleBase):
    id: str
    owner_id: str
    verified: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Ride Stop Schemas ---
class RideStopBase(BaseModel):
    stop_order: int
    place_name: str
    lat: float
    lng: float
    planned_at: Optional[datetime] = None
    price_from_origin: Optional[float] = None
    pickup_allowed: bool = True
    drop_allowed: bool = True


class RideStopCreate(RideStopBase):
    pass


class RideStopOut(RideStopBase):
    id: str
    ride_id: str

    model_config = ConfigDict(from_attributes=True)


# --- Ride Schemas ---
class RideBase(BaseModel):
    origin_text: str
    destination_text: str
    origin_lat: float
    origin_lng: float
    destination_lat: float
    destination_lng: float
    departure_at: datetime
    estimated_arrival: Optional[datetime] = None
    seats_total: int = 3
    price_per_seat: float
    booking_mode: str = "INSTANT"
    luggage_size: str = "MEDIUM"
    ac: bool = True
    smoking_allowed: bool = False
    pets_allowed: bool = False
    women_only: bool = False
    notes: Optional[str] = None


class RideCreate(RideBase):
    vehicle_id: Optional[str] = None
    stops: Optional[List[RideStopCreate]] = []


class RideUpdate(BaseModel):
    departure_at: Optional[datetime] = None
    estimated_arrival: Optional[datetime] = None
    seats_available: Optional[int] = None
    price_per_seat: Optional[float] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    current_lat: Optional[float] = None
    current_lng: Optional[float] = None


class RideOut(RideBase):
    id: str
    driver_id: str
    vehicle_id: Optional[str] = None
    seats_available: int
    status: str
    current_lat: Optional[float] = None
    current_lng: Optional[float] = None
    driver_arrived_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    driver: Optional[UserPublicOut] = None
    vehicle: Optional[VehicleOut] = None
    stops: List[RideStopOut] = []

    model_config = ConfigDict(from_attributes=True)


# --- Booking Schemas ---
class BookingCreate(BaseModel):
    seats: int = Field(default=1, ge=1, le=6)
    pickup_stop_name: Optional[str] = None
    drop_stop_name: Optional[str] = None


class BookingCancelRequest(BaseModel):
    cancellation_reason: Optional[str] = None


# --- Payment Schemas ---
class PaymentOrderCreate(BaseModel):
    booking_id: str
    provider: Optional[str] = "razorpay"


class PaymentVerifyRequest(BaseModel):
    booking_id: str
    provider_payment_id: Optional[str] = None
    provider: Optional[str] = "razorpay"
    provider_order_id: Optional[str] = None
    provider_signature: Optional[str] = None


class PaymentOut(BaseModel):
    id: str
    booking_id: str
    provider: str
    provider_order_id: Optional[str] = None
    provider_payment_id: Optional[str] = None
    amount: float
    currency: str
    status: str
    refund_amount: float
    webhook_verified: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BookingOut(BaseModel):
    id: str
    booking_code: str
    ride_id: str
    rider_id: str
    seats: int
    pickup_stop_name: Optional[str] = None
    drop_stop_name: Optional[str] = None
    subtotal: float
    service_fee: float
    total: float
    status: str
    booked_at: datetime
    cancelled_at: Optional[datetime] = None
    cancellation_reason: Optional[str] = None
    ride: Optional[RideOut] = None
    rider: Optional[UserPublicOut] = None
    payment: Optional[PaymentOut] = None

    model_config = ConfigDict(from_attributes=True)


# --- Chat Message Schemas ---
class MessageCreate(BaseModel):
    body: str


class MessageOut(BaseModel):
    id: str
    booking_id: str
    sender_id: str
    sender_name: str
    body: str
    is_system: bool
    created_at: datetime
    read_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# --- Review Schemas ---
class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    text: Optional[str] = None
    punctuality_rating: Optional[int] = Field(default=5, ge=1, le=5)
    driving_rating: Optional[int] = Field(default=5, ge=1, le=5)
    cleanliness_rating: Optional[int] = Field(default=5, ge=1, le=5)
    communication_rating: Optional[int] = Field(default=5, ge=1, le=5)


class ReviewOut(BaseModel):
    id: str
    booking_id: str
    reviewer_id: str
    reviewee_id: str
    rating: int
    text: Optional[str] = None
    punctuality_rating: int
    driving_rating: int
    cleanliness_rating: int
    communication_rating: int
    created_at: datetime
    reviewer: Optional[UserPublicOut] = None

    model_config = ConfigDict(from_attributes=True)


# --- Notification Schemas ---
class NotificationOut(BaseModel):
    id: str
    user_id: str
    type: str
    title: str
    body: str
    data_json: Optional[str] = None
    read_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Report & Safety Schemas ---
class ReportCreate(BaseModel):
    target_user_id: Optional[str] = None
    ride_id: Optional[str] = None
    booking_id: Optional[str] = None
    category: str
    details: str


class SOSAlertRequest(BaseModel):
    ride_id: Optional[str] = None
    booking_id: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    message: Optional[str] = "Emergency SOS triggered from CoRide app."


class ReportOut(BaseModel):
    id: str
    reporter_id: str
    target_user_id: Optional[str] = None
    ride_id: Optional[str] = None
    booking_id: Optional[str] = None
    category: str
    details: str
    status: str
    admin_notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- User Verification Schemas ---
class UserVerificationCreate(BaseModel):
    type: str
    document_url: str
    document_number: Optional[str] = None


class UserVerificationOut(BaseModel):
    id: str
    user_id: str
    type: str
    document_url: str
    document_number: Optional[str] = None
    status: str
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    expiry_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Admin Dashboard Stats & Security ---
class AdminStatsOut(BaseModel):
    total_users: int
    total_drivers: int
    total_rides: int
    active_rides: int
    completed_rides: int
    total_bookings: int
    confirmed_bookings: int
    total_gross_booking_value: float
    total_platform_revenue: float
    pending_verifications: int
    pending_reports: int
    seat_utilization_rate: float


class AdminUnlockRequest(BaseModel):
    pin: Optional[str] = None
    key: Optional[str] = None


class AdminChangePinRequest(BaseModel):
    current_pin: str
    new_pin: str


class AdminAuditLogOut(BaseModel):
    id: str
    admin_id: str
    action: str
    entity_type: str
    entity_id: str
    metadata_json: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

