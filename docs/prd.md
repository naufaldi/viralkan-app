# Viralkan Bekasi — Product Requirements v0.3

_(Refined for RFC‑friendly consumption — 24 Jun 2025)_

---

## 1 · Background

Bekasi’s secondary streets are dotted with potholes and surface cracks that worsen traffic and safety. Complaints are scattered across WhatsApp and social media, making it hard for Dinas Bina Marga to prioritise repairs. **Viralkan** aims to centralise those reports in one open, structured web app.

---

## 2 · Solution Strategy & Release Plan

We will ship small, vertical slices so each version is usable in production and provides learning feedback.

| Version                      | Tagline                   | Core Deliverable                                                          |
| ---------------------------- | ------------------------- | ------------------------------------------------------------------------- |
| **V1 – "Manual Core" (MVP)** | _“Report & view — fast.”_ | Google‑login, image upload with manual form, public list/table of reports |
| **V2 – "Smart Metadata"**    | _“Less typing.”_          | Auto‑extract EXIF GPS, reverse‑geocode address, autofill form             |
| **V3 – "Map Visual"**        | _“See it on a map.”_      | Leaflet map with marker clustering & filters                              |
| **V4 – "Moderation Suite"**  | _“Keep data clean.”_      | Admin dashboard, status workflow, duplicate merge                         |

Guiding principles

1. **Ship fast** — each increment ships in ≈2 weeks.
2. **Minimise abuse** — from V1 we require Google OAuth to post.
3. **GIS‑ready** — DB stores `lat`, `lon` columns from day one, enabling spatial features later.

---

## 3 · MVP (V1) Functional Scope

| Feature              | Description                                                                                                 | Acceptance Criteria                                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Auth**             | Google OAuth 2.0 (email, name, avatar)                                                                      | Only logged‑in users can access dashboard & upload; token stored in HTTP‑only cookie |
| **User Dashboard**   | After login, shows “My Reports” and _Laporkan_ button                                                       | List paginated, newest first                                                         |
| **Upload Form**      | ① Select JPEG/PNG ≤10 MB ② Choose category (Berlubang • Retak • Lainnya) ③ Street name ④ Free‑text location | Server returns 201; redirect to confirmation page                                    |
| **Public List**      | Anyone (no login) sees table of all reports with thumbnail, category, street, created_at                    | Table loads <1 s on 3G; clicking row opens detail page                               |
| **Storage & DB**     | Images in R2; metadata in Postgres (`reports` table)                                                        | Schema includes user_id FK, category, street, location_text, lat, lon (nullable)     |
| **Abuse Protection** | reCAPTCHA v3 on upload, 10 reports/user/day limit                                                           | Abuse metrics visible in Grafana                                                     |

---

### 3.1 User Stories & Page Specifications (V1)

## **Epic 1: Public Report Browsing**

### **User Story 1.1: Browse Reports as Anonymous Visitor**

**As an** anonymous visitor  
**I want to** browse all road damage reports without logging in  
**So that** I can see what issues have been reported in my area

**Acceptance Criteria:**

- [ ] Can access public reports without authentication
- [ ] Can view reports in a paginated table format
- [ ] Can see basic report information (thumbnail, category, location, date)
- [ ] Can click on reports to view full details
- [ ] Page loads in <2 seconds on 3G connection

**Required Pages:**

#### **Page: Landing/Home (`/`)**

**Purpose:** Entry point that introduces the platform and directs users to reports or login
**Components:**

- Header with site branding "Viralkan Bekasi"
- Hero section explaining the platform purpose
- Call-to-action buttons: "Lihat Laporan" and "Masuk dengan Google"
- Footer with basic links
  **Navigation:** → `/reports` (public list) or `/login`

#### **Page: Public Reports List (`/reports`)**

**Purpose:** Display all reports in a searchable, filterable table
**Components:**

- Header with navigation (Home, Login button)
- Page title: "Laporan Kerusakan Jalan"
- Data table with columns:
  - Thumbnail (60x60px)
  - Kategori (badge: Berlubang/Retak/Lainnya)
  - Jalan (street name)
  - Lokasi (location text)
  - Tanggal (formatted date)
- Pagination controls (10 items per page)
- Basic search/filter by category
- "Buat Laporan" button (redirects to login if not authenticated)
  **Data Requirements:**
- API: `GET /api/reports?page=1&limit=10&category=`
- Response: `{items: Report[], total: number, page: number}`
  **Navigation:** → `/reports/[id]` (detail) or `/login`

#### **Page: Report Detail (`/reports/[id]`)**

**Purpose:** Show full details of a specific report
**Components:**

- Header with navigation and breadcrumb
- Large image display (with zoom capability)
- Report metadata card:
  - Kategori (colored badge)
  - Jalan dan Lokasi
  - Tanggal dibuat
  - Status (if applicable)
- Back to list button
- Share button (copy link)
  **Data Requirements:**
- API: `GET /api/reports/:id`
- Response: `Report` object with full details
  **Navigation:** ← `/reports` (back to list)

---

## **Epic 2: User Authentication**

### **User Story 2.1: Login with Google**

**As a** citizen who wants to report road damage  
**I want to** login with my Google account  
**So that** I can create and manage my reports

**Acceptance Criteria:**

- [ ] Can click "Masuk dengan Google" button
- [ ] Redirected to Google OAuth consent screen
- [ ] After successful auth, redirected to dashboard
- [ ] User session persists across browser sessions
- [ ] Can logout and clear session

**Required Pages:**

#### **Page: Login (`/login`)**

**Purpose:** Authenticate users via Google OAuth
**Components:**

- Centered login card with:
  - Viralkan logo and tagline
  - "Masuk dengan Google" button (with Google icon)
  - Brief explanation: "Masuk untuk melaporkan kerusakan jalan"
- Loading state during OAuth flow
- Error message display for failed authentication
  **Navigation:** → `/dashboard` (after successful login)

#### **Page: Auth Callback (`/auth/callback`)**

**Purpose:** Handle OAuth callback and token exchange
**Components:**

- Loading spinner
- "Sedang memproses..." message
- Error handling for failed authentication
  **Navigation:** → `/dashboard` (success) or `/login` (error)

---

## **Epic 3: Personal Dashboard**

### **User Story 3.1: View My Reports Dashboard**

**As an** authenticated user  
**I want to** see my personal dashboard with my reports  
**So that** I can track my submissions and create new ones

**Acceptance Criteria:**

- [ ] Shows personalized welcome message with user name
- [ ] Displays my reports in chronological order
- [ ] Shows report statistics (total, by category, by status)
- [ ] Prominent "Buat Laporan Baru" button
- [ ] Can access account settings and logout

**Required Pages:**

#### **Page: Dashboard (`/dashboard`)**

**Purpose:** Personal hub for authenticated users
**Components:**

- Header with user avatar, name, and logout button
- Welcome section: "Selamat datang, [Name]"
- Quick stats cards:
  - Total laporan saya
  - Laporan bulan ini
  - Status terbaru
- "Buat Laporan Baru" prominent button
- "Laporan Saya" section:
  - Mini table/cards of recent reports (5 most recent)
  - "Lihat Semua" link to full list
- Quick actions sidebar
  **Data Requirements:**
- API: `GET /api/me/reports?limit=5`
- API: `GET /api/me/stats`
  **Navigation:** → `/reports/create` or `/dashboard/reports`

#### **Page: My Reports List (`/dashboard/reports`)**

**Purpose:** Full list of user's reports with management options
**Components:**

- Header with breadcrumb
- Page title: "Laporan Saya"
- Data table similar to public list but with additional columns:
  - Status (Pending/In Progress/Resolved)
  - Actions (Edit/Delete if allowed)
- Pagination and filtering
- "Buat Laporan Baru" button
  **Data Requirements:**
- API: `GET /api/me/reports?page=1&limit=10`
  **Navigation:** → `/reports/create` or `/reports/[id]`

---

## **Epic 4: Report Creation**

### **User Story 4.1: Create New Report**

**As an** authenticated user  
**I want to** create a new road damage report with photo and details  
**So that** authorities can be notified of the issue

**Acceptance Criteria:**

- [ ] Can upload image (JPEG/PNG, max 10MB)
- [ ] Can select damage category from dropdown
- [ ] Can enter street name and location description
- [ ] Form validates all required fields
- [ ] Shows preview before submission
- [ ] Receives confirmation after successful submission
- [ ] Handles upload errors gracefully

**Required Pages:**

#### **Page: Create Report (`/reports/create`)**

**Purpose:** Form to create new road damage report
**Components:**

- Header with breadcrumb
- Page title: "Buat Laporan Kerusakan Jalan"
- Multi-step form:

  **Step 1: Upload Image**
  - Drag & drop upload area
  - File picker button
  - Image preview with crop/rotate options
  - File size/type validation
  - Progress bar during upload

  **Step 2: Report Details**
  - Kategori dropdown (Berlubang, Retak, Lainnya)
  - Nama Jalan text input
  - Deskripsi Lokasi textarea
  - Severity selector (optional)

  **Step 3: Review & Submit**
  - Preview of uploaded image
  - Summary of entered details
  - reCAPTCHA verification
  - Submit button with loading state

- Cancel button (with confirmation dialog)
- Form validation messages
- Error handling for API failures
  **Data Requirements:**
- API: `POST /api/reports` with multipart form data
- Response: `{id: string, message: string}`
  **Navigation:** → `/reports/create/success` or back to `/dashboard`

#### **Page: Report Success (`/reports/create/success`)**

**Purpose:** Confirmation page after successful report creation
**Components:**

- Success icon and message
- "Laporan berhasil dibuat" heading
- Summary of created report
- Action buttons:
  - "Lihat Laporan" → `/reports/[id]`
  - "Buat Laporan Lain" → `/reports/create`
  - "Kembali ke Dashboard" → `/dashboard`
    **Navigation:** Multiple options as listed above

---

## **Epic 5: Error Handling & Edge Cases**

### **User Story 5.1: Handle Errors Gracefully**

**As a** user  
**I want to** see helpful error messages when things go wrong  
**So that** I understand what happened and what to do next

**Required Pages:**

#### **Page: 404 Not Found (`/404`)**

**Purpose:** Handle invalid routes
**Components:**

- "Halaman tidak ditemukan" message
- Helpful links back to main sections
- Search functionality

#### **Page: 500 Server Error (`/500`)**

**Purpose:** Handle server errors
**Components:**

- "Terjadi kesalahan server" message
- Retry button
- Contact information

#### **Page: Offline (`/offline`)**

**Purpose:** Handle offline state (PWA)
**Components:**

- "Tidak ada koneksi internet" message
- Cached content if available
- Retry connection button

---

## **Technical Page Requirements Summary**

| Route                     | Purpose              | Auth Required | API Endpoints          | Key Components         |
| ------------------------- | -------------------- | ------------- | ---------------------- | ---------------------- |
| `/`                       | Landing page         | No            | None                   | Hero, CTA buttons      |
| `/reports`                | Public reports list  | No            | `GET /api/reports`     | Data table, pagination |
| `/reports/[id]`           | Report detail        | No            | `GET /api/reports/:id` | Image viewer, metadata |
| `/login`                  | Authentication       | No            | Google OAuth           | Login form             |
| `/auth/callback`          | OAuth callback       | No            | Token exchange         | Loading state          |
| `/dashboard`              | User dashboard       | Yes           | `GET /api/me/*`        | Stats, recent reports  |
| `/dashboard/reports`      | User reports list    | Yes           | `GET /api/me/reports`  | Personal data table    |
| `/reports/create`         | Create report form   | Yes           | `POST /api/reports`    | Multi-step form        |
| `/reports/create/success` | Success confirmation | Yes           | None                   | Success message        |

---

## **Component Library Requirements**

**Shared Components Needed:**

- `Header` - Navigation with auth state
- `DataTable` - Sortable, paginated table
- `ReportCard` - Report display component
- `ImageUpload` - Drag & drop file upload
- `LoadingSpinner` - Loading states
- `ErrorBoundary` - Error handling
- `Badge` - Category/status indicators
- `Button` - Various button styles
- `Form` - Form components with validation
- `Modal` - Confirmation dialogs
- `Breadcrumb` - Navigation breadcrumbs

---

## **Detailed User Flow Diagrams**

### **Flow A: Anonymous User Browsing Reports**

```
[Landing Page] → [Public Reports List] → [Report Detail]
       ↓                    ↓
   [Login Page]        [Login Page]
       ↓                    ↓
  [Dashboard]          [Dashboard]
```

### **Flow B: Authenticated User Creating Report**

```
[Dashboard] → [Create Report] → [Upload Image] → [Fill Details] → [Review] → [Success] → [View Report]
     ↑              ↓                                                          ↓
[My Reports]    [Cancel/Back]                                           [Create Another]
```

### **Flow C: Error Handling**

```
[Any Page] → [Error Occurs] → [Error Page] → [Recovery Action]
                                   ↓
                            [Contact Support]
```

---

### 3.2 User Flows (V2 – Smart Metadata)

**A. Authenticated Reporter (Autofill)**

1. **Login** → Google.
2. **Dashboard** → _Laporkan_.
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

> _This document refines PRD v0.2 into RFC‑ready language with explicit user flows and MVP login requirement._

### 1.1 · Platform Purpose & Scope

**⚠️ IMPORTANT CLARIFICATION:**

Viralkan is **NOT** a government service or official reporting system. It is a **community sharing platform** with three core purposes:

1. **Help people avoid damaged roads** by sharing location information
2. **Get attention from authorities** through social media virality and community pressure
3. **Raise public awareness** about infrastructure problems affecting daily life

**What Viralkan IS:**

- A community-driven information sharing platform
- A tool to help citizens avoid road damage (save tires, shock absorbers)
- A way to amplify citizen voices through social media virality
- An independent civic engagement initiative

**What Viralkan is NOT:**

- An official government reporting system
- A direct communication channel with authorities
- A platform that tracks government repair progress
- A service that guarantees government response

The platform's success should be measured by:

- Community adoption and active sharing
- Social media virality of reports
- Citizens successfully avoiding road damage
- Increased public awareness leading to organic pressure on authorities

---

## 6 · Admin Management System (MVP 1.5)

### 6.1 Admin System Overview

**Purpose:** Manual verification and management of road damage reports to ensure quality and prevent abuse.

**Scope:** MVP 1.5 enhancement between V1 (basic functionality) and V2 (smart metadata), focusing on content moderation and quality control.

**Security Approach:** Environment-based admin configuration with database role management for open-source deployment security.

---

## **Epic 6: Admin Management System**

### **User Story 6.1: Admin Authentication and Access**

**As an** administrator  
**I want to** access the admin dashboard securely  
**So that** I can manage and verify road damage reports

**Acceptance Criteria:**
- [ ] Can login with admin email (naufaldi.rafif@gmail.com)
- [ ] Admin role is verified through environment configuration
- [ ] Access is restricted to admin users only
- [ ] Session management is secure and time-limited
- [ ] All admin actions are logged for audit purposes

**Required Pages:**
- **Admin Login**: Secure authentication for admin users
- **Admin Dashboard**: `/admin/dashboard` - Main admin interface

### **User Story 6.2: Admin Dashboard Overview**

**As an** administrator  
**I want to** see an overview of all reports and system statistics  
**So that** I can understand the current state of the platform

**Acceptance Criteria:**
- [ ] Dashboard shows total reports count
- [ ] Displays verification statistics (pending, verified, rejected)
- [ ] Shows recent activity and admin actions
- [ ] Provides quick access to pending reports queue
- [ ] Includes system health indicators

**Required Components:**
- Statistics cards (total reports, pending, verified, rejected)
- Recent activity timeline
- Quick action buttons
- System status indicators

### **User Story 6.3: Report Verification Management**

**As an** administrator  
**I want to** review and verify pending reports  
**So that** I can ensure only legitimate road damage reports are published

**Acceptance Criteria:**
- [ ] Can view all reports in a comprehensive table
- [ ] Can see full report details including images
- [ ] Can verify reports with one-click action
- [ ] Can reject reports with reason modal
- [ ] Can toggle verification status (verified ↔ unverified)
- [ ] Can soft delete reports if necessary
- [ ] All actions are logged with admin user and timestamp

**Required Features:**
- **Reports Table**: Full data display with action columns
- **Action Buttons**: Verify, Reject, Toggle Status, Delete
- **Rejection Modal**: Reason input with validation
- **Detail View**: Full report information in separate page
- **Status Management**: Toggle between verified/unverified states

### **User Story 6.4: Report Status Management**

**As an** administrator  
**I want to** manage report statuses flexibly  
**So that** I can correct mistakes and handle edge cases

**Acceptance Criteria:**
- [ ] Can change verified reports back to unverified
- [ ] Can change rejected reports to verified
- [ ] Can update rejection reasons
- [ ] Can soft delete reports (mark as deleted but retain data)
- [ ] Can restore soft-deleted reports
- [ ] All status changes are logged with reasons

**Required Features:**
- **Status Toggle**: Switch between verification states
- **Reason Management**: Update rejection reasons
- **Soft Delete**: Mark reports as deleted without permanent removal
- **Restore Function**: Recover soft-deleted reports

### **User Story 6.5: Admin Statistics and Analytics**

**As an** administrator  
**I want to** view detailed statistics about reports and verification activity  
**So that** I can monitor platform health and admin performance

**Acceptance Criteria:**
- [ ] Shows total reports by status (pending, verified, rejected, deleted)
- [ ] Displays verification rate and average processing time
- [ ] Shows reports by category and geographic distribution
- [ ] Includes admin activity logs and audit trail
- [ ] Provides export functionality for reports

**Required Features:**
- **Statistics Dashboard**: Comprehensive metrics display
- **Activity Logs**: Admin action history
- **Export Tools**: CSV/JSON export for reports
- **Performance Metrics**: Verification efficiency tracking

---

### 6.2 Admin Security Requirements

**Environment-Based Configuration:**
- Admin emails configured via environment variables
- Database admin role management with proper constraints
- Secure session management with timeout
- Audit logging for all admin actions
- Rate limiting for admin endpoints
- Input validation and sanitization

**Open Source Security Considerations:**
- No hardcoded admin credentials in source code
- Environment variable documentation for deployment
- Database-based admin role management
- Proper error handling without exposing sensitive information
- Secure authentication flow with Firebase integration

---

### 6.3 Admin User Interface Requirements

**Dashboard Layout (`/admin/dashboard`):**
- Clean, professional interface following monochromatic design
- Statistics overview at the top
- Pending reports queue prominently displayed
- Quick action buttons for common tasks
- Navigation to detailed management interfaces

**Reports Management Table:**
- All report data in sortable, filterable table
- Action column with verify, reject, toggle, delete buttons
- Status indicators with color coding
- Pagination for large datasets
- Search and filter functionality

**Detail View:**
- Full report information in dedicated page
- Large image display with zoom capability
- Complete metadata and user information
- Action buttons for status management
- Audit trail showing all changes

---

## 7 · Open Questions for RFC

1. **Rate limits** — 10 uploads/user/day sufficient? configurable env var?
2. **Image PII** — should V1 include simple client‑side blur for faces/plates?
3. **Data retention** — auto‑delete older than 12 months?
4. **Tile provider SLA** — OSM tiles vs Mapbox in V3.
5. **Admin scalability** — How to handle multiple admin users in future?
6. **Verification workflow** — Should there be different verification levels?
