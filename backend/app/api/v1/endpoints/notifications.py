from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.entities import Notification, User
from app.schemas.schemas import NotificationOut, ApiResponse

router = APIRouter()


@router.get("", response_model=List[NotificationOut])
def get_my_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(50)
        .all()
    )


@router.post("/{notification_id}/read", response_model=ApiResponse)
def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")

    notif.read_at = datetime.utcnow()
    db.commit()
    return ApiResponse(success=True, message="Marked as read")


@router.post("/read-all", response_model=ApiResponse)
def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.read_at.is_(None)
    ).update({"read_at": datetime.utcnow()})
    db.commit()
    return ApiResponse(success=True, message="All notifications marked as read")
