import math
from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from app.models.entities import Ride, RideStop, User, Vehicle


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance between two points on the Earth in kilometers."""
    r = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return r * c


def search_rides(
    db: Session,
    origin: Optional[str] = None,
    destination: Optional[str] = None,
    date_str: Optional[str] = None,
    seats: int = 1,
    max_price: Optional[float] = None,
    ac: Optional[bool] = None,
    instant_only: Optional[bool] = None,
    women_only: Optional[bool] = None,
    luggage_size: Optional[str] = None,
    sort_by: str = "departure_asc"  # departure_asc, price_asc, rating_desc
) -> List[Ride]:
    query = (
        db.query(Ride)
        .options(
            joinedload(Ride.driver),
            joinedload(Ride.vehicle),
            joinedload(Ride.stops)
        )
        .filter(Ride.status == "PUBLISHED")
        .filter(Ride.seats_available >= seats)
    )

    # Date filter
    if date_str and date_str.strip():
        parsed_date = None
        cleaned = date_str.split("T")[0].strip()
        for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%Y/%m/%d", "%m/%d/%Y"):
            try:
                parsed_date = datetime.strptime(cleaned, fmt).date()
                break
            except ValueError:
                continue
        if parsed_date:
            start_of_day = datetime.combine(parsed_date, datetime.min.time())
            end_of_day = datetime.combine(parsed_date + timedelta(days=1), datetime.min.time())
            query = query.filter(Ride.departure_at >= start_of_day, Ride.departure_at < end_of_day)


    # Basic city / location filters
    all_rides = query.all()
    filtered_rides = []

    for ride in all_rides:
        # Check Origin match (either start text or intermediate pickup stops)
        match_origin = True
        if origin and origin.strip():
            orig_lower = origin.strip().lower()
            origin_in_start = orig_lower in ride.origin_text.lower()
            origin_in_stops = any(
                orig_lower in stop.place_name.lower() and stop.pickup_allowed
                for stop in ride.stops
            )
            match_origin = origin_in_start or origin_in_stops

        # Check Destination match (either end text or intermediate drop stops)
        match_dest = True
        if destination and destination.strip():
            dest_lower = destination.strip().lower()
            dest_in_end = dest_lower in ride.destination_text.lower()
            dest_in_stops = any(
                dest_lower in stop.place_name.lower() and stop.drop_allowed
                for stop in ride.stops
            )
            match_dest = dest_in_end or dest_in_stops

        if not (match_origin and match_dest):
            continue

        # Feature filters
        if max_price is not None and ride.price_per_seat > max_price:
            continue
        if ac is True and not ride.ac:
            continue
        if instant_only is True and ride.booking_mode != "INSTANT":
            continue
        if women_only is True and not ride.women_only:
            continue
        if luggage_size and ride.luggage_size != luggage_size:
            continue

        filtered_rides.append(ride)

    # Sorting
    if sort_by == "price_asc":
        filtered_rides.sort(key=lambda r: r.price_per_seat)
    elif sort_by == "rating_desc":
        filtered_rides.sort(key=lambda r: (r.driver.rating_avg if r.driver else 0.0), reverse=True)
    else:  # default departure_asc
        filtered_rides.sort(key=lambda r: r.departure_at)

    return filtered_rides
