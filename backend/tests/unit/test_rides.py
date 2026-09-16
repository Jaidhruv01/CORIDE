from datetime import datetime, timedelta


def test_ride_creation_and_search_filters(client):
    # Register Driver
    driver_res = client.post(
        "/api/v1/auth/register",
        json={"name": "Priya", "email": "priya@test.com", "password": "pass", "is_driver": True}
    )
    token = driver_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    dep_time = (datetime.utcnow() + timedelta(days=1)).isoformat()
    client.post(
        "/api/v1/rides",
        headers=headers,
        json={
            "origin_text": "Bangalore (Koramangala)",
            "destination_text": "Mysore Central",
            "origin_lat": 12.93,
            "origin_lng": 77.62,
            "destination_lat": 12.30,
            "destination_lng": 76.65,
            "departure_at": dep_time,
            "seats_total": 3,
            "price_per_seat": 320.0,
            "ac": True,
            "booking_mode": "INSTANT"
        }
    )

    # Search by matching origin
    res = client.get("/api/v1/search?origin=Bangalore")
    assert res.status_code == 200
    results = res.json()
    assert len(results) >= 1
    assert "Bangalore" in results[0]["origin_text"]

    # Search by non-matching origin
    empty_res = client.get("/api/v1/search?origin=Hyderabad")
    assert empty_res.status_code == 200
    assert len(empty_res.json()) == 0
