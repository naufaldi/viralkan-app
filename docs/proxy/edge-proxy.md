# Edge Proxy Documentation

## Overview

This documentation explains the **Edge Proxy Architecture** using Caddy for containerized applications on a single VPS. The goal is to have one centralized reverse proxy handling all HTTP/HTTPS traffic while maintaining security and simplicity.

## The Problem

### Before Edge Proxy
```bash
# Multiple containers exposing random ports
docker ps --format 'table {{.Names}}\t{{.Ports}}'
NAMES                        PORTS 
viralkan-app_web_1           0.0.0.0:41451->3000/tcp
image-extract-app-1          0.0.0.0:32772->3000/tcp
image-extract-app-2          0.0.0.0:32771->3000/tcp
guestbook-guestbook-3        8080/tcp
viralkan-app_db_1            5432/tcp
```

**Issues:**
- Multiple random ports exposed (41451, 32772, 32771)
- Security risk: databases exposing ports
- No automatic TLS certificates
- Port conflicts and management complexity
- No centralized routing

### After Edge Proxy
```bash
# Only Caddy exposes standard ports
docker ps --format 'table {{.Names}}\t{{.Ports}}'
NAMES                    PORTS
edge-proxy-caddy-1      0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
other-containers        (no ports exposed)
```

**Benefits:**
- Single entry point (ports 80/443)
- Automatic TLS certificates via Let's Encrypt
- Domain-based routing
- Enhanced security (no exposed database ports)
- Centralized configuration

## Architecture

### Components

1. **Caddy** (`lucaslorentz/caddy-docker-proxy`)
   - Reverse proxy with automatic TLS
   - Reads Docker labels for configuration
   - Only service exposing ports 80/443

2. **Socket Proxy** (`tecnativa/docker-socket-proxy`)
   - Secure gateway to Docker API
   - Minimal permissions (CONTAINERS=1, NETWORKS=1, SERVICES=1)
   - Read-only Docker socket access

3. **Watchtower** (`containrrr/watchtower`)
   - Automatic container updates
   - Label-based selective updates
   - Scheduled updates (3 AM daily)

### Network Design

```
┌─────────────────┐    ┌──────────────────┐
│   Internet      │────│  Caddy (80/443)  │
└─────────────────┘    └──────────────────┘
                                │
                        ┌───────┴───────┐
                        │  edge network │
                        └───────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
┌───────▼────────┐    ┌────────▼────────┐    ┌────────▼────────┐
│   App 1        │    │   App 2         │    │   App 3         │
│ ┌────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │    Web     │ │    │ │    Web      │ │    │ │    Web      │ │
│ └────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│ ┌────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │     DB     │ │    │ │     DB      │ │    │ │     DB      │ │
│ └────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└────────────────┘    └─────────────────┘    └─────────────────┘
   private network       private network       private network
```

## Implementation Guide

### Step 1: Deploy Edge Proxy

```bash
# Create external network
docker network create edge

# Deploy edge proxy
cd /projects/edge-proxy
docker compose up -d

# Verify deployment
docker logs -f edge-proxy-caddy-1
```

### Step 2: Refactor Applications

For each application, modify `docker-compose.yml`:

#### Remove Port Mappings
```yaml
# BEFORE (❌ Remove this)
services:
  web:
    ports:
      - "3000:3000"  # Remove all port mappings
```

#### Add Caddy Labels
```yaml
# AFTER (✅ Add this)
services:
  web:
    image: your-app
    labels:
      caddy: dev.faldi.xyz  # Your domain
      caddy.reverse_proxy: "{{upstreams 3000}}"
    networks:
      - edge
      - app-private
```

#### Configure Networks
```yaml
networks:
  edge:
    external: true
  app-private:
    driver: bridge
```

#### Secure Databases
```yaml
services:
  db:
    image: postgres
    # NO ports: section
    networks:
      - app-private  # Only private network
```

### Step 3: Complete Example

```yaml
# Example: guestbook/docker-compose.yml
version: "3.8"

services:
  web:
    image: guestbook-app
    labels:
      caddy: dev.faldi.xyz
      caddy.reverse_proxy: "{{upstreams 8080}}"
      com.centurylinklabs.watchtower.enable: "true"
    networks:
      - edge
      - guestbook-private
    depends_on:
      - db

  db:
    image: postgres:13
    environment:
      POSTGRES_DB: guestbook
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - db_data:/var/lib/postgresql/data
    networks:
      - guestbook-private  # Only private network

volumes:
  db_data:

networks:
  edge:
    external: true
  guestbook-private:
    driver: bridge
```

## Caddy Labels Reference

### Basic Routing
```yaml
labels:
  caddy: example.com
  caddy.reverse_proxy: "{{upstreams 3000}}"
```

### Path-based Routing
```yaml
labels:
  caddy: example.com
  caddy.reverse_proxy: "/api/* {{upstreams 3000}}"
```

### Multiple Domains
```yaml
labels:
  caddy_0: app.example.com
  caddy_0.reverse_proxy: "{{upstreams 3000}}"
  caddy_1: api.example.com
  caddy_1.reverse_proxy: "{{upstreams 4000}}"
```

### Custom TLS
```yaml
labels:
  caddy: example.com
  caddy.reverse_proxy: "{{upstreams 3000}}"
  caddy.tls: "internal"  # For development
```

## Troubleshooting

### Common Issues

#### 1. Containers Still Exposing Ports
**Problem:** `docker ps` shows random ports
**Solution:** Remove all `ports:` sections from docker-compose.yml

#### 2. 404 Not Found
**Problem:** Domain returns 404
**Checks:**
- Verify Caddy labels are correct
- Ensure container is on `edge` network
- Check DNS resolution

```bash
# Debug commands
docker network inspect edge
docker logs edge-proxy-caddy-1
curl -H "Host: dev.faldi.xyz" http://localhost
```

#### 3. TLS Certificate Issues
**Problem:** SSL/TLS errors
**Checks:**
- Verify DNS points to VPS IP
- Ensure ports 80/443 are open
- Check Caddy logs for ACME challenges

```bash
# Check certificate status
docker exec edge-proxy-caddy-1 caddy list-certificates
```

#### 4. Database Connection Issues
**Problem:** App can't connect to database
**Solution:** Ensure both app and DB are on same private network

```yaml
# Both services need same private network
services:
  web:
    networks: [edge, app-private]
  db:
    networks: [app-private]  # No edge network
```

### Verification Commands

```bash
# Port audit (should only show Caddy)
docker ps --format 'table {{.Names}}\t{{.Ports}}'

# Network inspection
docker network inspect edge

# HTTP testing
curl -I https://dev.faldi.xyz
curl -I https://image.faldi.xyz

# Caddy configuration
docker exec edge-proxy-caddy-1 caddy config

# Watchtower logs
docker logs edge-proxy-watchtower-1
```

## Security Benefits

1. **Single Attack Surface**: Only ports 80/443 exposed
2. **Database Protection**: No external database access
3. **Automatic TLS**: Let's Encrypt certificates
4. **Socket Security**: Docker API access via proxy
5. **Network Isolation**: Private networks per application

## Maintenance

### Updates
- Watchtower automatically updates containers with label `com.centurylinklabs.watchtower.enable=true`
- Scheduled daily at 3 AM
- Rolling restart to minimize downtime

### Monitoring
```bash
# Check all services
docker compose -f /projects/edge-proxy/docker-compose.yml ps

# Monitor logs
docker logs -f edge-proxy-caddy-1
docker logs -f edge-proxy-watchtower-1
```

### Backup
```bash
# Backup Caddy data (certificates, config)
docker run --rm -v edge-proxy_caddy_data:/data -v $(pwd):/backup alpine tar czf /backup/caddy-backup.tar.gz /data
```

## Migration Checklist

- [ ] Deploy edge-proxy stack
- [ ] Create `edge` network
- [ ] For each application:
  - [ ] Remove `ports:` mappings
  - [ ] Add Caddy labels
  - [ ] Add `edge` network
  - [ ] Keep databases on private networks only
  - [ ] Add Watchtower labels if auto-update desired
- [ ] Verify only Caddy exposes ports 80/443
- [ ] Test domain access
- [ ] Verify TLS certificates

This architecture provides a robust, secure, and maintainable solution for hosting multiple containerized applications on a single VPS.