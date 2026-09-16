import json
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.entities import Notification


def create_notification(
    db: Session,
    user_id: str,
    notif_type: str,
    title: str,
    body: str,
    data: Optional[Dict[str, Any]] = None
) -> Notification:
    data_json = json.dumps(data) if data else None
    notification = Notification(
        user_id=user_id,
        type=notif_type,
        title=title,
        body=body,
        data_json=data_json
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification
