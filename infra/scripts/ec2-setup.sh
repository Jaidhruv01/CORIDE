#!/usr/bin/env bash
# ==============================================================================
# CoRide - AWS EC2 Bootstrap & Provisioning Script
# Target OS: Ubuntu 22.04 / 24.04 LTS
# Usage: curl -fsSL https://raw.githubusercontent.com/Jaidhruv01/CORIDE/main/infra/scripts/ec2-setup.sh | bash
# ==============================================================================

set -euo pipefail

echo "====================================================="
echo "🚗 CoRide Carpooling Platform — AWS EC2 Bootstrap"
echo "====================================================="

# 1. Update system packages
echo "📦 Updating system package repositories..."
sudo apt-get update -y
sudo apt-get upgrade -y

# 2. Install essential utilities
echo "🛠 Installing build essentials, curl, git, ufw..."
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    ufw \
    htop \
    jq

# 3. Install Docker Engine and Docker Compose Plugin
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker Engine..."
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Enable and start Docker service
    sudo systemctl enable docker
    sudo systemctl start docker

    # Add current user to docker group
    sudo usermod -aG docker "$USER" || true
    echo "✅ Docker installed successfully."
else
    echo "✅ Docker is already installed."
fi

# 4. Configure Swap Space (2GB swap for t3.micro/t3.small stability)
if [ ! -f /swapfile ]; then
    echo "🧠 Creating 2GB swap space for memory optimization..."
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "✅ Swap configured."
fi

# 5. Configure Firewall (UFW)
echo "🛡 Configuring UFW Firewall..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 8000/tcp  # Backend API / Swagger Docs
sudo ufw allow 3000/tcp  # Frontend App
sudo ufw --force enable

# 6. Clone or Prepare Project Directory
APP_DIR="/home/$USER/CORIDE"
if [ ! -d "$APP_DIR" ]; then
    echo "📂 Cloning CoRide repository to $APP_DIR..."
    git clone https://github.com/Jaidhruv01/CORIDE.git "$APP_DIR"
else
    echo "📂 CoRide repository already exists at $APP_DIR. Pulling latest main..."
    cd "$APP_DIR"
    git fetch origin main
    git reset --hard origin/main
fi

cd "$APP_DIR"

# 7. Create production .env if not exists
if [ ! -f .env ]; then
    echo "📝 Generating default production .env from .env.example..."
    cp .env.example .env
    # Generate secure random secret key
    RANDOM_KEY=$(openssl rand -hex 32)
    sed -i "s/your-super-secret-jwt-key-change-in-production/$RANDOM_KEY/g" .env
fi

echo "====================================================="
echo "🎉 AWS EC2 Instance Provisioned Successfully!"
echo "To deploy the stack immediately, run:"
echo "  cd ~/CORIDE && docker compose up -d --build"
echo "====================================================="
