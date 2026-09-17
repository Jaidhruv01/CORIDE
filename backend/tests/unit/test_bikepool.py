from datetime import datetime, timedelta

def test_bikepool_creation_and_search_filters(client):
    # Register Driver
    driver_res = client.post(
        "/api/v1/auth/register",
        json={"name": "Vikram Biker", "email": "vikram.bike@test.com", "password": "pass", "is_driver": True}
    )
    token = driver_res.json()["access_token"]
    driver_headers = {"Authorization": f"Bearer {token}"}

    # Add Bike Vehicle
    veh_res = client.post(
        "/api/v1/vehicles",
        headers=driver_headers,
        json={
            "vehicle_type": "BIKE",
            "make": "Royal Enfield",
            "model": "Hunter 350",
            "year": 2024,
            "color": "Dapper Grey",
            "registration_no": "KA04BK9999",
            "seats_total": 1,
            "helmet_provided": True,
            "ac": False,
            "luggage_capacity": "SMALL"
        }
    )
    assert veh_res.status_code == 200
    veh_id = veh_res.json()["id"]

    # Publish Bike Pool Ride
    dep_time = (datetime.utcnow() + timedelta(days=1, hours=2)).isoformat()
    ride_res = client.post(
        "/api/v1/rides",
        headers=driver_headers,
        json={
            "origin_text": "Bangalore (Indiranagar)",
            "destination_text": "Bangalore (Whitefield ITPL)",
            "origin_lat": 12.9784,
            "origin_lng": 77.6408,
            "destination_lat": 12.9855,
            "destination_lng": 77.7285,
            "departure_at": dep_time,
            "seats_total": 1,
            "price_per_seat": 120.0,
            "ride_type": "BIKEPOOL",
            "helmet_provided": True,
            "booking_mode": "INSTANT",
            "vehicle_id": veh_id,
            "ac": False,
            "notes": "Fast corridor commute with spare helmet"
        }
    )
    assert ride_res.status_code == 200
    ride_data = ride_res.json()
    assert ride_data["ride_type"] == "BIKEPOOL"
    assert ride_data["helmet_provided"] is True

    # Search specifically for BIKEPOOL
    search_bike = client.get("/api/v1/search?origin=Indiranagar&ride_type=BIKEPOOL&helmet_provided=true")
    assert search_bike.status_code == 200
    bike_results = search_bike.json()
    assert len(bike_results) >= 1
    assert bike_results[0]["ride_type"] == "BIKEPOOL"
    assert bike_results[0]["helmet_provided"] is True

    # Search specifically for CARPOOL - bike shouldn't appear
    search_car = client.get("/api/v1/search?origin=Indiranagar&ride_type=CARPOOL")
    assert search_car.status_code == 200
    car_results = search_car.json()
    assert not any(r["id"] == ride_data["id"] for r in car_results)

    # Register Rider and book the 1 pillion seat
    rider_res = client.post(
        "/api/v1/auth/register",
        json={"name": "Rohit Passenger", "email": "rohit.pillion@test.com", "password": "pass"}
    )
    rider_token = rider_res.json()["access_token"]
    rider_headers = {"Authorization": f"Bearer {rider_token}"}

    book_res = client.post(
        f"/api/v1/rides/{ride_data['id']}/bookings",
        headers=rider_headers,
        json={
            "seats": 1,
            "pickup_stop_name": "Bangalore (Indiranagar)",
            "drop_stop_name": "Bangalore (Whitefield ITPL)"
        }
    )
    assert book_res.status_code == 200
    booking = book_res.json()
    assert booking["status"] == "CONFIRMED"
    assert booking["seats"] == 1
