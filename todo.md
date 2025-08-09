# VPS Deployment Documentation & TODO

## ✅ Completed Tasks
- [x] Simplify docker-compose.prod.yml - Remove Redis, use external DB on VPS
- [x] Create proper .dockerignore files for API and Web apps
- [x] Update Dockerfiles to follow simple single-stage builds
- [x] Add secrets/ directory to .gitignore for OSS project
- [x] Use environment variables instead of Docker secrets
- [x] Remove root Dockerfile (not needed for single VPS deployment)
- [x] Create .env.production.example with all required variables
- [x] Create GitHub Actions workflow for building and pushing images

## 🚀 CURRENT DEPLOYMENT METHOD: GitHub Container Registry + Manual Deploy

### How It Works:
1. **Automatic**: Push code → GitHub builds & pushes Docker images
2. **Manual**: SSH to VPS → Pull latest images → Restart containers

### GitHub Actions Workflow (Automatic)
File: `.github/workflows/build-and-push.yml`

**What happens when you push to main:**
```
git add .
git commit -m "your changes"
git push origin main
```

**GitHub automatically:**
- ✅ Builds API Docker image → `ghcr.io/naufaldi/viralkan-app/viralkan-api:latest`
- ✅ Builds Web Docker image → `ghcr.io/naufaldi/viralkan-app/viralkan-web:latest`
- ✅ Pushes both images to GitHub Container Registry

### VPS Deployment (Manual)
After GitHub finishes building (usually 2-5 minutes):

```bash
# 1. SSH to your VPS
ssh user@103.59.160.70

# 2. Navigate to project
cd ~/projects/viralkan-app

# 3. Pull latest images from GitHub Container Registry
docker-compose -f docker-compose.prod.yml --env-file .env.production pull

# 4. Restart containers with new images
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# 5. Check logs (optional)
docker-compose -f docker-compose.prod.yml logs -f
```

### First Time Setup on VPS (103.59.160.70)

```bash
# 1. SSH to VPS
ssh user@103.59.160.70

# 2. Install Docker (if not installed)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
# Logout and login again

# 3. Clone repository
mkdir -p ~/projects
git clone https://github.com/naufaldi/viralkan-app.git ~/projects/viralkan-app
cd ~/projects/viralkan-app

# 4. Create production environment file
cp .env.production.example .env.production
nano .env.production  # Fill in your actual values (see template below)

# 5. First deployment
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

## 📋 Environment Variables Template (.env.production)

```env
# Domain Configuration
DOMAIN=viral.faldi.xyz
ACME_EMAIL=naufaldi.rafif@gmail.com

# GitHub Container Registry
GITHUB_REPOSITORY=naufaldi/viralkan-app
IMAGE_TAG=latest

# Database (Your PostgreSQL on VPS)
DB_PASSWORD=your_db_password
# IMPORTANT: When running in Docker, use host 'db' (service name), not 'localhost'
DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@db:5432/viralkan

# Security
JWT_SECRET=your-super-secret-jwt-key

# Firebase Service Account (minified JSON)
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"your-project"...}

# Frontend Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Optional: Cloudflare R2 Storage
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_ENDPOINT=
R2_PUBLIC_URL=

# AI Features (Required for API to start)
ADMIN_EMAILS=
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_BASE_URL=
AI_MODEL_FREE=
AI_MODEL_PAID=
AI_MAX_TOKENS=
AI_TEMPERATURE=
```

## 🎯 Next Steps / TODO

- [ ] Test first deployment on VPS
- [ ] Document any issues encountered
- [x] ✅ Add auto-deploy to GitHub Actions
- [ ] Set up monitoring/logging (optional)

## 🚀 AUTOMATED DEPLOYMENT SETUP

### Required GitHub Secrets

Add these secrets in GitHub → Settings → Secrets and variables → Actions:

```
VPS_HOST=103.59.160.70
VPS_USERNAME=your_vps_username
SSH_PRIVATE_KEY=-----BEGIN OPENSSH PRIVATE KEY-----
your_private_key_content_here
-----END OPENSSH PRIVATE KEY-----
```

### Generate SSH Key for GitHub Actions

On your local machine:
```bash
# Generate SSH key pair
ssh-keygen -t rsa -b 4096 -C "github-actions" -f ~/.ssh/github_actions_key

# Copy public key to VPS
ssh-copy-id -i ~/.ssh/github_actions_key.pub user@103.59.160.70

# Copy private key content for GitHub secret
cat ~/.ssh/github_actions_key
```

### How Auto-Deploy Works Now

**When you push to main:**
1. ✅ GitHub builds Docker images
2. ✅ GitHub pushes images to GHCR  
3. ✅ **NEW**: GitHub automatically deploys to VPS via SSH
4. ✅ VPS pulls latest images and restarts containers

**No more manual SSH needed!** 🎉

## 🔄 Daily Workflow (Now Fully Automated!)

1. **Develop locally**: Make changes, test with `bun run dev`
2. **Commit & push**: `git push origin main`
3. **Wait for auto-deploy**: Check GitHub Actions tab (3-7 minutes total)
4. **Verify**: Check https://viral.faldi.xyz

**That's it!** GitHub handles everything: build → push → deploy → restart 🚀

## 🆘 Troubleshooting

**If deployment fails:**
```bash
# Check container logs
docker-compose -f docker-compose.prod.yml logs api
docker-compose -f docker-compose.prod.yml logs web

# Restart specific service
docker-compose -f docker-compose.prod.yml restart api

# Full restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

**If images fail to pull (GHCR Authentication Required):**

**One-time setup on VPS:**
```bash
# 1. Create GitHub Personal Access Token:
#    - Go to GitHub → Settings → Developer settings → Personal access tokens
#    - Generate new token (classic) with 'read:packages' scope
#    - Copy the token

# 2. Login to GitHub Container Registry on VPS
echo "YOUR_GITHUB_TOKEN" | docker login ghcr.io -u naufaldi --password-stdin

# Should see: "Login Succeeded"
```

**After authentication, try pull again:**
```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production pull
```

**Note:** Docker login credentials are cached, so you only need to do this once per VPS.

## 🐛 Incident: 404 Not Found at https://viral-api.faldi.xyz/

- Root cause: Current Traefik config routes the API only under the main domain with a path prefix. In `docker-compose.prod.yml` the API router is:
  - `Host(${DOMAIN}) && PathPrefix(/api)` → service `api-service` (port 3000)
  - There is NO router defined for the host `viral-api.faldi.xyz`, so Traefik returns 404 for that hostname.
- Impact: Visiting `https://viral-api.faldi.xyz/` returns 404. The correct API base is `https://viral.faldi.xyz/api` (single domain + path-based routing). Frontend should use `NEXT_PUBLIC_API_URL=https://viral.faldi.xyz` so requests become `${BASE}/api/...`.
- Verification:
  - OK: `curl -sS https://viral.faldi.xyz/api/health`
  - 404: `curl -I https://viral-api.faldi.xyz/`
- Contributing config issues found:
  - `.env.production` template used `localhost` in `DATABASE_URL`, which is incorrect inside containers. It must use host `db`. Fixed above.
  - `OPENROUTER_API_KEY` is required by the API at startup, but was marked optional. Marked as required above.

### Options to resolve
- Option A (recommended): Keep path-based routing
  - Use only `DOMAIN=viral.faldi.xyz`
  - Access API at `https://viral.faldi.xyz/api/...`
  - Ensure frontend sets `NEXT_PUBLIC_API_URL=https://viral.faldi.xyz`
  - Remove/avoid references to `viral-api.faldi.xyz`

- Option B: Add dedicated API subdomain
  - Add another router on the API service:
    - `traefik.http.routers.api-subdomain.rule=Host(\`viral-api.faldi.xyz\`)`
    - `traefik.http.routers.api-subdomain.entrypoints=websecure`
    - `traefik.http.routers.api-subdomain.tls.certresolver=myresolver`
    - Reuse `traefik.http.services.api-service.loadbalancer.server.port=3000`
  - Ensure DNS A record for `viral-api.faldi.xyz` points to the VPS IP
  - Then both `https://viral.faldi.xyz/api/...` and `https://viral-api.faldi.xyz/...` will work

### Action items
- [x] Decide: Option B (subdomain)
- [x] Add Traefik labels for `api-subdomain` in `docker-compose.prod.yml`
- [x] Configure `NEXT_PUBLIC_API_URL=https://viral-api.faldi.xyz` (compose reads from env)
- [x] Fix `.env.production` template: `DB_PASSWORD`, `DATABASE_URL` host `db`, and require `OPENROUTER_API_KEY`
- [ ] DNS: Ensure A record `viral-api.faldi.xyz` → VPS IP (103.59.160.70)
- [ ] Deploy: `docker-compose -f docker-compose.prod.yml --env-file .env.production up -d`
- [ ] Verify: `curl -sS https://viral-api.faldi.xyz/health` and `/docs`