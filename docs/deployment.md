# CoRide — Production Deployment & DevOps Architecture

CoRide is built for enterprise-grade high availability, zero-downtime deployments, and seamless automated CI/CD pipelines via **GitHub Actions** and **AWS EC2**.

---

## 🏗 System Architecture on AWS EC2

```
                           [ Internet Users / Riders / Drivers ]
                                            │
                                            ▼
                    ┌──────────────────────────────────────────────┐
                    │               AWS EC2 Instance               │
                    │         (Ubuntu 22.04 / 24.04 LTS)           │
                    │                                              │
                    │     ┌──────────────────────────────────┐     │
                    │     │   Nginx Reverse Proxy (Port 80)  │     │
                    │     └───────────────┬──────────────────┘     │
                    │                     │                        │
                    │         ┌───────────┴───────────┐            │
                    │         ▼                       ▼            │
                    │   ┌────────────┐         ┌────────────┐      │
                    │   │  Frontend  │         │  Backend   │      │
                    │   │   (Vite)   │         │ (FastAPI)  │      │
                    │   │  Port 3000 │         │  Port 8000 │      │
                    │   └────────────┘         └──────┬─────┘      │
                    │                                 │            │
                    │                     ┌───────────┴───────────┐│
                    │                     ▼                       ▼│
                    │              ┌────────────┐          ┌────────────┐
                    │              │ PostgreSQL │          │   Redis    │
                    │              │  Port 5432 │          │  Port 6379 │
                    │              └────────────┘          └────────────┘
                    └──────────────────────────────────────────────┘
                                            ▲
                                            │ (SSH Deploy on Push)
                                            │
                             ┌──────────────────────────────┐
                             │  GitHub Actions CI/CD Runner │
                             │   (Pytest + Build + Deploy)  │
                             └──────────────────────────────┘
```

---

## 🚀 1. AWS EC2 Instance Setup

### Step 1: Provision EC2 Instance
- **AMI**: Ubuntu Server 22.04 LTS or 24.04 LTS (64-bit x86)
- **Instance Type**: `t3.small` (2 vCPU, 2GB RAM) or `t3.medium` (4GB RAM recommended for production)
- **Storage**: 20GB+ gp3 SSD
- **Key Pair**: Create or use an existing `.pem` key pair (e.g. `coride-ec2-key.pem`)

### Step 2: Configure EC2 Security Group Rules (Inbound)
| Type | Port Range | Protocol | Source | Description |
| :--- | :--- | :--- | :--- | :--- |
| **SSH** | `22` | TCP | `0.0.0.0/0` (or your IP) | Remote Admin & GitHub Actions SSH |
| **HTTP** | `80` | TCP | `0.0.0.0/0` | Web Traffic & Nginx |
| **HTTPS** | `443` | TCP | `0.0.0.0/0` | Secure Web Traffic / SSL |
| **Custom TCP** | `3000` | TCP | `0.0.0.0/0` | Frontend Direct (Optional) |
| **Custom TCP** | `8000` | TCP | `0.0.0.0/0` | Backend API / Docs Direct (Optional) |

---

## ⚡ 2. 1-Command Automated EC2 Bootstrap

Connect to your EC2 instance via SSH:
```bash
ssh -i ~/.ssh/coride-ec2-key.pem ubuntu@<YOUR_EC2_PUBLIC_IP>
```

Run the automated bootstrap script:
```bash
curl -fsSL https://raw.githubusercontent.com/Jaidhruv01/CORIDE/main/infra/scripts/ec2-setup.sh | bash
```

**What this script handles automatically:**
1. Updates package repositories and installs essentials (`curl`, `git`, `ufw`, `jq`).
2. Installs Docker Engine & Docker Compose plugin with proper user permissions.
3. Sets up a 2GB swap space for memory stability.
4. Configures UFW firewall rules for ports 22, 80, 443, 8000, 3000.
5. Clones `https://github.com/Jaidhruv01/CORIDE.git` into `/home/ubuntu/CORIDE`.
6. Generates production `.env` configuration with cryptographically secure random secret keys.

---

## 🔄 3. GitHub Actions Continuous Deployment (CI/CD)

The repository includes a multi-stage GitHub Actions pipeline at [`.github/workflows/ci.yml`](file:///Users/jaidhruv/CORIDE/.github/workflows/ci.yml).

### Pipeline Stages:
1. **Backend Testing (`backend-test`)**: Runs on Python 3.11 with cached pip dependencies and executes the complete 13-test Pytest suite.
2. **Frontend Validation (`frontend-build`)**: Runs on Node.js 20, executes `npm ci`, and verifies TypeScript typecheck and Vite production build (`npm run build`).
3. **Automated EC2 Deployment (`deploy-ec2`)**: Triggers automatically on push to `main` branch (or via manual 1-click trigger in GitHub Actions):
   - Establishes SSH connection to the EC2 instance.
   - Pulls latest `main` branch commits.
   - Executes [`infra/scripts/deploy.sh`](file:///Users/jaidhruv/CORIDE/infra/scripts/deploy.sh) to rebuild Docker containers with zero downtime.
   - Validates backend `/health` endpoint before completing.
   - Automatically prunes dangling images to prevent disk fill-up.

---

## 🔑 4. GitHub Repository Secrets Configuration

To enable automated CD to your EC2 instance, configure these repository secrets:

1. Go to your GitHub repository: **`https://github.com/Jaidhruv01/CORIDE`**
2. Click **Settings** ➔ **Secrets and variables** ➔ **Actions**
3. Click **New repository secret** and add:

| Secret Name | Description | Example Value |
| :--- | :--- | :--- |
| `EC2_HOST` | Public IP or DNS of your AWS EC2 instance | `3.110.154.82` or `ec2-3-110-154-82.ap-south-1.compute.amazonaws.com` |
| `EC2_USER` | SSH Username for Ubuntu AMI | `ubuntu` |
| `EC2_SSH_KEY` | Entire private key (`.pem`) including header and footer | `-----BEGIN RSA PRIVATE KEY----- ... -----END RSA PRIVATE KEY-----` |
| `EC2_PORT` | SSH Port (optional, defaults to 22) | `22` |

Once added, every git push to `main` will automatically build, test, and deploy the latest code live on your EC2 instance!

---

## 🔒 5. Custom Domain & SSL (HTTPS) Setup

To attach your domain (e.g. `coride.app`):

1. Point your domain's DNS `A Record` to your EC2 Public IP.
2. On your EC2 instance, execute the SSL provisioning script:
   ```bash
   sudo ./infra/scripts/init-ssl.sh yourdomain.com
   ```
3. Certbot will provision Let's Encrypt certificates and set up a daily automatic renewal cron job.

---

## 🛠 6. Manual Management Commands on EC2

```bash
# Check container statuses
docker compose ps

# View live aggregate logs
docker compose logs -f

# View backend API logs
docker compose logs -f backend

# Seed/reset database
docker compose exec backend python app/seed.py

# Restart entire stack
docker compose restart
```
