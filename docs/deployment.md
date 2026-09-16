# CoRide Deployment & DevOps Guide

## Local Development (Zero-Config)

### 1. Backend Setup
```bash
# In repository root
source venv/bin/activate
pip install -r backend/requirements.txt
PYTHONPATH=backend python backend/app/seed.py
PYTHONPATH=backend uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend will run at `http://localhost:5173` and automatically connect to `http://localhost:8000`.

---

## Docker Production Deployment

### 1. Build and Run Multi-Container Stack
```bash
docker compose up --build -d
```

### 2. Verify Services
- Frontend: `http://localhost:3000`
- Backend API Docs: `http://localhost:8000/docs`
- Healthcheck: `http://localhost:8000/health`

---

## AWS Production Setup

1. Provision an **AWS EC2 Ubuntu 22.04 LTS** instance (t3.medium recommended).
2. Install Docker & Docker Compose:
   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose
   ```
3. Clone repository, configure `.env`, and launch:
   ```bash
   git clone https://github.com/jaidhruv/coride.git
   cd coride
   docker compose up -d --build
   ```
4. Configure SSL via Certbot:
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d coride.app
   ```
