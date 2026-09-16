from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.entities import Review, Booking, Ride, User
from app.schemas.schemas import ReviewCreate, ReviewOut

router = APIRouter()


@router.post("/bookings/{booking_id}/reviews", response_model=ReviewOut)
def create_booking_review(
    booking_id: str,
    rev_in: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = (
        db.query(Booking)
        .options(joinedload(Booking.ride))
        .filter(Booking.id == booking_id)
        .first()
    )
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    if booking.status != "COMPLETED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reviews can only be submitted after the trip is marked as completed"
        )

    # Determine reviewee
    if booking.rider_id == current_user.id:
        # Rider reviewing driver
        reviewee_id = booking.ride.driver_id
    elif booking.ride.driver_id == current_user.id:
        # Driver reviewing rider
        reviewee_id = booking.rider_id
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to review this trip")

    # Check for existing review from this reviewer for this booking
    existing = db.query(Review).filter(
        Review.booking_id == booking_id,
        Review.reviewer_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You have already submitted a review for this booking")

    review = Review(
        booking_id=booking.id,
        reviewer_id=current_user.id,
        reviewee_id=reviewee_id,
        rating=rev_in.rating,
        text=rev_in.text,
        punctuality_rating=rev_in.punctuality_rating or 5,
        driving_rating=rev_in.driving_rating or 5,
        cleanliness_rating=rev_in.cleanliness_rating or 5,
        communication_rating=rev_in.communication_rating or 5
    )
    db.add(review)
    db.commit()

    # Recalculate average rating for reviewee
    all_reviews = db.query(Review).filter(Review.reviewee_id == reviewee_id, Review.hidden_at.is_(None)).all()
    if all_reviews:
        avg_score = sum(r.rating for r in all_reviews) / float(len(all_reviews))
        reviewee = db.query(User).filter(User.id == reviewee_id).first()
        if reviewee:
            reviewee.rating_avg = round(avg_score, 1)
            db.commit()

    # Reload with reviewer details
    return (
        db.query(Review)
        .options(joinedload(Review.reviewer))
        .filter(Review.id == review.id)
        .first()
    )


@router.get("/users/{user_id}/reviews", response_model=List[ReviewOut])
def get_user_reviews(
    user_id: str,
    db: Session = Depends(get_db)
):
    reviews = (
        db.query(Review)
        .options(joinedload(Review.reviewer))
        .filter(Review.reviewee_id == user_id, Review.hidden_at.is_(None))
        .order_by(Review.created_at.desc())
        .all()
    )
    return reviews
