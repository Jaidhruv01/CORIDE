from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.entities import Vehicle, User
from app.schemas.schemas import VehicleCreate, VehicleUpdate, VehicleOut, ApiResponse

router = APIRouter()


@router.get("", response_model=List[VehicleOut])
def get_my_vehicles(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Vehicle).filter(Vehicle.owner_id == current_user.id).all()


@router.post("", response_model=VehicleOut)
def create_vehicle(
    veh_in: VehicleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Enable driver mode automatically upon adding first vehicle
    current_user.is_driver = True

    vehicle = Vehicle(
        owner_id=current_user.id,
        vehicle_type=veh_in.vehicle_type or "CAR",
        make=veh_in.make,
        model=veh_in.model,
        year=veh_in.year or 2023,
        color=veh_in.color,
        registration_no=veh_in.registration_no.upper().strip(),
        seats_total=veh_in.seats_total,
        helmet_provided=veh_in.helmet_provided or False,
        image_url=veh_in.image_url or (
            "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80"
            if veh_in.vehicle_type == "BIKE"
            else "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80"
        ),
        ac=veh_in.ac if veh_in.vehicle_type != "BIKE" else False,
        luggage_capacity=veh_in.luggage_capacity,
        smoking_allowed=veh_in.smoking_allowed,
        pets_allowed=veh_in.pets_allowed,
        verified="VERIFIED"
    )
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.get("/{vehicle_id}", response_model=VehicleOut)
def get_vehicle_by_id(
    vehicle_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id, Vehicle.owner_id == current_user.id).first()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
    return vehicle


@router.patch("/{vehicle_id}", response_model=VehicleOut)
def update_vehicle(
    vehicle_id: str,
    veh_in: VehicleUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id, Vehicle.owner_id == current_user.id).first()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")

    update_data = veh_in.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(vehicle, k, v)

    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.delete("/{vehicle_id}", response_model=ApiResponse)
def delete_vehicle(
    vehicle_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id, Vehicle.owner_id == current_user.id).first()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")

    db.delete(vehicle)
    db.commit()
    return ApiResponse(success=True, message="Vehicle deleted successfully")
