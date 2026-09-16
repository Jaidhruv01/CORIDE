from typing import List, Dict
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.orm import Session
from app.core.database import get_db, SessionLocal
from app.core.security import decode_token
from app.api.deps import get_current_user
from app.models.entities import Message, Booking, Ride, User
from app.schemas.schemas import MessageCreate, MessageOut, ApiResponse

router = APIRouter()


class ConnectionManager:
    def __init__(self):
        # Map booking_id -> list of WebSockets
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, booking_id: str, websocket: WebSocket):
        await websocket.accept()
        if booking_id not in self.active_connections:
            self.active_connections[booking_id] = []
        self.active_connections[booking_id].append(websocket)

    def disconnect(self, booking_id: str, websocket: WebSocket):
        if booking_id in self.active_connections:
            if websocket in self.active_connections[booking_id]:
                self.active_connections[booking_id].remove(websocket)
            if not self.active_connections[booking_id]:
                del self.active_connections[booking_id]

    async def broadcast_to_booking(self, booking_id: str, message_data: dict):
        if booking_id in self.active_connections:
            for connection in self.active_connections[booking_id]:
                try:
                    await connection.send_json(message_data)
                except Exception:
                    pass


manager = ConnectionManager()


@router.get("/bookings/{booking_id}/messages", response_model=List[MessageOut])
def get_booking_messages(
    booking_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    ride = db.query(Ride).filter(Ride.id == booking.ride_id).first()
    if booking.rider_id != current_user.id and (ride and ride.driver_id != current_user.id) and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view messages")

    messages = (
        db.query(Message)
        .filter(Message.booking_id == booking_id)
        .order_by(Message.created_at.asc())
        .all()
    )
    return messages


@router.post("/bookings/{booking_id}/messages", response_model=MessageOut)
async def send_booking_message(
    booking_id: str,
    msg_in: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    ride = db.query(Ride).filter(Ride.id == booking.ride_id).first()
    if booking.rider_id != current_user.id and (ride and ride.driver_id != current_user.id) and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to send messages")

    msg = Message(
        booking_id=booking.id,
        sender_id=current_user.id,
        sender_name=current_user.name,
        body=msg_in.body,
        is_system=False
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    # Broadcast to active WebSockets in this booking room
    await manager.broadcast_to_booking(
        booking_id=booking_id,
        message_data={
            "id": msg.id,
            "booking_id": msg.booking_id,
            "sender_id": msg.sender_id,
            "sender_name": msg.sender_name,
            "body": msg.body,
            "is_system": msg.is_system,
            "created_at": msg.created_at.isoformat()
        }
    )

    return msg


@router.websocket("/ws/bookings/{booking_id}")
async def websocket_chat_endpoint(
    websocket: WebSocket,
    booking_id: str,
    token: str = Query(None)
):
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    payload = decode_token(token)
    if not payload or "sub" not in payload:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    user_id = payload["sub"]
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        booking = db.query(Booking).filter(Booking.id == booking_id).first()
        if not user or not booking:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        ride = db.query(Ride).filter(Ride.id == booking.ride_id).first()
        if booking.rider_id != user.id and (ride and ride.driver_id != user.id) and not user.is_admin:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        await manager.connect(booking_id, websocket)

        while True:
            data = await websocket.receive_json()
            body = data.get("body", "").strip()
            if body:
                new_msg = Message(
                    booking_id=booking_id,
                    sender_id=user.id,
                    sender_name=user.name,
                    body=body,
                    is_system=False
                )
                db.add(new_msg)
                db.commit()
                db.refresh(new_msg)

                await manager.broadcast_to_booking(
                    booking_id=booking_id,
                    message_data={
                        "id": new_msg.id,
                        "booking_id": new_msg.booking_id,
                        "sender_id": new_msg.sender_id,
                        "sender_name": new_msg.sender_name,
                        "body": new_msg.body,
                        "is_system": new_msg.is_system,
                        "created_at": new_msg.created_at.isoformat()
                    }
                )
    except WebSocketDisconnect:
        manager.disconnect(booking_id, websocket)
    except Exception:
        manager.disconnect(booking_id, websocket)
    finally:
        db.close()
