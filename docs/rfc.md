# Viralkan RFC – Version 1 (MVP)

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

* **IN** — Google OAuth, image upload to Cloudflare R2, public list page, Postgres schema with GIS columns.
* **OUT** — EXIF parsing, map view, admin dashboard (future V2+).

---

## 2 · Tech Stack

| Layer         | Choice                            | Why                                    |
| ------------- | --------------------------------- | -------------------------------------- |
| Runtime       | **Bun 1.x**                       | Fast TS runtime, single binary         |
| API           | **Hono**                          | Tiny, edge‑friendly router             |
| Frontend      | **React 18 + Vite + Tailwind v4** | Familiar, hot‑reload, utility CSS      |
| Mono‑repo     | **Turborepo**                     | One‑command builds & shared code       |
| Storage       | **Cloudflare R2**                 | Cheap S3 clone near Jakarta            |
| DB            | **PostgreSQL 15 + PostGIS**       | Spatial ready                          |
| Reverse Proxy | **Traefik v3**                    | Auto‑TLS, Docker labels, single binary |

---

## 3 · Repository Skeleton

```
viralkan/
├─ apps/
│  ├─ api/              # Bun + Hono server (src, routes, validators)
│  └─ web/              # React frontend (pages, hooks, components)
├─ packages/
│  ├─ ui/               # Shared Tailwind components (Button, Card)
│  ├─ config/           # tsconfig, eslint, tailwind config, turbo.json
│  └─ validators/       # Zod schemas shared by api & web
└─ infra/
   └─ docker/
      ├─ compose.yml
      ├─ traefik.yml    # Traefik static config
      ├─ Dockerfile.api
      └─ Dockerfile.web
```

### 3.1 Turborepo Tasks

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

*`bunx turbo run dev`* spins up API (port 3000) & Web (5173) with watch mode.

---

## 4 · Local Dev Setup (5 steps)

1. **Clone & Install** — `bun install` (root).
2. **Env vars** — copy `.env.example` → `.env` (set Google keys & R2 keys).
3. **Start services** — `bunx turbo run dev`.
4. **Init DB** — `bunx sqitch deploy` (creates tables).
5. **Open** `http://localhost:5173` → upload a test pothole.

---

## 5 · Production Stack (Docker + Traefik)

### 5.1 compose.yml (excerpt)

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
    build: ../../apps/api  # Dockerfile.api
    environment:
      - DATABASE_URL=postgres://postgres:${POSTGRES_PASSWORD}@db:5432/viralkan
      - R2_ACCESS_KEY=${R2_ACCESS_KEY}
      - R2_SECRET_KEY=${R2_SECRET_KEY}
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api.rule=Host(`api.viralkan.app`)"
      - "traefik.http.routers.api.entrypoints=websecure"
      - "traefik.http.routers.api.tls.certresolver=cf"

  web:
    build: ../../apps/web  # Dockerfile.web
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.web.rule=Host(`viralkan.app`,`www.viralkan.app`)"
      - "traefik.http.routers.web.entrypoints=websecure"
      - "traefik.http.routers.web.tls.certresolver=cf"

  db:
    image: postgis/postgis:15
    environment:
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data:
```

*Traefik uses Cloudflare DNS‑01 to issue certificates automatically.*

---

## 6 · Database Schema (ready for GIS)

```sql
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  google_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE reports (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  category  TEXT NOT NULL CHECK (category IN ('berlubang','retak','lainnya')),
  street_name   TEXT NOT NULL,
  location_text TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- V1 indexes
CREATE INDEX reports_created_at_idx ON reports(created_at DESC);
CREATE INDEX reports_user_idx       ON reports(user_id);

-- Spatial index for V3 (safe to add now)
CREATE INDEX reports_geo_idx ON reports USING GIST (geography(ST_MakePoint(lon,lat)));
```

### 6.1 Planned Migrations

| Version | Change                                                    | Why              |
| ------- | --------------------------------------------------------- | ---------------- |
| **V2**  | Add `exif_gps` GEOGRAPHY column + trigger to sync lat/lon | EXIF autofill    |
| **V2**  | Index `(category,created_at)`                             | Filter dashboard |
| **V3**  | Materialised view `reports_heat`                          | Fast map density |

---

## 7 · API Endpoints

```http
POST /api/reports      -> 201 Created {id}
GET  /api/reports      -> 200 OK {items,total}
GET  /api/reports/:id  -> 200 OK | 404
GET  /api/me/reports   -> 200 OK | 401
```

*Errors*: `{error:{code,message}}` with **400** (bad request) or **500** (server).

---

## 8 · Milestone Checklist (Solo‑Dev)

| #         | Deliverable                                   | Est (d) |
| --------- | --------------------------------------------- | ------- |
| 1         | VPS ready, Docker + **Traefik** installed     | 0.5     |
| 2         | Cloudflare R2 bucket & DNS token              | 0.5     |
| 3         | Turbo monorepo scaffold                       | 0.5     |
| 4         | Tailwind v4 baseline & UI kit                 | 0.5     |
| 5         | Google OAuth in Hono with Firebase                          | 1       |
| 6         | Postgres migrations via Sqitch                | 1       |
| 7         | Signed‑URL upload service                     | 1       |
| 8         | Upload form + preview                         | 1       |
| 9         | Public list table                             | 1       |
| 10        | compose.yml + Dockerfiles build on VPS        | 0.5     |
| 11        | GitHub Actions CD (scp & docker compose pull) | 1       |
| 12        | QA: rate‑limit & reCAPTCHA                    | 1       |
| **Total** | **10 days**                                   |         |

---

## 9 · Open Points

* **Avatar URL** — hot‑link Google photo vs cache? (lean = hot‑link)
* **Image retention** — purge >12 months via nightly job?
* **Monitoring** — Traefik/Loki log ship later.

---

*This human‑ & AI‑friendly RFC replaces Caddy with Traefik, shows clear repo commands, and embeds a minimal `compose.yml` for instant deployment.*
