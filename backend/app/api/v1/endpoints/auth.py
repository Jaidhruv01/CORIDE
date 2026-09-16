from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, decode_token
from app.models.entities import User
from app.schemas.schemas import UserCreate, UserLogin, Token, UserOut, ForgotPasswordRequest, ResetPasswordRequest, ApiResponse

router = APIRouter()


@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists"
        )

    user = User(
        name=user_in.name,
        email=user_in.email.lower(),
        phone=user_in.phone,
        password_hash=get_password_hash(user_in.password),
        is_driver=user_in.is_driver or False,
        is_admin=False,
        email_verified=True,
        rating_avg=5.0,
        trips_count=0
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserOut.model_validate(user)
    )


@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email.lower()).first()
    if not user or not verify_password(login_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    if user.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been suspended or deactivated"
        )

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserOut.model_validate(user)
    )


@router.post("/refresh")
def refresh_token(payload: dict, db: Session = Depends(get_db)):
    refresh = payload.get("refresh_token")
    if not refresh:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="refresh_token is required")
    data = decode_token(refresh)
    if not data or data.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    
    user_id = data.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    new_access = create_access_token(user.id)
    return {"access_token": new_access, "token_type": "bearer"}


@router.post("/forgot-password", response_model=ApiResponse)
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user:
        # Prevent email enumeration by returning standard success message
        return ApiResponse(success=True, message="If that email exists, password reset instructions have been sent.")
    
    reset_token = create_access_token(f"reset_{user.id}", expires_delta=timedelta(hours=1))
    return ApiResponse(
        success=True,
        message="Reset instructions generated",
        data={"reset_token": reset_token}
    )


@router.post("/reset-password", response_model=ApiResponse)
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    payload = decode_token(req.token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token")

    user.password_hash = get_password_hash(req.new_password)
    db.commit()

    return ApiResponse(success=True, message="Password updated successfully. Please log in.")
