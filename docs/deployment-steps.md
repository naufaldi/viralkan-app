# VPS Deployment Steps

## Prerequisites on VPS
```bash
# Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
# Logout and login again

# Install Git
sudo apt update && sudo apt install git -y
```

## Deployment Steps

### 1. Clone Repository
```bash
cd /home/your-username
git clone https://github.com/your-username/viralkan-app.git
cd viralkan-app
```

### 2. Create Production Environment File
```bash
# Copy the example file
cp .env.production.example .env.production

# Edit with your actual values
nano .env.production
```

**Fill in these values in .env.production:**
```env
DOMAIN=103.59.160.70  # or your domain name
ACME_EMAIL=your-email@example.com
GITHUB_REPOSITORY=your-username/viralkan-app
IMAGE_TAG=latest

# Your actual database URL, Firebase config, etc.
DATABASE_URL=postgresql://username:password@localhost:5432/viralkan
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account"...}
JWT_SECRET=your-secret-here
# ... all other variables
```

### 3. Build and Deploy
```bash
# Build Docker images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 4. Update Deployment (when you push new code)
```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build

# Or use Watchtower (it auto-updates every 30 seconds)
```

### 5. Useful Commands
```bash
# Check running containers
docker ps

# View logs
docker-compose -f docker-compose.prod.yml logs api
docker-compose -f docker-compose.prod.yml logs web

# Stop services
docker-compose -f docker-compose.prod.yml down

# Restart specific service
docker-compose -f docker-compose.prod.yml restart api
```

## Access Your App
- **Website**: http://103.59.160.70 (redirects to HTTPS)
- **API**: http://103.59.160.70/api
- **SSL**: Automatic via Traefik + Let's Encrypt