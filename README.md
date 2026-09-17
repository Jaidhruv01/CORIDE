# CoRide — Smart Carpooling Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688.svg?style=flat&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?style=flat&logo=React&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![Tests](https://img.shields.io/badge/Tests-Pytest%20Passing-brightgreen.svg?style=flat&logo=pytest&logoColor=white)](https://pytest.org/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

> **Share the Route • Share the Cost**  
> CoRide is a high-concurrency, two-sided carpooling platform connecting verified vehicle owners with passengers traveling along the same corridor. Featuring atomic seat locking, transparent cost-sharing fares, live in-app coordination chat, 24x7 safety controls, and a master administrative control center.

---

## Brand Visual Direction

Designed following the curated **Lavender, Ink Black, and White** color palette:
- **Primary Brand Lavender**: `#9B7EDE` (CTAs, active states, brand highlights)
- **Deep Lavender**: `#6F55B7` (Hover states, section titles, headers)
- **Soft Lavender**: `#EEE8FA` (Badges, cards, input highlights)
- **Ink Black**: `#16131D` (Dark canvas, primary navigation background)
- **Canvas White**: `#FFFFFF` (Headlines, primary text on dark surfaces)
- **Muted Gray**: `#66616E` (Secondary metadata, borders)

---

## Key Features

- 🚗 **Multi-Step Ride Publisher**: 4-step wizard for drivers to publish corridor routes, intermediate stopovers, seats, pricing, and amenities (AC, luggage, pets, women-only).
- 🔍 **Smart Corridor Search**: Search by pickup & drop location with fuzzy matching, price sliders, departure date windows, and live interactive Leaflet route maps.
- ⚡ **Atomic Seat Reservation**: Database row-locking transaction guarantees concurrent riders cannot double-book or oversell the final available seat.
- 💳 **Seamless Checkout & Payment**: Integrated Razorpay/Stripe checkout simulator with transparent 8% platform fee breakdown and automatic refund calculations on cancellation.
- 🎫 **Digital Boarding Pass**: Confirmed ticket view with unique QR code verification, trip countdown, driver vehicle specifications, and status chips.
- 💬 **Realtime WebSocket Chat**: Direct in-app communication room keyed by booking ID with quick prompts ("Arrived at pickup", "Running 5 mins late").
- 🚦 **Driver Lifecycle State Controls**: Live one-click triggers: **"Mark Driver Arrived" ➔ "Start Trip" ➔ "Complete Trip"** with automatic passenger notifications.
- 🛡️ **24x7 Safety Center & SOS**: One-click Emergency SOS alert broadcasting live GPS coordinates to safety teams and emergency contacts, plus 112/1091 emergency shortcuts.
- 📊 **Master Admin Portal**: Full marketplace analytics (Gross Booking Value, Platform Fees, Seat Utilization %), driver ID verification audit queue, and safety dispute ticket resolver.

---

## Demo Accounts

Pre-seeded in the database for instant 1-click test access:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@coride.com` | `admin123` | Full access to Admin Portal, Analytics & Verification queue |
| **Driver** | `priya.sharma@example.com` | `password123` | Verified Driver (Tata Nexon EV, 4.9★, Active Bangalore ➔ Mysore ride) |
| **Driver 2** | `arjun.mehta@example.com` | `password123` | Verified Driver (Hyundai Creta, 4.8★, Active Mumbai ➔ Pune ride) |
| **Rider** | `rahul.verma@example.com` | `password123` | Verified Rider with confirmed ticket pass & completed trips |

---

## Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19 + TypeScript + Vite | Ultra-fast SPA workflow with typed component contracts |
| **Styling** | Tailwind CSS + Custom Tokens | Lavender glassmorphism design system & micro-animations |
| **State** | Zustand | Global authentication, notifications, and role perspectives |
| **Backend** | FastAPI (Python 3.11) | Typed asynchronous REST APIs with auto OpenAPI Swagger docs |
| **Database** | SQLAlchemy 2.0 + SQLite / Postgres | Relational data integrity, foreign key cascades, and row locks |
| **Realtime** | WebSockets (FastAPI WS) | Low-latency in-ride chat and live trip status updates |
| **Maps** | Leaflet + OpenStreetMap | Interactive route polyline visualization and stopover pins |
| **DevOps** | Docker + Docker Compose + Nginx | Reproducible multi-container stack and reverse proxy |

---

## Quickstart Guide

### Option 1: Zero-Dependency Local Run

#### 1. Backend
```bash
# In repository root
source venv/bin/activate
pip install -r backend/requirements.txt
PYTHONPATH=backend python backend/app/seed.py
PYTHONPATH=backend uvicorn app.main:app --reload --port 8000
```
- API Docs: `http://localhost:8000/docs`
- Healthcheck: `http://localhost:8000/health`

#### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:5173`

---

### Option 2: Docker Compose (Production Stack)

```bash
# Build and run Postgres, Redis, Backend, and Frontend behind Nginx
docker compose up --build -d
```
- Frontend Web App: `http://localhost:3000`
- Backend API Docs: `http://localhost:8000/docs`

---

---

## Testing & CI/CD Pipeline

The project includes an automated **GitHub Actions CI/CD Pipeline** ([.github/workflows/ci.yml](.github/workflows/ci.yml)) that runs on every push and pull request:
1. **Backend Test Suite**: Python 3.11 environment running 13 unit and concurrency tests via Pytest.
2. **Frontend TypeCheck & Build**: Node.js 20 environment verifying TypeScript types and compiling Vite production assets.
3. **Automated AWS EC2 Deployment**: Automatically SSHs into your AWS EC2 instance on push to `main`, pulls changes, rebuilds Docker containers, and validates health checks.

Run the test suite locally:
```bash
PYTHONPATH=backend pytest backend/tests -v
```

Test frontend production compilation:
```bash
cd frontend && npm run build
```

---

## AWS EC2 Deployment

### 1-Command Automated Bootstrap on EC2:
Connect to your Ubuntu EC2 instance and run:
```bash
curl -fsSL https://raw.githubusercontent.com/Jaidhruv01/CORIDE/main/infra/scripts/ec2-setup.sh | bash
```

### Configure Continuous Deployment in GitHub:
Add the following secrets under **Settings ➔ Secrets and variables ➔ Actions**:
- `EC2_HOST`: EC2 Public IP / DNS
- `EC2_USER`: `ubuntu`
- `EC2_SSH_KEY`: Your `.pem` private SSH key

See the complete guide in [docs/deployment.md](docs/deployment.md).

---

## Project Structure

```
coride/
├── frontend/                     # React + TypeScript Vite frontend
│   ├── src/
│   │   ├── components/           # UI, Layout, Maps, Rides, Safety modals
│   │   ├── pages/                # Landing, Search, Details, Publish, Checkout, Admin...
│   │   ├── store/                # Zustand state store
│   │   ├── types/                # Domain TypeScript interfaces
│   │   ├── lib/                  # API client & helpers
│   │   └── index.css             # Lavender design system CSS
│   ├── Dockerfile
│   └── package.json
├── backend/                      # FastAPI Python backend
│   ├── app/
│   │   ├── api/v1/endpoints/     # Auth, Users, Rides, Bookings, Chat, Admin...
│   │   ├── core/                 # Config, Database, Security (bcrypt/JWT)
│   │   ├── models/               # SQLAlchemy models (User, Ride, Booking, Payment...)
│   │   ├── schemas/              # Pydantic validation schemas
│   │   ├── services/             # Atomic booking transactions, matching, notifications
│   │   ├── main.py               # FastAPI entrypoint
│   │   └── seed.py               # Rich realistic database seeder
│   ├── tests/                    # Pytest unit & integration concurrency test suite
│   ├── requirements.txt
│   └── Dockerfile
├── infra/
│   └── nginx/coride.conf         # Nginx reverse proxy configuration
├── docs/                         # Full technical architecture & API docs
├── .github/workflows/ci.yml      # Automated CI/CD pipeline
├── docker-compose.yml            # Multi-container orchestration
└── README.md
```

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
