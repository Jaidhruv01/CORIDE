import pytest
from datetime import datetime, timedelta
from app.core.security import get_password_hash, create_access_token
from app.models.entities import User, Vehicle, Ride, Booking, Payment


@pytest.fixture
def driver_and_rider(db):
    driver = User(
        id="usr-test-driver-acc",
        name="Driver Ace",
        email="driver.ace@example.com",
        password_hash=get_password_hash("pass123"),
        is_driver=True
    )
    rider = User(
        id="usr-test-rider-acc",
        name="Rider Sam",
        email="rider.sam@example.com",
        password_hash=get_password_hash("pass123"),
        is_driver=False
    )
    db.add(driver)
    db.add(rider)
    db.commit()

    ride = Ride(
        id="ride-test-acc-01",
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
        price_per_seat=300.0,
        status="PUBLISHED",
        booking_mode="APPROVAL"
    )
    db.add(ride)
    db.commit()

    booking = Booking(
        id="bk-test-req-01",
        ride_id=ride.id,
        rider_id=rider.id,
        seats=1,
        subtotal=300.0,
        service_fee=0.0,
        total=300.0,
        status="PENDING",
        booking_code="CR-TEST01"
    )
    db.add(booking)
    db.commit()

    driver_token = create_access_token(subject=driver.id)
    rider_token = create_access_token(subject=rider.id)

    return {
        "driver": driver,
        "rider": rider,
        "ride": ride,
        "booking": booking,
        "driver_token": driver_token,
        "rider_token": rider_token,
    }


def test_driver_accept_booking(client, driver_and_rider):
    headers = {"Authorization": f"Bearer {driver_and_rider['driver_token']}"}
    booking_id = driver_and_rider["booking"].id

    response = client.post(f"/api/v1/bookings/{booking_id}/accept", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "CONFIRMED"


def test_driver_reject_booking(client, driver_and_rider):
    headers = {"Authorization": f"Bearer {driver_and_rider['driver_token']}"}
    booking_id = driver_and_rider["booking"].id

    response = client.post(
        f"/api/v1/bookings/{booking_id}/reject",
        json={"reason": "Car luggage is full"},
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "REJECTED"


def test_unauthorized_user_cannot_accept(client, driver_and_rider):
    headers = {"Authorization": f"Bearer {driver_and_rider['rider_token']}"}
    booking_id = driver_and_rider["booking"].id

    response = client.post(f"/api/v1/bookings/{booking_id}/accept", headers=headers)
    assert response.status_code == 403
