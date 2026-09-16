import pytest
from datetime import datetime, timedelta
from app.models.entities import User, Vehicle, Ride, Booking, Payment
from app.core.security import create_access_token


@pytest.fixture
def payment_test_setup(db):
    rider = User(
        id="usr-pay-rider-01",
        email="pay_rider@coride.com",
        phone="+919876543201",
        name="Cash Rider",
        password_hash="mock_hash",
        is_driver=False
    )
    driver = User(
        id="usr-pay-driver-01",
        email="pay_driver@coride.com",
        phone="+919876543202",
        name="Cash Driver",
        password_hash="mock_hash",
        is_driver=True
    )
    db.add_all([rider, driver])
    db.commit()

    ride = Ride(
        id="ride-pay-01",
        driver_id=driver.id,
        origin_text="Bangalore",
        destination_text="Mysore",
        origin_lat=12.9716,
        origin_lng=77.5946,
        destination_lat=12.2958,
        destination_lng=76.6394,
        departure_at=datetime.utcnow() + timedelta(days=1),
        seats_total=3,
        seats_available=2,
        price_per_seat=250.0,
        status="PUBLISHED",
        booking_mode="INSTANT"
    )
    db.add(ride)
    db.commit()

    booking = Booking(
        id="bk-pay-01",
        ride_id=ride.id,
        rider_id=rider.id,
        seats=2,
        subtotal=500.0,
        service_fee=0.0,
        total=500.0,
        status="PENDING",
        booking_code="CR-CASH01"
    )
    db.add(booking)
    db.commit()

    rider_token = create_access_token(subject=rider.id)
    driver_token = create_access_token(subject=driver.id)

    return {
        "rider": rider,
        "driver": driver,
        "ride": ride,
        "booking": booking,
        "rider_token": rider_token,
        "driver_token": driver_token
    }


def test_select_cash_payment_method(client, payment_test_setup, db):
    headers = {"Authorization": f"Bearer {payment_test_setup['rider_token']}"}
    booking_id = payment_test_setup["booking"].id

    # Select Cash Payment Method
    resp = client.post(
        "/api/v1/payments/verify",
        json={
            "booking_id": booking_id,
            "provider": "cash",
            "provider_payment_id": f"cash_{payment_test_setup['booking'].booking_code}",
            "provider_signature": "cash_on_pickup_agreed"
        },
        headers=headers
    )

    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["data"]["provider"] == "cash"
    assert data["data"]["status"] == "PENDING_CASH"

    # Verify payment entity in DB
    payment = db.query(Payment).filter(Payment.booking_id == booking_id).first()
    assert payment is not None
    assert payment.provider == "cash"
    assert payment.status == "PENDING_CASH"
    assert payment.amount == 500.0


def test_complete_ride_captures_cash(client, payment_test_setup, db):
    # Setup booking with cash payment and confirmed status
    booking = payment_test_setup["booking"]
    booking.status = "CONFIRMED"
    
    payment = Payment(
        booking_id=booking.id,
        provider="cash",
        amount=500.0,
        currency="INR",
        status="PENDING_CASH",
        provider_payment_id="cash_code_test"
    )
    db.add(payment)
    db.commit()

    # Driver completes the ride
    driver_headers = {"Authorization": f"Bearer {payment_test_setup['driver_token']}"}
    resp = client.post(
        f"/api/v1/rides/{payment_test_setup['ride'].id}/complete",
        headers=driver_headers
    )
    assert resp.status_code == 200

    # Verify DB state
    db.refresh(payment)
    assert payment.status == "CAPTURED"
