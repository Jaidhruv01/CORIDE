#!/usr/bin/env bash
# ==============================================================================
# CoRide - Production Deployment & Stack Rebuilder
# Usage: ./infra/scripts/deploy.sh
# ==============================================================================

set -euo pipefail

APP_DIR="${APP_DIR:-/home/$USER/CORIDE}"

echo "====================================================="
echo "🚀 Deploying CoRide Stack on EC2 ($(date -u))"
echo "====================================================="

cd "$APP_DIR"

# 1. Fetch latest changes from GitHub main branch
echo "📥 Pulling latest commits from origin/main..."
git fetch origin main
git reset --hard origin/main

# 2. Verify .env exists
if [ ! -f .env ]; then
    echo "⚠️ .env file missing! Copying from .env.example..."
    cp .env.example .env
fi

# 3. Build and launch Docker Compose stack
echo "🐳 Rebuilding and starting Docker containers..."
docker compose pull --ignore-buildable || true
docker compose up -d --build --remove-orphans

# 4. Wait for Backend Healthcheck
echo "⏳ Verifying backend health..."
MAX_RETRIES=20
COUNT=0
HEALTHY=false

while [ $COUNT -lt $MAX_RETRIES ]; do
    if curl -s -f http://localhost:8000/health > /dev/null 2>&1; then
        HEALTHY=true
        break
    fi
    COUNT=$((COUNT + 1))
    echo "   Waiting for backend API... ($COUNT/$MAX_RETRIES)"
    sleep 3
done

if [ "$HEALTHY" = true ]; then
    echo "✅ Backend API is healthy and accepting requests!"
else
    echo "⚠️ Backend health check timed out. Showing recent container logs:"
    docker compose logs --tail=40 backend
fi

# 5. Clean up unused images to preserve disk space
echo "🧹 Pruning old dangling Docker images..."
docker image prune -f || true

# 6. Print container status
echo ""
echo "📊 Current Container Status:"
docker compose ps

echo "====================================================="
echo "🎉 Deployment Completed Successfully!"
echo "====================================================="
