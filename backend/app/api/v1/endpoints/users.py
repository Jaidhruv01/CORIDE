from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.entities import User, UserVerification
from app.schemas.schemas import (
    UserOut, UserPublicOut, UserUpdate, UserVerificationCreate,
    UserVerificationOut, ApiResponse
)

router = APIRouter()


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserOut)
def update_me(
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    update_data = user_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/me/verify-phone", response_model=ApiResponse)
def verify_phone(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Simulated OTP verification
    otp = payload.get("otp", "")
    if len(otp) == 6 or otp == "123456":
        current_user.phone_verified = True
        db.commit()
        return ApiResponse(success=True, message="Phone number verified successfully")
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP code")


@router.get("/me/verifications", response_model=List[UserVerificationOut])
def get_my_verifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(UserVerification).filter(UserVerification.user_id == current_user.id).all()


@router.post("/me/verifications", response_model=UserVerificationOut)
def submit_verification(
    verif_in: UserVerificationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verif = UserVerification(
        user_id=current_user.id,
        type=verif_in.type,
        document_url=verif_in.document_url,
        document_number=verif_in.document_number,
        status="PENDING"
    )
    db.add(verif)
    db.commit()
    db.refresh(verif)
    return verif


@router.get("/users/{user_id}", response_model=UserPublicOut)
def get_public_profile(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user
