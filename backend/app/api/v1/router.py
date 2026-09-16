from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    users,
    vehicles,
    rides,
    search,
    bookings,
    payments,
    chat,
    reviews,
    notifications,
    reports,
    admin
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(users.router, prefix="", tags=["Users"])
api_router.include_router(vehicles.router, prefix="/vehicles", tags=["Vehicles"])
api_router.include_router(rides.router, prefix="/rides", tags=["Rides"])
api_router.include_router(search.router, prefix="", tags=["Search & Places"])
api_router.include_router(bookings.router, prefix="", tags=["Bookings"])
api_router.include_router(payments.router, prefix="/payments", tags=["Payments"])
api_router.include_router(chat.router, prefix="", tags=["Chat & Realtime"])
api_router.include_router(reviews.router, prefix="", tags=["Reviews"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(reports.router, prefix="/reports", tags=["Safety & Reports"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin Portal"])
