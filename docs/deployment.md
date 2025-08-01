# Viralkan VPS Deployment Guide

This guide covers deploying Viralkan to a VPS using Docker and Traefik with automatic SSL certificates.

## 🚀 Quick Deployment

### Prerequisites

- Fresh Ubuntu 20.04+ VPS
- Domain name pointed to your VPS IP
- SSH access to the server
- GitHub account for container registry

### 1. Initial VPS Setup

```bash
# Run the setup script on your VPS
curl -sSL https://raw.githubusercontent.com/yourusername/viralkan-app/main/scripts/setup.sh | bash

# Reboot the system
sudo reboot
```

### 2. Clone and Configure

```bash
# Clone the repository
git clone https://github.com/yourusername/viralkan-app.git ~/viralkan-app
cd ~/viralkan-app

# Configure environment
cp .env.production .env.production.local
nano .env.production.local  # Edit with your values

# Add Firebase service account
nano secrets/firebase-service-account.json  # Paste your Firebase config
```

### 3. Deploy

```bash
# Deploy to production
./scripts/deploy.sh production
```

## 🏗️ Architecture Overview

### Services Stack

```
┌─────────────────────────────────────────┐
│                Internet                  │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│            Traefik                       │
│      (Reverse Proxy + SSL)              │
└─────────────┬───────────────────────────┘
              │
    ┌─────────▼─────────┐    ┌─────────┐
    │   Web App         │    │   API   │
    │   (Next.js)       │    │ (Hono)  │
    │   Port: 3000      │    │Port:3000│
    └─────────┬─────────┘    └────┬────┘
              │                   │
              └─────────┬─────────┘
                        │
            ┌───────────▼──────────┐
            │     PostgreSQL       │
            │     + PostGIS        │
            │     Port: 5432       │
            └──────────────────────┘
```

### Key Features

- **Automatic SSL**: Let's Encrypt certificates via Traefik
- **Zero Downtime**: Rolling updates with health checks
- **Auto Updates**: Watchtower for automatic container updates
- **Database Backups**: Daily automated backups
- **Rate Limiting**: Built-in DDoS protection
- **Monitoring**: Health checks and logging

## 📦 Container Images

### Building Images

```bash
# Build API image
docker build -f apps/api/Dockerfile -t viralkan-api .

# Build Web image  
docker build -f apps/web/Dockerfile -t viralkan-web .

# Build with multi-target
docker build --target api-production -t viralkan-api .
docker build --target web-production -t viralkan-web .
```

### GitHub Container Registry

```bash
# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u yourusername --password-stdin

# Tag and push
docker tag viralkan-api ghcr.io/yourusername/viralkan-app/api:latest
docker tag viralkan-web ghcr.io/yourusername/viralkan-app/web:latest

docker push ghcr.io/yourusername/viralkan-app/api:latest
docker push ghcr.io/yourusername/viralkan-app/web:latest
```

## 🌍 Environment Configurations

### Development
- Uses local Docker build
- HTTP only (no SSL)
- Single replica
- Debug logging enabled

### Staging
- Uses GitHub Container Registry images
- SSL with Let's Encrypt
- Single replica
- Staging subdomain

### Production
- Uses GitHub Container Registry images
- SSL with Let's Encrypt
- Multiple replicas
- Rate limiting enabled
- Database backups
- Monitoring

## 🔧 Configuration Files

### Environment Variables

```bash
# .env.production.local
DOMAIN=viralkan.com
ACME_EMAIL=admin@viralkan.com
GITHUB_REPOSITORY=yourusername/viralkan-app
IMAGE_TAG=latest
REDIS_PASSWORD=your-secure-redis-password
FIREBASE_PROJECT_ID=your-firebase-project
R2_ACCESS_KEY=your-cloudflare-r2-key
R2_SECRET_KEY=your-cloudflare-r2-secret
R2_BUCKET=viralkan-uploads
R2_ENDPOINT=https://account-id.r2.cloudflarestorage.com
```

### Secrets Management

Store sensitive data in separate files:

```bash
secrets/
├── db-password.txt           # Database password
├── jwt-secret.txt           # JWT signing secret
├── nextauth-secret.txt      # NextAuth.js secret
└── firebase-service-account.json  # Firebase credentials
```

## 🚀 Deployment Commands

### Basic Deployment

```bash
# Deploy to production
./scripts/deploy.sh production

# Deploy specific version
./scripts/deploy.sh production v1.2.0

# Deploy to staging
./scripts/deploy.sh staging
```

### Service Management

```bash
# View running services
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f api
docker-compose -f docker-compose.prod.yml logs -f web

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale api=3 --scale web=2

# Stop services
docker-compose -f docker-compose.prod.yml down

# Update single service
docker-compose -f docker-compose.prod.yml up -d --no-deps api
```

## 💾 Database Management

### Backups

```bash
# Manual backup
docker-compose -f docker-compose.prod.yml exec db pg_dump -U viralkan viralkan > backup.sql

# Automated backups (configured via cron)
~/viralkan-app/backup.sh
```

### Restore

```bash
# Restore from backup
docker-compose -f docker-compose.prod.yml exec -T db psql -U viralkan viralkan < backup.sql
```

### Migrations

```bash
# Run migrations
docker-compose -f docker-compose.prod.yml exec api bun run db:migrate

# Reset database (DANGER!)
docker-compose -f docker-compose.prod.yml exec api bun run db:reset
```

## 📊 Monitoring & Logs

### Health Checks

```bash
# Check API health
curl https://your-domain.com/api/health

# Check web health
curl https://your-domain.com/

# Internal health checks
docker-compose -f docker-compose.prod.yml exec api curl http://localhost:3000/health
```

### Logs

```bash
# Application logs
docker-compose -f docker-compose.prod.yml logs -f --tail=100 api web

# Traefik logs
docker-compose -f docker-compose.prod.yml logs -f traefik

# Database logs
docker-compose -f docker-compose.prod.yml logs -f db

# System logs
journalctl -u docker -f
```

### Traefik Dashboard

Access at `https://your-domain.com:8080` (if enabled in staging)

## 🔒 Security Considerations

### Firewall Configuration

```bash
# UFW rules (configured by setup script)
sudo ufw status

# Allow additional ports if needed
sudo ufw allow 8080/tcp  # Traefik dashboard
```

### SSL Certificates

- Automatic Let's Encrypt certificates via Traefik
- Stored in `letsencrypt` volume
- Auto-renewal every 60 days

### Secrets Management

- All secrets stored in separate files
- Docker secrets for production
- Proper file permissions (600)

## 🔄 Updates & Maintenance

### Automatic Updates

Watchtower automatically updates containers with the `watchtower.enable=true` label:

```bash
# Check watchtower logs
docker logs viralkan_production_watchtower_1
```

### Manual Updates

```bash
# Update to latest
~/viralkan-app/update.sh

# Update to specific version
IMAGE_TAG=v1.2.0 ~/viralkan-app/update.sh
```

### System Maintenance

```bash
# Clean up Docker resources
docker system prune -f

# Clean up old images
docker image prune -f

# Clean up old backups (automated via cron)
find ~/viralkan-app/backups -name "*.sql.gz" -mtime +7 -delete
```

## 🚨 Troubleshooting

### Common Issues

#### 1. SSL Certificate Issues

```bash
# Check certificate status
docker-compose -f docker-compose.prod.yml logs traefik | grep acme

# Force certificate renewal
docker-compose -f docker-compose.prod.yml restart traefik
```

#### 2. Database Connection Issues

```bash
# Check database health
docker-compose -f docker-compose.prod.yml exec db pg_isready -U viralkan

# Check database logs
docker-compose -f docker-compose.prod.yml logs db
```

#### 3. Service Health Issues

```bash
# Check service status
docker-compose -f docker-compose.prod.yml ps

# Restart unhealthy services
docker-compose -f docker-compose.prod.yml restart api web
```

### Emergency Procedures

#### 1. Rollback Deployment

```bash
# Rollback to previous image
IMAGE_TAG=previous-version ./scripts/deploy.sh production
```

#### 2. Database Recovery

```bash
# Stop services
docker-compose -f docker-compose.prod.yml stop api web

# Restore database
docker-compose -f docker-compose.prod.yml exec -T db psql -U viralkan viralkan < backups/latest-backup.sql

# Start services
docker-compose -f docker-compose.prod.yml start api web
```

## 📈 Performance Optimization

### Resource Limits

Add to Docker Compose services:

```yaml
deploy:
  resources:
    limits:
      memory: 512M
      cpus: '0.5'
    reservations:
      memory: 256M
      cpus: '0.25'
```

### Database Optimization

```sql
-- PostgreSQL performance tuning
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
SELECT pg_reload_conf();
```

### Nginx Caching (Optional)

Add Nginx in front of Traefik for static file caching:

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    proxy_pass http://traefik;
}
```

## 🔗 Useful Links

- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Let's Encrypt Rate Limits](https://letsencrypt.org/docs/rate-limits/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [PostGIS Docker Image](https://hub.docker.com/r/postgis/postgis)

---

## Support

For deployment issues:
1. Check the logs first
2. Review this documentation
3. Open an issue on GitHub
4. Join our community discussions