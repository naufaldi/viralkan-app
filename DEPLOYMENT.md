# 🚀 Complete VPS Deployment Guide

## 📋 Prerequisites

- VPS with Docker and Docker Compose installed
- Domain name pointing to your VPS
- GitHub repository with container images
- SSH access to your VPS

## 🔧 Step 1: VPS Setup

### 1.1 Install Docker and Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for group changes
exit
# SSH back to your VPS
```

### 1.2 Configure Firewall

```bash
# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

## 📁 Step 2: Project Setup

### 2.1 Clone Repository

```bash
# Create project directory
mkdir -p ~/projects
cd ~/projects

# Clone your repository
git clone https://github.com/naufaldi/viralkan-app.git
cd viralkan-app
```

### 2.2 Create Environment File

```bash
# Copy environment template
cp env.example .env.production

# Edit with your actual values
nano .env.production
```

### 2.3 Set Secure Permissions

```bash
# Set strict permissions (CRITICAL for security)
chmod 600 .env.production
chown $USER:$USER .env.production

# Verify permissions
ls -la .env.production
# Should show: -rw------- 1 youruser youruser
```

## 🔐 Step 3: Environment Variables Configuration

### 3.1 Required Variables

Your `.env.production` must contain:

```env
# Database Configuration (CRITICAL)
DB_PASSWORD=your_strong_password_here
DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@db:5432/viralkan

# Domain & SSL
DOMAIN=viral.faldi.xyz
ACME_EMAIL=naufaldi.rafif@gmail.com

# GitHub Container Registry
GITHUB_REPOSITORY=naufaldi/viralkan-app
IMAGE_TAG=latest

# Security
JWT_SECRET=your_super_secret_jwt_key_here

# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_API_URL=https://viral.faldi.xyz/api

# Cloudflare R2
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://your_public_domain.com

# Admin & AI
ADMIN_EMAILS=admin1@example.com,admin2@example.com
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
AI_MODEL_FREE=openai/gpt-3.5-turbo
AI_MODEL_PAID=openai/gpt-4
AI_MAX_TOKENS=4000
AI_TEMPERATURE=0.7
```

### 3.2 Database Configuration Best Practices

```env
# ✅ CORRECT - Use postgres user
DATABASE_URL=postgresql://postgres:your_password@db:5432/viralkan

# ❌ WRONG - Don't use root user
DATABASE_URL=postgresql://root:your_password@db:5432/viralkan

# ❌ WRONG - Don't use localhost
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/viralkan
```

## 🐳 Step 4: Docker Compose Configuration

### 4.1 Database Service Configuration

Your `docker-compose.prod.yml` database service should look like this:

```yaml
db:
  image: postgis/postgis:15-3.3
  restart: always
  volumes:
    - db-data:/var/lib/postgresql/data
  environment:
    - POSTGRES_DB=viralkan
    - POSTGRES_PASSWORD=${DB_PASSWORD}
    - POSTGRES_USER=postgres
  expose:
    - 5432
  healthcheck:
    test: ["CMD", "pg_isready", "-U", "postgres"] # ✅ Use postgres user
    interval: 10s
    timeout: 5s
    retries: 5
  networks:
    - web
```

### 4.2 Important Configuration Notes

- ✅ **Use environment variables** instead of Docker secrets
- ✅ **Specify POSTGRES_USER=postgres** explicitly
- ✅ **Use `-U postgres` in health check**
- ✅ **Use `db` as hostname** (container name)
- ❌ **Don't use Docker secrets** (not supported in standard Docker Compose)
- ❌ **Don't use root user** for database connections

## 🚀 Step 5: Deployment

### 5.1 Initial Deployment

```bash
# Pull latest images
docker-compose -f docker-compose.prod.yml --env-file .env.production pull

# Start all services
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# Check status
docker-compose -f docker-compose.prod.yml --env-file .env.production ps
```

### 5.2 Verify Deployment

```bash
# Check all containers are running
docker-compose -f docker-compose.prod.yml --env-file .env.production ps

# Check database connection
docker-compose -f docker-compose.prod.yml --env-file .env.production exec db pg_isready -U postgres

# Test API health
curl -I https://viral.faldi.xyz/api/health

# Test web application
curl -I https://viral.faldi.xyz
```

## 🔄 Step 6: Updates and Maintenance

### 6.1 Update Application

```bash
# Pull new images
docker-compose -f docker-compose.prod.yml --env-file .env.production pull

# Restart services
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# Verify update
docker-compose -f docker-compose.prod.yml --env-file .env.production ps
```

### 6.2 Database Backup

```bash
# Create backup
docker-compose -f docker-compose.prod.yml --env-file .env.production exec db pg_dump -U postgres viralkan > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup (if needed)
docker-compose -f docker-compose.prod.yml --env-file .env.production exec -T db psql -U postgres viralkan < backup_file.sql
```

## 🚨 Troubleshooting

### Database Connection Issues

#### Issue: "role root does not exist"

**Cause:** Health check or connection using wrong user
**Solution:**

```bash
# Check health check configuration
cat docker-compose.prod.yml | grep -A 5 -B 5 "pg_isready"

# Should be: test: ["CMD", "pg_isready", "-U", "postgres"]
# NOT: test: ["CMD", "pg_isready"]

# Fix and restart
docker-compose -f docker-compose.prod.yml --env-file .env.production restart db
```

#### Issue: "DATABASE_URL environment variable is required"

**Cause:** Environment file not loaded
**Solution:**

```bash
# Check environment file exists
ls -la .env.production

# Check DATABASE_URL is set
cat .env.production | grep DATABASE_URL

# Restart with explicit env file
docker-compose -f docker-compose.prod.yml --env-file .env.production down
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

#### Issue: "connection refused"

**Cause:** Database not ready or wrong host
**Solution:**

```bash
# Check database is running
docker-compose -f docker-compose.prod.yml --env-file .env.production ps db

# Wait for database to be ready
docker-compose -f docker-compose.prod.yml --env-file .env.production exec db pg_isready -U postgres

# Check DATABASE_URL uses 'db' as host
cat .env.production | grep DATABASE_URL
```

### Container Health Issues

#### Issue: API container unhealthy

**Solution:**

```bash
# Check API logs
docker-compose -f docker-compose.prod.yml --env-file .env.production logs api

# Restart API container
docker-compose -f docker-compose.prod.yml --env-file .env.production restart api

# Check environment variables
docker-compose -f docker-compose.prod.yml --env-file .env.production exec api env | grep DATABASE_URL
```

### SSL Certificate Issues

```bash
# Check Traefik logs
docker-compose -f docker-compose.prod.yml --env-file .env.production logs reverse-proxy

# Verify ACME_EMAIL is set
cat .env.production | grep ACME_EMAIL
```

## 🔒 Security Best Practices

### 1. Environment File Security

```bash
# Set strict permissions
chmod 600 .env.production
chown $USER:$USER .env.production

# Never commit .env files
echo ".env*" >> .gitignore
```

### 2. Database Security

```bash
# Use strong passwords
openssl rand -base64 32  # Generate strong password

# Use postgres user, never root
# ✅ DATABASE_URL=postgresql://postgres:password@db:5432/viralkan
# ❌ DATABASE_URL=postgresql://root:password@db:5432/viralkan
```

### 3. Container Security

```bash
# Regular updates
docker-compose -f docker-compose.prod.yml --env-file .env.production pull
docker system prune -f

# Monitor logs
docker-compose -f docker-compose.prod.yml --env-file .env.production logs --tail=100
```

## 📊 Monitoring Commands

### Daily Monitoring

```bash
# Check service status
docker-compose -f docker-compose.prod.yml --env-file .env.production ps

# Check resource usage
docker stats --no-stream

# Check disk space
df -h

# Check memory usage
free -h
```

### Log Monitoring

```bash
# Follow all logs
docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f

# Check specific service logs
docker-compose -f docker-compose.prod.yml --env-file .env.production logs api --tail=50
docker-compose -f docker-compose.prod.yml --env-file .env.production logs db --tail=50
```

## 🎯 Success Checklist

- [ ] All containers running (`docker-compose ps`)
- [ ] Database connected (`pg_isready -U postgres`)
- [ ] API responding (`curl /api/health`)
- [ ] Web app accessible (`curl /`)
- [ ] SSL working (`https://`)
- [ ] Environment variables loaded (`env | grep DATABASE`)
- [ ] File permissions secure (`ls -la .env.production`)
- [ ] No error logs (`docker-compose logs`)

## 🚀 Quick Commands Reference

```bash
# Start deployment
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# Stop deployment
docker-compose -f docker-compose.prod.yml --env-file .env.production down

# Check status
docker-compose -f docker-compose.prod.yml --env-file .env.production ps

# View logs
docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f

# Restart specific service
docker-compose -f docker-compose.prod.yml --env-file .env.production restart api

# Update application
docker-compose -f docker-compose.prod.yml --env-file .env.production pull && docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# Complete reset (nuclear option)
docker-compose -f docker-compose.prod.yml --env-file .env.production down
docker volume rm viralkan-app_db-data viralkan-app_letsencrypt
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

## 📝 File Structure

```
~/projects/viralkan-app/
├── docker-compose.prod.yml    # Production compose file
├── .env.production           # Environment variables (secure)
├── env.example              # Template file
├── DEPLOYMENT.md            # This guide
└── backups/                 # Database backups
```

**Follow this guide step by step to avoid the issues we encountered!** 🎉
