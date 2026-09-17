from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.schemas import RideOut
from app.services.matching_service import search_rides

router = APIRouter()


@router.get("/search", response_model=List[RideOut])
def search_available_rides(
    origin: Optional[str] = Query(None, description="Origin city or pickup location"),
    destination: Optional[str] = Query(None, description="Destination city or drop location"),
    date: Optional[str] = Query(None, description="Departure date in YYYY-MM-DD format"),
    seats: int = Query(1, ge=1, le=6, description="Number of seats required"),
    ride_type: Optional[str] = Query(None, description="Pool type: CARPOOL, BIKEPOOL"),
    helmet_provided: Optional[bool] = Query(None, description="Helmet provided for bike pool"),
    max_price: Optional[float] = Query(None, description="Maximum price per seat"),
    ac: Optional[bool] = Query(None, description="Filter for Air Conditioned rides"),
    instant_only: Optional[bool] = Query(None, description="Instant booking only"),
    women_only: Optional[bool] = Query(None, description="Women only rides"),
    luggage_size: Optional[str] = Query(None, description="Luggage size (SMALL, MEDIUM, LARGE)"),
    sort_by: str = Query("departure_asc", description="Sorting: departure_asc, price_asc, rating_desc"),
    db: Session = Depends(get_db)
):
    return search_rides(
        db=db,
        origin=origin,
        destination=destination,
        date_str=date,
        seats=seats,
        max_price=max_price,
        ride_type=ride_type,
        helmet_provided=helmet_provided,
        ac=ac,
        instant_only=instant_only,
        women_only=women_only,
        luggage_size=luggage_size,
        sort_by=sort_by
    )


@router.get("/places/popular")
def get_popular_routes():
    return [
        {
            "id": "blr-mys",
            "origin": "Bangalore",
            "destination": "Mysore",
            "distance": "145 km",
            "duration": "3h 15m",
            "starting_price": 280,
            "image": "https://images.unsplash.com/photo-1600100397608-f010f444f475?auto=format&fit=crop&w=600&q=80"
        },
        {
            "id": "mum-pun",
            "origin": "Mumbai",
            "destination": "Pune",
            "distance": "148 km",
            "duration": "3h 30m",
            "starting_price": 320,
            "image": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80"
        },
        {
            "id": "del-jai",
            "origin": "Delhi",
            "destination": "Jaipur",
            "distance": "280 km",
            "duration": "4h 45m",
            "starting_price": 450,
            "image": "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80"
        },
        {
            "id": "sf-sjc",
            "origin": "San Francisco",
            "destination": "San Jose",
            "distance": "48 miles",
            "duration": "1h 10m",
            "starting_price": 18,
            "image": "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=600&q=80"
        }
    ]


@router.get("/places/autocomplete")
def autocomplete_places(q: str = Query(..., min_length=1)):
    all_places = [
        {"name": "Bangalore (Koramangala)", "city": "Bangalore", "lat": 12.9352, "lng": 77.6245},
        {"name": "Bangalore (Indiranagar)", "city": "Bangalore", "lat": 12.9784, "lng": 77.6408},
        {"name": "Bangalore (Electronic City)", "city": "Bangalore", "lat": 12.8452, "lng": 77.6602},
        {"name": "Mysore (Suburban Bus Stand)", "city": "Mysore", "lat": 12.3072, "lng": 76.6558},
        {"name": "Mumbai (Bandra West)", "city": "Mumbai", "lat": 19.0596, "lng": 72.8295},
        {"name": "Mumbai (Navi Mumbai Vashi)", "city": "Mumbai", "lat": 19.0771, "lng": 72.9986},
        {"name": "Pune (Hinjawadi Phase 1)", "city": "Pune", "lat": 18.5913, "lng": 73.7389},
        {"name": "Pune (Shivajinagar)", "city": "Pune", "lat": 18.5308, "lng": 73.8475},
        {"name": "Delhi (Connaught Place)", "city": "Delhi", "lat": 28.6315, "lng": 77.2167},
        {"name": "Delhi (Gurugram Cyber Hub)", "city": "Delhi", "lat": 28.4950, "lng": 77.0895},
        {"name": "Jaipur (Sindhi Camp)", "city": "Jaipur", "lat": 26.9208, "lng": 75.8000},
        {"name": "San Francisco (Financial District)", "city": "San Francisco", "lat": 37.7946, "lng": -122.3999},
        {"name": "San Jose (Downtown)", "city": "San Jose", "lat": 37.3382, "lng": -121.8863},
    ]
    query_lower = q.lower()
    matches = [p for p in all_places if query_lower in p["name"].lower() or query_lower in p["city"].lower()]
    return matches
