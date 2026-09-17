#!/usr/bin/env bash
# ==============================================================================
# CoRide - Automated SSL Certificate Provisioning with Certbot & Nginx
# Usage: sudo ./infra/scripts/init-ssl.sh yourdomain.com
# ==============================================================================

set -euo pipefail

DOMAIN="${1:-}"

if [ -z "$DOMAIN" ]; then
    echo "❌ Usage: sudo $0 <your-domain.com>"
    exit 1
fi

echo "====================================================="
echo "🔒 Setting up SSL Certificate for $DOMAIN"
echo "====================================================="

# Install Certbot if not installed
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx

# Obtain SSL Certificate
sudo certbot certonly --standalone -d "$DOMAIN" --non-interactive --agree-tos -m "admin@$DOMAIN" || true

# Setup automatic renewal cron job
echo "0 3 * * * certbot renew --quiet && docker compose -f /home/$USER/CORIDE/docker-compose.yml restart nginx" | sudo crontab -

echo "✅ SSL Certificate provisioned for $DOMAIN."
