from datetime import datetime, timedelta


def test_booking_and_atomic_seat_reduction(client):
    # 1. Register Driver & Rider
    driver_res = client.post(
        "/api/v1/auth/register",
        json={"name": "Driver One", "email": "d1@example.com", "password": "pass", "is_driver": True}
    )
    driver_token = driver_res.json()["access_token"]
    driver_headers = {"Authorization": f"Bearer {driver_token}"}

    rider_res = client.post(
        "/api/v1/auth/register",
        json={"name": "Rider One", "email": "r1@example.com", "password": "pass"}
    )
    rider_token = rider_res.json()["access_token"]
    rider_headers = {"Authorization": f"Bearer {rider_token}"}

    rider2_res = client.post(
        "/api/v1/auth/register",
        json={"name": "Rider Two", "email": "r2@example.com", "password": "pass"}
    )
    rider2_token = rider2_res.json()["access_token"]
    rider2_headers = {"Authorization": f"Bearer {rider2_token}"}

    # 2. Driver publishes a ride with 2 seats total
    dep_time = (datetime.utcnow() + timedelta(days=2)).isoformat()
    ride_res = client.post(
        "/api/v1/rides",
        headers=driver_headers,
        json={
            "origin_text": "City A",
            "destination_text": "City B",
            "origin_lat": 12.97,
            "origin_lng": 77.59,
            "destination_lat": 12.29,
            "destination_lng": 76.63,
            "departure_at": dep_time,
            "seats_total": 2,
            "price_per_seat": 300.0,
            "booking_mode": "INSTANT"
        }
    )
    assert ride_res.status_code == 200
    ride_id = ride_res.json()["id"]

    # 3. Rider 1 books 2 seats -> should succeed
    b1_res = client.post(
        f"/api/v1/rides/{ride_id}/bookings",
        headers=rider_headers,
        json={"seats": 2}
    )
    assert b1_res.status_code == 200
    b1_data = b1_res.json()
    assert b1_data["seats"] == 2
    assert b1_data["status"] == "CONFIRMED"

    # 4. Check ride availability -> seats_available should now be 0, status FULL
    check_ride = client.get(f"/api/v1/rides/{ride_id}")
    assert check_ride.json()["seats_available"] == 0
    assert check_ride.json()["status"] == "FULL"

    # 5. Rider 2 attempts to book 1 seat on the full ride -> must be rejected
    b2_res = client.post(
        f"/api/v1/rides/{ride_id}/bookings",
        headers=rider2_headers,
        json={"seats": 1}
    )
    assert b2_res.status_code == 400

    # 6. Rider 1 cancels booking -> seats restored to 2, status back to PUBLISHED
    cancel_res = client.post(
        f"/api/v1/bookings/{b1_data['id']}/cancel",
        headers=rider_headers,
        json={"cancellation_reason": "Change of plans"}
    )
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status"] == "CANCELLED"

    check_ride_after_cancel = client.get(f"/api/v1/rides/{ride_id}")
    assert check_ride_after_cancel.json()["seats_available"] == 2
    assert check_ride_after_cancel.json()["status"] == "PUBLISHED"
