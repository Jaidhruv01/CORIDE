#!/usr/bin/env bash
# ==============================================================================
# CoRide - Automated SSL & Nginx Setup for coride.co.in
# Usage: sudo ./infra/scripts/setup-domain-ssl.sh [optional_domain]
# ==============================================================================

set -euo pipefail

PRIMARY_DOMAIN="${1:-coride.co.in}"
WWW_DOMAIN="www.${PRIMARY_DOMAIN}"
EMAIL="admin@${PRIMARY_DOMAIN}"

echo "====================================================="
echo "🔒 CoRide SSL & Domain Setup for: ${PRIMARY_DOMAIN}"
echo "====================================================="

# 1. Verify Root Privileges
if [ "$EUID" -ne 0 ]; then
  echo "❌ Error: Please run this script with sudo."
  exit 1
fi

# 2. Install Certbot and Nginx Utilities
echo "📦 Installing Certbot & Nginx..."
apt-get update -y
apt-get install -y certbot python3-certbot-nginx

# 3. Stop temporary port 80 processes if needed
echo "🛑 Temporarily stopping standalone containers on port 80..."
docker compose -f /home/$SUDO_USER/CORIDE/docker-compose.yml stop frontend 2>/dev/null || true

# 4. Request Let's Encrypt Certificate
echo "🔐 Requesting SSL Certificate from Let's Encrypt..."
certbot certonly --standalone \
  -d "${PRIMARY_DOMAIN}" \
  -d "${WWW_DOMAIN}" \
  --non-interactive \
  --agree-tos \
  --register-unsafely-without-email || certbot certonly --standalone -d "${PRIMARY_DOMAIN}" --non-interactive --agree-tos --register-unsafely-without-email

# 5. Create Host Nginx HTTPS Reverse Proxy Configuration
echo "⚙️ Configuring Production Nginx with HTTPS Reverse Proxy..."
cat <<NGINX_CONF > /etc/nginx/sites-available/coride.conf
# HTTP -> HTTPS Redirect
server {
    listen 80;
    listen [::]:80;
    server_name ${PRIMARY_DOMAIN} ${WWW_DOMAIN};

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://\$host\$request_uri;
    }
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${PRIMARY_DOMAIN} ${WWW_DOMAIN};

    ssl_certificate /etc/letsencrypt/live/${PRIMARY_DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${PRIMARY_DOMAIN}/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/json;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Frontend Single Page App & Static Assets
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Backend REST APIs
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # API Documentation
    location /docs {
        proxy_pass http://127.0.0.1:8000/docs;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    location /openapi.json {
        proxy_pass http://127.0.0.1:8000/api/v1/openapi.json;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # Real-Time WebSockets (Chat & Live Trip Tracking)
    location /api/v1/ws/ {
        proxy_pass http://127.0.0.1:8000/api/v1/ws/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_read_timeout 86400;
    }
}
NGINX_CONF

# 6. Enable Site & Test Configuration
ln -sf /etc/nginx/sites-available/coride.conf /etc/nginx/sites-enabled/coride.conf
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
nginx -t
systemctl restart nginx

# 7. Restart Docker Compose App
echo "🚀 Restarting CoRide containers..."
cd /home/$SUDO_USER/CORIDE
docker compose up -d --build

# 8. Setup Auto-Renewal Cron
(crontab -l 2>/dev/null | grep -v certbot ; echo "0 3 * * * certbot renew --quiet && systemctl reload nginx") | crontab -

echo "====================================================="
echo "✅ SUCCESS: CoRide is now securely deployed on https://${PRIMARY_DOMAIN}!"
echo "====================================================="
