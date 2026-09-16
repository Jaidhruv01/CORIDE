from datetime import datetime, timedelta


def test_complete_e2e_carpooling_lifecycle(client):
    # 1. Admin login
    admin_login = client.post(
        "/api/v1/auth/register",
        json={"name": "Admin Boss", "email": "admin.test@coride.com", "password": "securepassword", "is_driver": True}
    )
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 2. Driver registration & vehicle setup
    driver_reg = client.post(
        "/api/v1/auth/register",
        json={"name": "Priya Sharma", "email": "priya.e2e@example.com", "password": "securepassword", "is_driver": True}
    )
    driver_token = driver_reg.json()["access_token"]
    driver_headers = {"Authorization": f"Bearer {driver_token}"}

    veh_res = client.post(
        "/api/v1/vehicles",
        headers=driver_headers,
        json={
            "make": "Tata",
            "model": "Nexon EV",
            "year": 2023,
            "color": "Teal Blue",
            "registration_no": "KA01EV9999",
            "seats_total": 4,
            "ac": True,
            "luggage_capacity": "MEDIUM"
        }
    )
    assert veh_res.status_code == 200
    veh_id = veh_res.json()["id"]

    # 3. Driver publishes a ride with stopovers
    dep_time = (datetime.utcnow() + timedelta(days=1, hours=2)).isoformat()
    arr_time = (datetime.utcnow() + timedelta(days=1, hours=5)).isoformat()
    ride_res = client.post(
        "/api/v1/rides",
        headers=driver_headers,
        json={
            "vehicle_id": veh_id,
            "origin_text": "Bangalore (Koramangala)",
            "destination_text": "Mysore Central",
            "origin_lat": 12.9352,
            "origin_lng": 77.6245,
            "destination_lat": 12.3072,
            "destination_lng": 76.6558,
            "departure_at": dep_time,
            "estimated_arrival": arr_time,
            "seats_total": 3,
            "price_per_seat": 320.0,
            "booking_mode": "INSTANT",
            "ac": True,
            "luggage_size": "MEDIUM",
            "stops": [
                {
                    "stop_order": 1,
                    "place_name": "Ramanagara Coffee Stop",
                    "lat": 12.72,
                    "lng": 77.28,
                    "price_from_origin": 150.0,
                    "pickup_allowed": True,
                    "drop_allowed": True
                }
            ]
        }
    )
    assert ride_res.status_code == 200
    ride_id = ride_res.json()["id"]

    # 4. Rider searches and finds the ride
    search_res = client.get("/api/v1/search?origin=Bangalore&destination=Mysore")
    assert search_res.status_code == 200
    found_rides = search_res.json()
    assert len(found_rides) >= 1

    # 5. Rider registers and books 2 seats
    rider_reg = client.post(
        "/api/v1/auth/register",
        json={"name": "Rahul Verma", "email": "rahul.e2e@example.com", "password": "securepassword"}
    )
    rider_token = rider_reg.json()["access_token"]
    rider_headers = {"Authorization": f"Bearer {rider_token}"}

    book_res = client.post(
        f"/api/v1/rides/{ride_id}/bookings",
        headers=rider_headers,
        json={"seats": 2, "pickup_stop_name": "Bangalore (Koramangala)", "drop_stop_name": "Mysore Central"}
    )
    assert book_res.status_code == 200
    booking = book_res.json()
    assert booking["status"] == "CONFIRMED"
    assert booking["seats"] == 2
    assert booking["subtotal"] == 640.0
    booking_id = booking["id"]

    # 6. Check seats remaining on ride
    ride_check = client.get(f"/api/v1/rides/{ride_id}")
    assert ride_check.json()["seats_available"] == 1  # 3 total - 2 booked = 1 left

    # 7. Rider and Driver exchange chat messages
    m1 = client.post(
        f"/api/v1/bookings/{booking_id}/messages",
        headers=rider_headers,
        json={"body": "Hi Priya, I'll be waiting at Sony World signal!"}
    )
    assert m1.status_code == 200

    m2 = client.post(
        f"/api/v1/bookings/{booking_id}/messages",
        headers=driver_headers,
        json={"body": "Sounds great Rahul, see you there!"}
    )
    assert m2.status_code == 200

    msg_history = client.get(f"/api/v1/bookings/{booking_id}/messages", headers=rider_headers)
    assert len(msg_history.json()) == 2

    # 8. Driver marks arrived -> starts ride -> completes ride
    arr_res = client.post(f"/api/v1/rides/{ride_id}/arrive", headers=driver_headers)
    assert arr_res.status_code == 200

    start_res = client.post(f"/api/v1/rides/{ride_id}/start", headers=driver_headers)
    assert start_res.status_code == 200
    assert start_res.json()["status"] == "IN_PROGRESS"

    comp_res = client.post(f"/api/v1/rides/{ride_id}/complete", headers=driver_headers)
    assert comp_res.status_code == 200
    assert comp_res.json()["status"] == "COMPLETED"

    # 9. Rider leaves a 5-star review
    rev_res = client.post(
        f"/api/v1/bookings/{booking_id}/reviews",
        headers=rider_headers,
        json={
            "rating": 5,
            "text": "Smooth ride and punctual!",
            "punctuality_rating": 5,
            "driving_rating": 5
        }
    )
    assert rev_res.status_code == 200
    assert rev_res.json()["rating"] == 5

    # 10. Check driver's updated reviews
    driver_id = driver_reg.json()["user"]["id"]
    driver_revs = client.get(f"/api/v1/users/{driver_id}/reviews")
    assert len(driver_revs.json()) >= 1
