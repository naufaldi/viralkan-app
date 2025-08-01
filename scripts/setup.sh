#!/bin/bash

# Viralkan VPS Setup Script
# This script sets up a fresh VPS for Viralkan deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root for security reasons"
fi

log "Starting Viralkan VPS setup..."

# Update system packages
log "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
log "Installing required packages..."
sudo apt install -y \
    curl \
    wget \
    git \
    unzip \
    htop \
    ufw \
    fail2ban \
    postgresql-client \
    nginx-utils

# Install Docker
log "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    success "Docker installed successfully"
else
    success "Docker already installed"
fi

# Install Docker Compose
log "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    success "Docker Compose installed successfully"
else
    success "Docker Compose already installed"
fi

# Configure firewall
log "Configuring firewall..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
success "Firewall configured"

# Configure fail2ban
log "Configuring fail2ban..."
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
success "Fail2ban configured"

# Create project directories
log "Creating project directories..."
mkdir -p ~/viralkan-app/{backups,logs,secrets}
success "Project directories created"

# Generate secrets
log "Generating secrets..."

# Database password
if [[ ! -f ~/viralkan-app/secrets/db-password.txt ]]; then
    openssl rand -base64 32 > ~/viralkan-app/secrets/db-password.txt
    success "Database password generated"
fi

# JWT secret
if [[ ! -f ~/viralkan-app/secrets/jwt-secret.txt ]]; then
    openssl rand -hex 64 > ~/viralkan-app/secrets/jwt-secret.txt
    success "JWT secret generated"
fi

# NextAuth secret
if [[ ! -f ~/viralkan-app/secrets/nextauth-secret.txt ]]; then
    openssl rand -base64 32 > ~/viralkan-app/secrets/nextauth-secret.txt
    success "NextAuth secret generated"
fi

# Set secure permissions on secrets
chmod 600 ~/viralkan-app/secrets/*
success "Secure permissions set on secrets"

# Create .env.production.local template
log "Creating environment configuration template..."
cat > ~/viralkan-app/.env.production.local << EOF
# Production Environment - Fill in your actual values
DOMAIN=your-domain.com
ACME_EMAIL=admin@your-domain.com
GITHUB_REPOSITORY=yourusername/viralkan-app
IMAGE_TAG=latest
REDIS_PASSWORD=$(openssl rand -base64 32)

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id

# Cloudflare R2 Configuration
R2_ACCESS_KEY=your-r2-access-key
R2_SECRET_KEY=your-r2-secret-key
R2_BUCKET=viralkan-uploads
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
EOF

success "Environment template created at ~/viralkan-app/.env.production.local"

# Create Docker daemon configuration for better logging
log "Configuring Docker daemon..."
sudo mkdir -p /etc/docker
cat << EOF | sudo tee /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2"
}
EOF

sudo systemctl restart docker
success "Docker daemon configured"

# Set up log rotation
log "Setting up log rotation..."
sudo cat << EOF > /etc/logrotate.d/viralkan
/home/$USER/viralkan-app/logs/*.log {
  daily
  missingok
  rotate 30
  compress
  delaycompress
  notifempty
  create 644 $USER $USER
}
EOF

success "Log rotation configured"

# Create deployment helpers
log "Creating deployment helpers..."

# Create update script
cat > ~/viralkan-app/update.sh << 'EOF'
#!/bin/bash
set -e

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "Pulling latest images..."
docker-compose -f docker-compose.prod.yml pull

log "Restarting services with zero downtime..."
docker-compose -f docker-compose.prod.yml up -d --no-deps api web

log "Cleaning up old images..."
docker image prune -f

log "Update completed!"
EOF

chmod +x ~/viralkan-app/update.sh

# Create backup script
cat > ~/viralkan-app/backup.sh << 'EOF'
#!/bin/bash
set -e

BACKUP_DIR="/home/$USER/viralkan-app/backups"
DATE=$(date +%Y%m%d-%H%M%S)

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "Creating database backup..."
docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U viralkan viralkan | gzip > "$BACKUP_DIR/db-backup-$DATE.sql.gz"

log "Backup created: db-backup-$DATE.sql.gz"

# Keep only last 7 days of backups
find "$BACKUP_DIR" -name "db-backup-*.sql.gz" -mtime +7 -delete

log "Old backups cleaned up"
EOF

chmod +x ~/viralkan-app/backup.sh

success "Deployment helpers created"

# Set up cron jobs
log "Setting up automated tasks..."
(crontab -l 2>/dev/null; echo "0 2 * * * /home/$USER/viralkan-app/backup.sh >> /home/$USER/viralkan-app/logs/backup.log 2>&1") | crontab -
(crontab -l 2>/dev/null; echo "0 4 * * 0 docker system prune -f >> /home/$USER/viralkan-app/logs/cleanup.log 2>&1") | crontab -

success "Automated tasks configured"

# Show final instructions
success "VPS setup completed successfully!"

log "Next steps:"
log "1. Clone your repository: git clone https://github.com/yourusername/viralkan-app.git ~/viralkan-app"
log "2. Edit environment file: nano ~/viralkan-app/.env.production.local"
log "3. Add Firebase service account: nano ~/viralkan-app/secrets/firebase-service-account.json"
log "4. Deploy: cd ~/viralkan-app && ./scripts/deploy.sh production"

warning "IMPORTANT: Please reboot the system to ensure all changes take effect:"
warning "sudo reboot"

log "After reboot, you can deploy with:"
log "cd ~/viralkan-app && ./scripts/deploy.sh production"