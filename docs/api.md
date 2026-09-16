# CoRide API Documentation

The CoRide backend provides RESTful APIs under `/api/v1` along with bidirectional WebSockets for realtime ride coordination.

## Base URL
- Local: `http://localhost:8000/api/v1`
- Swagger UI Documentation: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Standard Response Convention

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response
```json
{
  "detail": "Descriptive error message"
}
```

---

## Key Endpoints

### Authentication (`/auth`)
- `POST /auth/register`: Register driver or rider account with email & password.
- `POST /auth/login`: Authenticate and receive JWT access & refresh tokens.
- `POST /auth/refresh`: Rotate expired access token.
- `POST /auth/forgot-password`: Request reset token.
- `POST /auth/reset-password`: Update password using token.

### User & Verification (`/me`, `/users`)
- `GET /me`: Get authenticated user profile.
- `PATCH /me`: Update profile info, bio, phone, or emergency contact.
- `GET /me/verifications`: List submitted verification documents.
- `POST /me/verifications`: Submit Driver License / Govt ID for admin review.
- `GET /users/{id}`: Public user profile with rating stats.

### Vehicles (`/vehicles`)
- `GET /vehicles`: List my registered vehicles.
- `POST /vehicles`: Register vehicle specs, registration plate, seats, amenities.
- `DELETE /vehicles/{id}`: Remove vehicle profile.

### Rides & Lifecycle (`/rides`)
- `POST /rides`: Create & publish upcoming ride with intermediate stopovers.
- `GET /rides/{id}`: Full ride details with driver, vehicle, and stop timeline.
- `GET /rides/driver/my-rides`: List all rides published by authenticated driver.
- `POST /rides/{id}/arrive`: Mark driver arrived at pickup location.
- `POST /rides/{id}/start`: Mark ride started (`IN_PROGRESS`).
- `POST /rides/{id}/complete`: Mark ride completed (`COMPLETED`), calculate ratings.
- `POST /rides/{id}/cancel`: Cancel ride with automatic passenger refund dispatch.
- `GET /rides/{id}/manifest`: View confirmed passenger manifest for the driver.

### Search & Discovery (`/search`, `/places`)
- `GET /search`: Search rides by origin, destination, date, seats, price, AC, instant book.
- `GET /places/popular`: Get trending carpooling corridors.
- `GET /places/autocomplete`: Location autocomplete suggestions.

### Bookings & Concurrency (`/rides/{id}/bookings`, `/bookings`)
- `POST /rides/{id}/bookings`: **Atomic seat reservation transaction** with row locking to prevent overselling.
- `GET /bookings/{id}`: Get confirmed boarding pass details with QR code.
- `GET /bookings/my/trips`: List user's booked rides.
- `POST /bookings/{id}/cancel`: Cancel booking and calculate refund amount.

### Realtime In-App Chat (`/bookings/{id}/messages`, `/ws/bookings/{id}`)
- `GET /bookings/{id}/messages`: Message history.
- `POST /bookings/{id}/messages`: Send message via REST.
- `WS /ws/bookings/{id}?token=...`: Bidirectional WebSocket room.

### Payments (`/payments`)
- `POST /payments/verify`: Signature verification & capture.
- `POST /payments/webhook`: Webhook handler.
- `GET /payments/my/transactions`: Driver earnings ledger & rider payment records.

### Safety & Emergency (`/reports`, `/safety`)
- `POST /reports`: File incident or dispute report.
- `POST /reports/sos`: Emergency SOS alert with GPS coordinates broadcast.

### Admin Portal (`/admin`)
- `GET /admin/stats`: Gross booking value, platform revenue, utilization %.
- `GET /admin/verifications`: Pending ID verification queue.
- `POST /admin/verifications/{id}/review`: Approve or reject driver document.
- `GET /admin/reports`: Incident dispute resolution queue.
- `POST /admin/reports/{id}/resolve`: Resolve report with moderator notes.
