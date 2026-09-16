# CoRide System Architecture

CoRide is designed as a high-concurrency, modular, full-stack platform.

## High-Level Topology

```
┌────────────────────────────────────────────────────────┐
│               Web & Mobile Clients (React SPA)          │
└─────────────────────────┬──────────────────────────────┘
                          │ HTTPS / REST + WebSocket
                          ▼
┌────────────────────────────────────────────────────────┐
│                   Nginx Reverse Proxy                  │
└─────────────────────────┬──────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────┐
│              FastAPI Application Server                │
│  ┌──────────────┐ ┌───────────────┐ ┌────────────────┐ │
│  │ Auth & Users │ │ Ride Matcher  │ │ Atomic Booking │ │
│  └──────────────┘ └───────────────┘ └────────────────┘ │
│  ┌──────────────┐ ┌───────────────┐ ┌────────────────┐ │
│  │ Realtime WS  │ │ Payments/Escrow│ │ Safety & Admin │ │
│  └──────────────┘ └───────────────┘ └────────────────┘ │
└──────────────┬──────────────────┬─────────────────┬────┘
               │                  │                 │
               ▼                  ▼                 ▼
      ┌─────────────────┐ ┌───────────────┐ ┌──────────────┐
      │   PostgreSQL    │ │     Redis     │ │ External APIs│
      │ (SQLAlchemy ORM)│ │ (PubSub/Cache)│ │ (Razorpay)   │
      └─────────────────┘ └───────────────┘ └──────────────┘
```

---

## Architectural Principles

1. **Service Layer Isolation**:
   - Route handlers only parse and validate requests. Business logic (seat deductions, fees, cancellations, notifications) is encapsulated in reusable domain services (`booking_service.py`, `ride_service.py`, `payment_service.py`).
2. **Double-Booking Elimination**:
   - Transactions lock ride rows during reservation, calculate available inventory, decrement seats, create booking records, and commit atomically.
3. **Realtime Synchronization**:
   - In-app chat and driver lifecycle triggers (`DRIVER_ARRIVED`, `RIDE_STARTED`, `RIDE_COMPLETED`) broadcast instantaneously over isolated WebSocket channels keyed by booking ID.
4. **Resilient Fallback Mode**:
   - Built to run seamlessly in zero-dependency local mode (SQLite + local WebSocket manager) while fully Dockerized for AWS production clusters with PostgreSQL and Redis.
