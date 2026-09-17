export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  photo_url?: string;
  bio?: string;
  emergency_contact?: string;
  rating_avg: number;
  trips_count: number;
  email_verified: boolean;
  phone_verified: boolean;
  is_driver: boolean;
  is_admin: boolean;
  status: string;
  created_at: string;
}

export interface UserPublic {
  id: string;
  name: string;
  photo_url?: string;
  bio?: string;
  rating_avg: number;
  trips_count: number;
  email_verified: boolean;
  phone_verified: boolean;
  is_driver: boolean;
  created_at: string;
}

export interface Vehicle {
  id: string;
  owner_id: string;
  vehicle_type?: 'CAR' | 'BIKE';
  make: string;
  model: string;
  year?: number;
  color: string;
  registration_no: string;
  seats_total: number;
  image_url?: string;
  ac: boolean;
  helmet_provided?: boolean;
  luggage_capacity: string;
  smoking_allowed: boolean;
  pets_allowed: boolean;
  verified: string;
  created_at: string;
}

export interface RideStop {
  id: string;
  ride_id: string;
  stop_order: number;
  place_name: string;
  lat: float;
  lng: float;
  planned_at?: string;
  price_from_origin?: number;
  pickup_allowed: boolean;
  drop_allowed: boolean;
}

type float = number;

export interface Ride {
  id: string;
  driver_id: string;
  vehicle_id?: string;
  ride_type?: 'CARPOOL' | 'BIKEPOOL';
  origin_text: string;
  destination_text: string;
  origin_lat: number;
  origin_lng: number;
  destination_lat: number;
  destination_lng: number;
  departure_at: string;
  estimated_arrival?: string;
  seats_total: number;
  seats_available: number;
  price_per_seat: number;
  status: 'DRAFT' | 'PUBLISHED' | 'FULL' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  booking_mode: 'INSTANT' | 'APPROVAL';
  luggage_size: 'SMALL' | 'MEDIUM' | 'LARGE';
  ac: boolean;
  helmet_provided?: boolean;
  smoking_allowed: boolean;
  pets_allowed: boolean;
  women_only: boolean;
  notes?: string;
  current_lat?: number;
  current_lng?: number;
  driver_arrived_at?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  driver?: UserPublic;
  vehicle?: Vehicle;
  stops?: RideStop[];
}

export interface Payment {
  id: string;
  booking_id: string;
  provider: string; // razorpay, cash, upi, card, netbanking
  provider_order_id?: string;
  provider_payment_id?: string;
  amount: number;
  currency: string;
  status: 'CREATED' | 'AUTHORIZED' | 'CAPTURED' | 'PENDING_CASH' | 'REFUNDED' | 'FAILED';
  refund_amount: number;
  webhook_verified: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  booking_code: string;
  ride_id: string;
  rider_id: string;
  seats: number;
  pickup_stop_name?: string;
  drop_stop_name?: string;
  subtotal: number;
  service_fee: number;
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  booked_at: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  ride?: Ride;
  rider?: UserPublic;
  payment?: Payment;
}

export interface Message {
  id: string;
  booking_id: string;
  sender_id: string;
  sender_name: string;
  body: string;
  is_system: boolean;
  created_at: string;
  read_at?: string;
}

export interface Review {
  id: string;
  booking_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  text?: string;
  punctuality_rating: number;
  driving_rating: number;
  cleanliness_rating: number;
  communication_rating: number;
  created_at: string;
  reviewer?: UserPublic;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  data_json?: string;
  read_at?: string;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  target_user_id?: string;
  ride_id?: string;
  booking_id?: string;
  category: string;
  details: string;
  status: string;
  admin_notes?: string;
  created_at: string;
}

export interface UserVerification {
  id: string;
  user_id: string;
  type: string;
  document_url: string;
  document_number?: string;
  status: string;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  expiry_at?: string;
  created_at: string;
}

export interface AdminStats {
  total_users: number;
  total_drivers: number;
  total_rides: number;
  active_rides: number;
  completed_rides: number;
  total_bookings: number;
  confirmed_bookings: number;
  total_gross_booking_value: number;
  total_platform_revenue: number;
  pending_verifications: number;
  pending_reports: number;
  seat_utilization_rate: number;
}
