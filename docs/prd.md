# Viralkan Bekasi — Product Requirements v0.3

*(Refined for RFC‑friendly consumption — 24 Jun 2025)*

---

## 1 · Background

Bekasi’s secondary streets are dotted with potholes and surface cracks that worsen traffic and safety. Complaints are scattered across WhatsApp and social media, making it hard for Dinas Bina Marga to prioritise repairs. **Viralkan** aims to centralise those reports in one open, structured web app.

---

## 2 · Solution Strategy & Release Plan

We will ship small, vertical slices so each version is usable in production and provides learning feedback.

| Version                      | Tagline                   | Core Deliverable                                                          |
| ---------------------------- | ------------------------- | ------------------------------------------------------------------------- |
| **V1 – "Manual Core" (MVP)** | *“Report & view — fast.”* | Google‑login, image upload with manual form, public list/table of reports |
| **V2 – "Smart Metadata"**    | *“Less typing.”*          | Auto‑extract EXIF GPS, reverse‑geocode address, autofill form             |
| **V3 – "Map Visual"**        | *“See it on a map.”*      | Leaflet map with marker clustering & filters                              |
| **V4 – "Moderation Suite"**  | *“Keep data clean.”*      | Admin dashboard, status workflow, duplicate merge                         |

Guiding principles

1. **Ship fast** — each increment ships in ≈2 weeks.
2. **Minimise abuse** — from V1 we require Google OAuth to post.
3. **GIS‑ready** — DB stores `lat`, `lon` columns from day one, enabling spatial features later.

---

## 3 · MVP (V1) Functional Scope

| Feature              | Description                                                                                                 | Acceptance Criteria                                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Auth**             | Google OAuth 2.0 (email, name, avatar)                                                                      | Only logged‑in users can access dashboard & upload; token stored in HTTP‑only cookie |
| **User Dashboard**   | After login, shows “My Reports” and *Laporkan* button                                                       | List paginated, newest first                                                         |
| **Upload Form**      | ① Select JPEG/PNG ≤10 MB ② Choose category (Berlubang • Retak • Lainnya) ③ Street name ④ Free‑text location | Server returns 201; redirect to confirmation page                                    |
| **Public List**      | Anyone (no login) sees table of all reports with thumbnail, category, street, created\_at                   | Table loads <1 s on 3G; clicking row opens detail page                               |
| **Storage & DB**     | Images in R2; metadata in Postgres (`reports` table)                                                        | Schema includes user\_id FK, category, street, location\_text, lat, lon (nullable)   |
| **Abuse Protection** | reCAPTCHA v3 on upload, 10 reports/user/day limit                                                           | Abuse metrics visible in Grafana                                                     |

---

### 3.1 User Flows (V1)

**A. Authenticated Reporter**

1. **Login** → “Masuk dengan Google”.
2. **Dashboard** → lists *My Reports*; click **Laporkan**.
3. **Upload** image (client‑side preview).
4. **Fill Form** → Category, Street, Location (free text).
5. **Submit** → server saves record; user sees confirmation.
6. **Public List** refresh → new record visible to all.

**B. Public Viewer**

1. Open `viralkan.app` (no login).
2. Default route `/list` shows data table (thumbnail, category, street, date).
3. Click a row → `/report/:id` detail page (image + metadata).

*(Sequence diagrams omitted; can be generated from this narrative for the RFC.)*

---

### 3.2 User Flows (V2 – Smart Metadata)

**A. Authenticated Reporter (Autofill)**

1. **Login** → Google.
2. **Dashboard** → *Laporkan*.
3. **Upload** image → client parser reads EXIF GPS.
4. **Form** auto‑populates **Lat/Lon** and reverse‑geocoded **Street** & **Location** fields; user may edit if incorrect.
5. **Submit** → server saves; confirmation page displayed.

**B. Public Viewer**
Same steps as V1; address columns now show precise location when EXIF data exists.

### 3.3 User Flows (V3 – Map Visual)

**A. Public Viewer – Map Exploration**

1. Open `viralkan.app`; click **Peta** toggle.
2. Leaflet map loads with clustered markers sized by density.
3. Pan/zoom → clusters split into individual pins.
4. Click pin → modal with image, metadata, and link to detail page.

**B. Authenticated Reporter**

1. Dashboard gains **My Map** tab showing personal reports as pins.
2. Report creation flow unchanged from V2; after submission, user is redirected to the map with their new pin highlighted.

## 4 · Technical Architecture (unchanged)

| Layer         | Tooling                              | Notes                                        |
| ------------- | ------------------------------------ | -------------------------------------------- |
| Runtime       | **Bun 1.x**                          | Fast, TS‑first                               |
| API           | **Hono**                             | Edge‑deployable                              |
| Frontend      | **React 18**, **Vite**, **Tailwind** | PWA                                          |
| DB            | **PostgreSQL 15 + PostGIS**          | Lat/lon columns now; spatial functions later |
| Storage       | **Cloudflare R2**                    | Private bucket + signed URL                  |
| Auth          | **Google OAuth**                     | Required from V1                             |
| Observability | Grafana Cloud + Loki                 | Basic request/latency dashboards             |

---

## 5 · Timeline (indicative)

| Week | Sprint Goal   | Output                                               |
| ---- | ------------- | ---------------------------------------------------- |
| 0    | Kick‑off      | RFC sign‑off, repo/infrastructure bootstrap          |
| 1    | V1 Core Build | Auth, DB migrations, upload endpoint, R2 integration |
| 2    | V1 UI Build   | Dashboard, list page, form validation; internal beta |
| 3    | V1 Hardening  | reCAPTCHA, rate limits, CI tests; public launch      |
| 4    | V2 Build      | EXIF parser, reverse‑geocoder service, form autofill |
| 5    | V2 Launch     | Metrics: GPS autofill success‑rate                   |
| 6    | V3 Build      | Map page, clustering, PostGIS index                  |
| 7    | V4 Build      | RBAC, admin dashboard, status workflow               |

---

## 6 · Open Questions for RFC

1. **Rate limits** — 10 uploads/user/day sufficient? configurable env var?
2. **Image PII** — should V1 include simple client‑side blur for faces/plates?
3. **Data retention** — auto‑delete older than 12 months?
4. **Tile provider SLA** — OSM tiles vs Mapbox in V3.

---

> *This document refines PRD v0.2 into RFC‑ready language with explicit user flows and MVP login requirement.*
