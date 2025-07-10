# Viralkan RFC – Version 1 (MVP)

**Goal:** Ship a self‑hosted, single‑developer MVP that lets anyone log in with Google, upload a photo of road damage, and show every report in a public list. The repo must be easy to spin up locally (one command) and deploy on a small VPS running Docker + Traefik.

> **TL;DR for busy humans & AI**
>
> ```bash
> git clone https://github.com/you/viralkan && cd viralkan
> bun install && turbo run dev            # starts API + Web on ports 3000/5173
> docker compose -f infra/docker/compose.yml up --build  # production stack with Traefik
> ```

---

## 1 · Scope

* **IN** — Google OAuth, image upload to Cloudflare R2, public list page, Postgres schema with GIS columns, multi-step form, pagination, reCAPTCHA, PWA capabilities.
* **OUT** — EXIF parsing, map view, admin dashboard (future V2+).

---

## 2 · Tech Stack

| Layer         | Choice                            | Why                                    |
| ------------- | --------------------------------- | -------------------------------------- |
| Runtime       | **Bun 1.x**                       | Fast TS runtime, single binary         |
| API           | **Hono**                          | Tiny, edge‑friendly router             |
| Frontend      | **React 18 + Vite + Tailwind v4** | Familiar, hot‑reload, utility CSS      |
| Mono‑repo     | **Turborepo**                     | One‑command builds & shared code       |
| Storage       | **Cloudflare R2**                 | Cheap S3 clone near Jakarta            |
| DB            | **PostgreSQL 15 + PostGIS**       | Spatial ready                          |
| Reverse Proxy | **Traefik v3**                    | Auto‑TLS, Docker labels, single binary |
| Security      | **reCAPTCHA v3**                  | Abuse protection                       |
| PWA           | **Vite PWA Plugin**               | Offline support                        |

---

## 3 · Repository Skeleton

```
viralkan/
├─ apps/
│  ├─ api/              # Bun + Hono server
│  │  ├─ src/
│  │  │  ├─ routes/
│  │  │  │  ├─ auth/    # Google OAuth handlers
│  │  │  │  ├─ reports/ # CRUD operations
│  │  │  │  └─ me/      # User-specific endpoints
│  │  │  ├─ middleware/ # Auth, rate limiting
│  │  │  ├─ schema/     # Database models
│  │  │  └─ config/     # Environment, Firebase
│  │  └─ package.json
│  └─ web/              # React frontend
│     ├─ src/
│     │  ├─ pages/      # Route components
│     │  ├─ components/ # Shared UI components
│     │  ├─ hooks/      # Custom React hooks
│     │  └─ lib/        # Utilities
│     └─ package.json
├─ packages/
│  ├─ ui/               # Shared Tailwind components
│  │  ├─ components/ui/ # shadcn/ui components
│  │  └─ src/           # Custom components
│  ├─ config/           # Shared configs
│  └─ validators/       # Zod schemas
└─ infra/
   └─ docker/
      ├─ compose.yml
      ├─ traefik.yml
      ├─ Dockerfile.api
      └─ Dockerfile.web
```

### 3.1 Turborepo Tasks

```jsonc
// turbo.json
{
  "pipeline": {
    "dev":    { "cache": false, "dependsOn": ["^dev"], "outputs": [] },
    "build":  { "outputs": ["dist/**"] },
    "lint":   {},
    "test":   {}
  }
}
```

*`bunx turbo run dev`* spins up API (port 3000) & Web (5173) with watch mode.

---

## 4 · Page Architecture & Routes

| Route | Purpose | Auth Required | API Endpoints | Key Components |
|-------|---------|---------------|---------------|----------------|
| `/` | Landing page | No | None | Hero, CTA buttons |
| `/reports` | Public reports list | No | `GET /api/reports` | DataTable, pagination |
| `/reports/[id]` | Report detail | No | `GET /api/reports/:id` | ImageViewer, metadata |
| `/login` | Authentication | No | Google OAuth | LoginForm |
| `/auth/callback` | OAuth callback | No | Token exchange | LoadingSpinner |
| `/dashboard` | User dashboard | Yes | `GET /api/me/*` | Stats, ReportCard |
| `/dashboard/reports` | User reports list | Yes | `GET /api/me/reports` | DataTable |
| `/reports/create` | Create report form | Yes | `POST /api/reports` | ImageUpload, Form |
| `/reports/create/success` | Success confirmation | Yes | None | SuccessMessage |
| `/404` | Not found | No | None | ErrorPage |
| `/500` | Server error | No | None | ErrorPage |
| `/offline` | Offline state | No | None | OfflinePage |

### 4.1 User Flows

**Flow A: Anonymous User Browsing**
```
[Landing] → [Public Reports] → [Report Detail] → [Login] → [Dashboard]
```

**Flow B: Authenticated User Creating Report**
```
[Dashboard] → [Create Report] → [Upload Image] → [Fill Details] → [Review] → [Success]
```

**Flow C: Error Handling**
```
[Any Page] → [Error] → [Error Page] → [Recovery Action]
```

---

## 5 · API Endpoints (Comprehensive)

### 5.1 Authentication
```http
GET  /api/auth/google     -> 302 Redirect to Google OAuth
POST /api/auth/callback   -> 200 OK {token} | 400 Error
POST /api/auth/logout     -> 200 OK
GET  /api/auth/me         -> 200 OK {user} | 401 Unauthorized
```

### 5.2 Reports (Public)
```http
GET /api/reports?page=1&limit=10&category=berlubang
  -> 200 OK {items: Report[], total: number, page: number}

GET /api/reports/:id
  -> 200 OK {report: Report} | 404 Not Found
```

### 5.3 Reports (User-specific)
```http
GET /api/me/reports?page=1&limit=10
  -> 200 OK {items: Report[], total: number} | 401

GET /api/me/stats
  -> 200 OK {totalReports: number, thisMonth: number, byCategory: {}} | 401

POST /api/reports
  -> 201 Created {id: string, message: string} | 400 | 401
  Content-Type: multipart/form-data
  Body: {image: File, category: string, street: string, location: string}
```

### 5.4 File Upload
```http
POST /api/upload/signed-url
  -> 200 OK {uploadUrl: string, fileKey: string} | 401
  Body: {fileName: string, fileType: string, fileSize: number}
```

### 5.5 Error Responses
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid file type. Only JPEG and PNG allowed.",
    "details": {...}
  }
}
```

---

## 6 · Component Library Requirements

### 6.1 Shared UI Components
```typescript
// packages/ui/src/components/
├─ Header.tsx         # Navigation with auth state
├─ DataTable.tsx      # Sortable, paginated table
├─ ReportCard.tsx     # Report display component
├─ ImageUpload.tsx    # Drag & drop file upload
├─ ImageViewer.tsx    # Image display with zoom
├─ LoadingSpinner.tsx # Loading states
├─ ErrorBoundary.tsx  # Error handling
├─ Badge.tsx          # Category/status indicators
├─ Button.tsx         # Various button styles
├─ Form.tsx           # Form components with validation
├─ Modal.tsx          # Confirmation dialogs
├─ Breadcrumb.tsx     # Navigation breadcrumbs
├─ Pagination.tsx     # Table pagination
└─ StatsCard.tsx      # Dashboard statistics
```

### 6.2 shadcn/ui Integration
```typescript
// packages/ui/components/ui/ (from shadcn)
├─ button.tsx
├─ card.tsx
├─ input.tsx
├─ label.tsx
├─ table.tsx
├─ dialog.tsx
├─ form.tsx
├─ badge.tsx
├─ alert.tsx
└─ skeleton.tsx
```

---

## 7 · Database Schema (GIS-Ready)

```sql
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  google_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE reports (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_key TEXT NOT NULL,  -- R2 object key
  category TEXT NOT NULL CHECK (category IN ('berlubang','retak','lainnya')),
  street_name TEXT NOT NULL,
  location_text TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','in_progress','resolved')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Performance indexes
CREATE INDEX reports_created_at_idx ON reports(created_at DESC);
CREATE INDEX reports_user_idx ON reports(user_id);
CREATE INDEX reports_category_idx ON reports(category);
CREATE INDEX reports_status_idx ON reports(status);

-- Spatial index for V3 (safe to add now)
CREATE INDEX reports_geo_idx ON reports USING GIST (geography(ST_MakePoint(lon,lat)));

-- Rate limiting table
CREATE TABLE rate_limits (
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, action)
);
```

---

## 8 · Local Dev Setup (5 steps)

1. **Clone & Install** — `bun install` (root).
2. **Env vars** — copy `.env.example` → `.env` (set Google keys & R2 keys).
3. **Start services** — `bunx turbo run dev`.
4. **Init DB** — `bunx sqitch deploy` (creates tables).
5. **Open** `http://localhost:5173` → upload a test pothole.

### 8.1 Environment Variables
```bash
# API (.env)
DATABASE_URL=postgres://postgres:password@localhost:5432/viralkan
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
R2_ACCESS_KEY=your_r2_access_key
R2_SECRET_KEY=your_r2_secret_key
R2_BUCKET=viralkan-images
R2_ENDPOINT=https://your-account.r2.cloudflarestorage.com
RECAPTCHA_SECRET_KEY=your_recaptcha_secret
JWT_SECRET=your_jwt_secret

# Web (.env)
VITE_API_URL=http://localhost:3000
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 9 · Production Stack (Docker + Traefik)

### 9.1 compose.yml (excerpt)

```yaml
version: "3.9"
services:
  traefik:
    image: traefik:v3.0
    command:
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.cf.acme.dnschallenge=true"
      - "--certificatesresolvers.cf.acme.dnschallenge.provider=cloudflare"
      - "--certificatesresolvers.cf.acme.email=admin@viralkan.app"
      - "--certificatesresolvers.cf.acme.storage=/letsencrypt/acme.json"
    environment:
      - CF_DNS_API_TOKEN=${CF_DNS_API_TOKEN}
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./letsencrypt:/letsencrypt
      - /var/run/docker.sock:/var/run/docker.sock

  api:
    build: ../../apps/api
    environment:
      - DATABASE_URL=postgres://postgres:${POSTGRES_PASSWORD}@db:5432/viralkan
      - R2_ACCESS_KEY=${R2_ACCESS_KEY}
      - R2_SECRET_KEY=${R2_SECRET_KEY}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - RECAPTCHA_SECRET_KEY=${RECAPTCHA_SECRET_KEY}
      - JWT_SECRET=${JWT_SECRET}
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api.rule=Host(`api.viralkan.app`)"
      - "traefik.http.routers.api.entrypoints=websecure"
      - "traefik.http.routers.api.tls.certresolver=cf"
      - "traefik.http.services.api.loadbalancer.server.port=3000"

  web:
    build: ../../apps/web
    environment:
      - VITE_API_URL=https://api.viralkan.app
      - VITE_RECAPTCHA_SITE_KEY=${RECAPTCHA_SITE_KEY}
      - VITE_GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.web.rule=Host(`viralkan.app`,`www.viralkan.app`)"
      - "traefik.http.routers.web.entrypoints=websecure"
      - "traefik.http.routers.web.tls.certresolver=cf"
      - "traefik.http.services.web.loadbalancer.server.port=80"

  db:
    image: postgis/postgis:15
    environment:
      - POSTGRES_DB=viralkan
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql

volumes:
  postgres-data:
```

---

## 10 · Security & Performance

### 10.1 Rate Limiting
```typescript
// Per user limits
const RATE_LIMITS = {
  REPORT_CREATION: { max: 10, window: '24h' },
  IMAGE_UPLOAD: { max: 20, window: '1h' },
  API_REQUESTS: { max: 1000, window: '1h' }
};
```

### 10.2 Image Processing
```typescript
// Client-side validation
const IMAGE_CONSTRAINTS = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png'],
  maxDimensions: { width: 4096, height: 4096 }
};
```

### 10.3 PWA Configuration
```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.viralkan\.app\/api\/reports/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 300 }
            }
          }
        ]
      }
    })
  ]
});
```

---

## 11 · Milestone Checklist (Solo‑Dev)

| #  | Deliverable                                    | Est (d) | Dependencies |
|----|------------------------------------------------|---------|--------------|
| 1  | VPS ready, Docker + Traefik installed         | 0.5     | -            |
| 2  | Cloudflare R2 bucket & DNS token               | 0.5     | -            |
| 3  | Turbo monorepo scaffold                        | 0.5     | -            |
| 4  | Tailwind v4 + shadcn/ui setup                 | 1       | 3            |
| 5  | Component library (ui package)                 | 1.5     | 4            |
| 6  | Google OAuth with Firebase                     | 1.5     | 3            |
| 7  | Postgres migrations + PostGIS                  | 1       | 3            |
| 8  | R2 signed-URL upload service                   | 1.5     | 2, 6         |
| 9  | Multi-step upload form + preview               | 2       | 5, 8         |
| 10 | Public reports list with pagination            | 1.5     | 5, 7         |
| 11 | User dashboard with stats                      | 1.5     | 6, 7         |
| 12 | Report detail pages                            | 1       | 5, 7         |
| 13 | Error handling + PWA setup                     | 1       | 5            |
| 14 | reCAPTCHA integration                          | 1       | 9            |
| 15 | Rate limiting middleware                       | 1       | 6, 7         |
| 16 | Docker builds + compose.yml                    | 1       | 1            |
| 17 | GitHub Actions CI/CD                           | 1       | 16           |
| 18 | QA testing + bug fixes                         | 2       | All          |
| **Total** | **20 days**                                | **20**  |              |

---

## 12 · Testing Strategy

### 12.1 Unit Tests
```typescript
// API routes testing
describe('POST /api/reports', () => {
  it('creates report with valid data', async () => {
    const response = await app.request('/api/reports', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    expect(response.status).toBe(201);
  });
});
```

### 12.2 Integration Tests
```typescript
// Database integration
describe('Reports CRUD', () => {
  it('creates and retrieves report', async () => {
    const report = await createReport(testData);
    const retrieved = await getReport(report.id);
    expect(retrieved.category).toBe(testData.category);
  });
});
```

### 12.3 E2E Tests (Playwright)
```typescript
// User flow testing
test('complete report creation flow', async ({ page }) => {
  await page.goto('/login');
  await page.click('[data-testid="google-login"]');
  await page.goto('/reports/create');
  await page.setInputFiles('[data-testid="image-upload"]', 'test-image.jpg');
  await page.selectOption('[data-testid="category"]', 'berlubang');
  await page.fill('[data-testid="street"]', 'Jl. Test');
  await page.fill('[data-testid="location"]', 'Test location');
  await page.click('[data-testid="submit"]');
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});
```

---

## 13 · Monitoring & Observability

### 13.1 Metrics Collection
```typescript
// Custom metrics
const metrics = {
  reportCreations: new Counter('reports_created_total'),
  uploadDuration: new Histogram('upload_duration_seconds'),
  authFailures: new Counter('auth_failures_total')
};
```

### 13.2 Health Checks
```typescript
// API health endpoint
app.get('/health', async (c) => {
  const dbHealth = await checkDatabase();
  const r2Health = await checkR2Connection();
  
  return c.json({
    status: dbHealth && r2Health ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    services: { database: dbHealth, storage: r2Health }
  });
});
```

---

## 14 · Open Points

* **Avatar URL** — hot‑link Google photo vs cache? (lean = hot‑link)
* **Image retention** — purge >12 months via nightly job?
* **Monitoring** — Traefik/Loki log ship later.
* **CDN** — Cloudflare in front of R2 for faster image delivery?
* **Backup strategy** — Automated DB backups to R2?

---

*This comprehensive RFC incorporates all PRD requirements while maintaining implementation focus. Ready for development sprint planning.*
