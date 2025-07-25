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

- **IN** — Google OAuth, image upload to Cloudflare R2, public list page, Postgres schema with GIS columns, multi-step form, pagination, reCAPTCHA, PWA capabilities.
- **OUT** — EXIF parsing, map view, admin dashboard (future V2+).

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
    "dev": { "cache": false, "dependsOn": ["^dev"], "outputs": [] },
    "build": { "outputs": ["dist/**"] },
    "lint": {},
    "test": {},
  },
}
```

_`bunx turbo run dev`_ spins up API (port 3000) & Web (5173) with watch mode.

---

## 4 · Page Architecture & Routes

| Route                     | Purpose              | Auth Required | API Endpoints          | Key Components        |
| ------------------------- | -------------------- | ------------- | ---------------------- | --------------------- |
| `/`                       | Landing page         | No            | None                   | Hero, CTA buttons     |
| `/reports`                | Public reports list  | No            | `GET /api/reports`     | DataTable, pagination |
| `/reports/[id]`           | Report detail        | No            | `GET /api/reports/:id` | ImageViewer, metadata |
| `/login`                  | Authentication       | No            | Google OAuth           | LoginForm             |
| `/auth/callback`          | OAuth callback       | No            | Token exchange         | LoadingSpinner        |
| `/dashboard`              | User dashboard       | Yes           | `GET /api/me/*`        | Stats, ReportCard     |
| `/dashboard/reports`      | User reports list    | Yes           | `GET /api/me/reports`  | DataTable             |
| `/reports/create`         | Create report form   | Yes           | `POST /api/reports`    | ImageUpload, Form     |
| `/reports/create/success` | Success confirmation | Yes           | None                   | SuccessMessage        |
| `/404`                    | Not found            | No            | None                   | ErrorPage             |
| `/500`                    | Server error         | No            | None                   | ErrorPage             |
| `/offline`                | Offline state        | No            | None                   | OfflinePage           |

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

### 5.1 Authentication (Firebase + PostgreSQL)

**Recommended Architecture: Firebase Tokens + Backend Verification**

```http
POST /api/auth/verify     -> 200 OK {user_id, user} | 401 Invalid Token
GET  /api/auth/me         -> 200 OK {user} | 401 Unauthorized
GET  /api/auth/me/stats   -> 200 OK {stats} | 401 Unauthorized
POST /api/auth/logout     -> 200 OK | 401 Unauthorized
GET  /api/auth/health     -> 200 OK {status, timestamp}
```

**Authentication Flow:**

```
1. Frontend: User clicks "Login with Google"
2. Frontend: Firebase handles Google OAuth → returns Firebase JWT
3. Frontend: Send Firebase JWT to POST /api/auth/verify
4. Backend: Verify Firebase JWT + upsert user to PostgreSQL
5. Frontend: Store Firebase JWT for future API calls
6. All API calls: Send Firebase JWT in Authorization header
7. Backend: Verify Firebase JWT via middleware on each request
```

**Request/Response Examples:**

```typescript
// Step 3: Verify Firebase token + save user
POST /api/auth/verify
Authorization: Bearer <firebase-jwt-token>
→ 200 OK {
  message: "Authentication verified",
  user_id: 123,
  user: {
    id: 123,
    firebase_uid: "firebase_uid_1234",
    email: "user@example.com",
    name: "John Doe",
    avatar_url: "https://lh3.googleusercontent.com/...",
    provider: "google",
    created_at: "2024-01-15T10:30:00Z"
  }
}

// Step 6: All subsequent API calls
GET /api/reports
Authorization: Bearer <firebase-jwt-token>
→ 200 OK {items: [...], total: 50}
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

## 6 · Authentication Architecture (Firebase + PostgreSQL)

### 6.1 Why Firebase Tokens (Not Backend JWT Generation)

**Chosen Approach: Direct Firebase Token Verification**

```
Frontend Firebase Auth → Firebase JWT → Backend Verification → PostgreSQL Storage
```

**Rejected Approach: Backend JWT Generation**

```
Frontend Firebase Auth → Firebase JWT → Backend → Generate Backend JWT → Store Backend JWT
```

**Decision Rationale:**

| Aspect                 | Firebase Tokens ✅                       | Backend JWT ❌                      |
| ---------------------- | ---------------------------------------- | ----------------------------------- |
| **Complexity**         | Simple, Firebase handles token lifecycle | Complex, need JWT secret management |
| **Security**           | Firebase security expertise              | Manual JWT security implementation  |
| **Token Refresh**      | Automatic via Firebase SDK               | Manual refresh logic needed         |
| **Session Management** | Firebase handles expiration              | Manual expiration handling          |
| **Implementation**     | Already implemented ✅                   | Additional development needed       |
| **Error Handling**     | Firebase provides rich error types       | Manual error type management        |
| **Development Speed**  | Fast (leverage Firebase)                 | Slow (build custom auth)            |

### 6.2 Frontend Integration Pattern

**File Structure:**

```typescript
apps/web/
├── lib/firebase/config.ts          // ✅ Firebase client config
├── hooks/useFirebaseAuth.ts        // ✅ Firebase auth hook
├── hooks/useAuth.ts                // 🔄 Backend integration hook
├── contexts/AuthContext.tsx        // 🔄 Auth state management
└── components/auth/login-form.tsx  // ✅ Login UI component
```

**Implementation Pattern:**

```typescript
// apps/web/hooks/useAuth.ts
export function useAuth() {
  const { user, signInWithGoogle, signOut, getIdToken } = useFirebaseAuth();
  const [backendUser, setBackendUser] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyWithBackend = async () => {
    if (!user) return;

    setIsVerifying(true);
    try {
      const firebaseToken = await getIdToken();
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${firebaseToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBackendUser(data.user);
      }
    } catch (error) {
      console.error("Backend verification failed:", error);
    } finally {
      setIsVerifying(false);
    }
  };

  // Auto-verify when Firebase user changes
  useEffect(() => {
    if (user) {
      verifyWithBackend();
    } else {
      setBackendUser(null);
    }
  }, [user]);

  const apiCall = async (url: string, options: RequestInit = {}) => {
    const firebaseToken = await getIdToken();
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${firebaseToken}`,
        "Content-Type": "application/json",
      },
    });
  };

  return {
    // Firebase state
    firebaseUser: user,
    isFirebaseAuthenticated: !!user,

    // Backend state
    backendUser,
    isBackendVerified: !!backendUser,
    isVerifying,

    // Actions
    signIn: signInWithGoogle,
    signOut: async () => {
      await signOut();
      setBackendUser(null);
    },

    // API helper
    apiCall,
  };
}
```

### 6.3 Backend Implementation (Already Complete)

**Middleware Architecture:**

```typescript
// apps/api/src/routes/auth/middleware.ts
export const firebaseAuthMiddleware = async (c, next) => {
  // 1. Extract Bearer token from Authorization header
  const authHeader = c.req.header("Authorization");
  const idToken = authHeader?.substring(7); // Remove 'Bearer '

  // 2. Verify Firebase token with Admin SDK
  const result = await shell.verifyTokenAndGetUser(sql, idToken);

  // 3. Set user_id in context for route handlers
  c.set("user_id", result.data.user_id);

  await next();
};
```

**Database Integration:**

```typescript
// apps/api/src/routes/auth/data.ts
export const upsertUser = async (sql, userData) => {
  return await sql`
    INSERT INTO users(firebase_uid, email, name, avatar_url, provider)
    VALUES(${userData.firebase_uid}, ${userData.email}, ${userData.name}, ${userData.avatar_url}, ${userData.provider})
    ON CONFLICT (firebase_uid) DO UPDATE
    SET email = EXCLUDED.email,
        name = EXCLUDED.name, 
        avatar_url = EXCLUDED.avatar_url
    RETURNING *
  `;
};
```

### 6.4 Error Handling Strategy

**Frontend Error Types:**

```typescript
type AuthError =
  | "firebase-auth-failed" // Google OAuth failed
  | "firebase-token-invalid" // Firebase token expired/invalid
  | "backend-verification-failed" // Backend /auth/verify failed
  | "network-error" // Request failed
  | "unknown-error"; // Unexpected error

const handleAuthError = (error: AuthError) => {
  switch (error) {
    case "firebase-auth-failed":
      return "Gagal masuk dengan Google. Silakan coba lagi.";
    case "firebase-token-invalid":
      return "Sesi telah berakhir. Silakan masuk kembali.";
    case "backend-verification-failed":
      return "Gagal verifikasi dengan server. Silakan coba lagi.";
    case "network-error":
      return "Tidak ada koneksi internet. Silakan coba lagi.";
    default:
      return "Terjadi kesalahan. Silakan coba lagi.";
  }
};
```

**Backend Error Responses:**

```typescript
// Consistent error format
type ErrorResponse = {
  error: string;
  statusCode: number;
  timestamp: string;
};

// Firebase token verification errors
const AUTH_ERRORS = {
  MISSING_TOKEN: {
    code: 401,
    message: "Missing or invalid Authorization header",
  },
  INVALID_TOKEN: { code: 401, message: "Invalid or expired Firebase token" },
  USER_CREATION_FAILED: { code: 500, message: "Failed to create/update user" },
  FIREBASE_UNAVAILABLE: { code: 503, message: "Firebase service unavailable" },
};
```

### 6.5 Security Considerations

**Token Security:**

- ✅ Firebase tokens are short-lived (1 hour default)
- ✅ Automatic refresh handled by Firebase SDK
- ✅ HTTPS-only token transmission
- ✅ Firebase Admin SDK validates token signature

**Database Security:**

- ✅ Prepared statements prevent SQL injection
- ✅ User data validation with Zod schemas
- ✅ Rate limiting on authentication endpoints
- ✅ CORS configured for frontend origin only

**Session Management:**

- ✅ No server-side session storage needed
- ✅ Stateless authentication via Firebase tokens
- ✅ Token revocation handled by Firebase
- ✅ Logout clears frontend Firebase session

### 6.6 Testing Strategy

**Frontend Tests:**

```typescript
// Test Firebase auth integration
describe("useAuth hook", () => {
  it("verifies user with backend after Firebase login", async () => {
    const { result } = renderHook(() => useAuth());

    // Mock Firebase login
    act(() => {
      mockFirebaseAuth.signIn();
    });

    await waitFor(() => {
      expect(result.current.isBackendVerified).toBe(true);
      expect(result.current.backendUser).toBeTruthy();
    });
  });
});
```

**Backend Tests:**

```typescript
// Test middleware authentication
describe("firebaseAuthMiddleware", () => {
  it("sets user_id for valid Firebase token", async () => {
    const validToken = await generateTestFirebaseToken();
    const response = await app.request("/api/auth/me", {
      headers: { Authorization: `Bearer ${validToken}` },
    });

    expect(response.status).toBe(200);
  });
});
```

### 6.7 Performance Considerations

**Token Caching:**

- Firebase SDK automatically caches valid tokens
- Tokens refreshed in background before expiration
- No manual token refresh needed in application code

**Database Optimization:**

- Indexed lookups on `firebase_uid` field
- Connection pooling for PostgreSQL
- Prepared statement caching

**Request Flow:**

```
1. Frontend: Check cached Firebase token (0ms)
2. Backend: Verify token with Firebase (50-100ms first time, cached after)
3. Backend: Database user lookup (1-5ms with index)
4. Backend: Process request with user context
```

## 7 · Design System & Color Strategy

### 7.1 True Monochrome Approach

**Design Philosophy: Content-First, Government-Neutral**

Viralkan adopts a **true monochrome design system** (95% grayscale) with minimal functional color (5%). This approach is specifically chosen for the people-to-people civic reporting nature of the platform.

#### 7.1.1 Why Monochrome for Viralkan?

**Government Neutrality**

- Civic tools should feel impartial, not branded or partisan
- Gray/black/white appears official without political color associations
- Creates universal trust across all community members regardless of background

**People-to-People Focus**

- The real "color" comes from user-generated content (road damage photos)
- Interface serves as a neutral backdrop, not competing for attention
- Community-generated content becomes the primary visual focal point
- Photos of potholes, cracks, and road damage are the important visuals

**Content-First Architecture**

- Road damage imagery should be the primary visual element
- Monochrome UI ensures actual problems stand out clearly
- Users need to see road conditions clearly, not fancy interface colors
- Puts focus on civic issues, not design aesthetics

**Universal Accessibility**

- Works perfectly for colorblind users without special accommodation
- High contrast displays work better with neutral tones
- No cultural color associations or biases
- Maintains WCAG AA compliance across all users

#### 7.1.2 Color Token Strategy

**Base Palette (95% of interface)**

```css
:root {
  /* True Monochrome Scale */
  --color-white: #ffffff;
  --color-neutral-25: #fcfcfd; /* Subtle background tint */
  --color-neutral-50: #f8fafc; /* Light backgrounds */
  --color-neutral-100: #f1f5f9; /* Muted backgrounds */
  --color-neutral-200: #e2e8f0; /* Borders & dividers */
  --color-neutral-300: #cbd5e1; /* Disabled states */
  --color-neutral-400: #94a3b8; /* Placeholder text */
  --color-neutral-500: #64748b; /* Secondary text */
  --color-neutral-600: #475569; /* Body text */
  --color-neutral-700: #334155; /* Headings */
  --color-neutral-800: #1e293b; /* High contrast text */
  --color-neutral-900: #0f172a; /* Primary text */
  --color-neutral-950: #020617; /* Maximum contrast */
  --color-black: #000000;
}
```

**Functional Color (5% - Essential Only)**

```css
:root {
  /* Interactive Accent */
  --color-accent: var(--color-neutral-800); /* Dark gray for primary actions */
  --color-accent-hover: var(--color-neutral-900); /* Darker for hover states */

  /* Critical Safety (Red for urgent damage & errors only) */
  --color-danger: #dc2626;

  /* Success Status (Green for resolved issues only) */
  --color-success: #16a34a;

  /* Damage Categories (Minimal differentiation) */
  --color-pothole: #dc2626; /* Critical - red for urgency */
  --color-crack: var(--color-neutral-600); /* Moderate - gray */
  --color-other: var(--color-neutral-500); /* General - lighter gray */
}
```

#### 7.1.3 Implementation Benefits

**Trust Through Simplicity**

- Builds trust through honest, unmanipulative design
- No color psychology tricks - just clear, functional interface
- Government-appropriate professional appearance
- Focuses attention on actual civic issues, not branding

**Technical Advantages**

- Simpler color management and maintenance
- Better performance with fewer color variations
- Easier dark mode implementation when needed
- Reduced cognitive load for users reporting emergencies

**Community Alignment**

- Neutral appearance welcomes all community members
- Focus remains on shared civic responsibility
- Interface doesn't compete with important content (damage photos)
- Encourages serious engagement with infrastructure issues

## 8 · Component Library Requirements

### 8.1 Shared UI Components

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

## 9 · Database Schema (GIS-Ready)

```sql
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  provider TEXT NOT NULL DEFAULT 'google',
  created_at TIMESTAMPTZ DEFAULT now()
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

## 10 · Local Dev Setup (5 steps)

1. **Clone & Install** — `bun install` (root).
2. **Env vars** — copy `.env.example` → `.env` (set Google keys & R2 keys).
3. **Start services** — `bunx turbo run dev`.
4. **Init DB** — `bunx sqitch deploy` (creates tables).
5. **Open** `http://localhost:5173` → upload a test pothole.

### 8.1 Environment Variables

```bash
# API (.env)
DATABASE_URL=postgres://postgres:password@localhost:5432/viralkan
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
JWT_SECRET=your_jwt_secret
R2_ACCESS_KEY=your_r2_access_key
R2_SECRET_KEY=your_r2_secret_key
R2_BUCKET=viralkan-images
R2_ENDPOINT=https://your-account.r2.cloudflarestorage.com
RECAPTCHA_SECRET_KEY=your_recaptcha_secret

# Web (.env)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
VITE_API_URL=http://localhost:3000
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

---

## 11 · Production Stack (Docker + Traefik)

### 11.1 compose.yml (excerpt)

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

## 12 · Security & Performance

### 12.1 Rate Limiting

```typescript
// Per user limits
const RATE_LIMITS = {
  REPORT_CREATION: { max: 10, window: "24h" },
  IMAGE_UPLOAD: { max: 20, window: "1h" },
  API_REQUESTS: { max: 1000, window: "1h" },
};
```

### 12.2 Image Processing

```typescript
// Client-side validation
const IMAGE_CONSTRAINTS = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ["image/jpeg", "image/png"],
  maxDimensions: { width: 4096, height: 4096 },
};
```

### 12.3 PWA Configuration

```typescript
// vite.config.ts
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.viralkan\.app\/api\/reports/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: { maxEntries: 100, maxAgeSeconds: 300 },
            },
          },
        ],
      },
    }),
  ],
});
```

---

## 13 · Milestone Checklist (Solo‑Dev)

| #         | Deliverable                           | Est (d) | Dependencies |
| --------- | ------------------------------------- | ------- | ------------ |
| 1         | VPS ready, Docker + Traefik installed | 0.5     | -            |
| 2         | Cloudflare R2 bucket & DNS token      | 0.5     | -            |
| 3         | Turbo monorepo scaffold               | 0.5     | -            |
| 4         | Tailwind v4 + shadcn/ui setup         | 1       | 3            |
| 5         | Component library (ui package)        | 1.5     | 4            |
| 6         | Google OAuth with Firebase            | 1.5     | 3            |
| 7         | Postgres migrations + PostGIS         | 1       | 3            |
| 8         | R2 signed-URL upload service          | 1.5     | 2, 6         |
| 9         | Multi-step upload form + preview      | 2       | 5, 8         |
| 10        | Public reports list with pagination   | 1.5     | 5, 7         |
| 11        | User dashboard with stats             | 1.5     | 6, 7         |
| 12        | Report detail pages                   | 1       | 5, 7         |
| 13        | Error handling + PWA setup            | 1       | 5            |
| 14        | reCAPTCHA integration                 | 1       | 9            |
| 15        | Rate limiting middleware              | 1       | 6, 7         |
| 16        | Docker builds + compose.yml           | 1       | 1            |
| 17        | GitHub Actions CI/CD                  | 1       | 16           |
| 18        | QA testing + bug fixes                | 2       | All          |
| **Total** | **20 days**                           | **20**  |              |

---

## 14 · Testing Strategy

### 14.1 Unit Tests

```typescript
// API routes testing
describe("POST /api/reports", () => {
  it("creates report with valid data", async () => {
    const response = await app.request("/api/reports", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    expect(response.status).toBe(201);
  });
});
```

### 14.2 Integration Tests

```typescript
// Database integration
describe("Reports CRUD", () => {
  it("creates and retrieves report", async () => {
    const report = await createReport(testData);
    const retrieved = await getReport(report.id);
    expect(retrieved.category).toBe(testData.category);
  });
});
```

### 14.3 E2E Tests (Playwright)

```typescript
// User flow testing
test("complete report creation flow", async ({ page }) => {
  await page.goto("/login");
  await page.click('[data-testid="google-login"]');
  await page.goto("/reports/create");
  await page.setInputFiles('[data-testid="image-upload"]', "test-image.jpg");
  await page.selectOption('[data-testid="category"]', "berlubang");
  await page.fill('[data-testid="street"]', "Jl. Test");
  await page.fill('[data-testid="location"]', "Test location");
  await page.click('[data-testid="submit"]');
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});
```

---

## 15 · Monitoring & Observability

### 15.1 Metrics Collection

```typescript
// Custom metrics
const metrics = {
  reportCreations: new Counter("reports_created_total"),
  uploadDuration: new Histogram("upload_duration_seconds"),
  authFailures: new Counter("auth_failures_total"),
};
```

### 15.2 Health Checks

```typescript
// API health endpoint
app.get("/health", async (c) => {
  const dbHealth = await checkDatabase();
  const r2Health = await checkR2Connection();

  return c.json({
    status: dbHealth && r2Health ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    services: { database: dbHealth, storage: r2Health },
  });
});
```

---

## 16 · Open Points

- **Avatar URL** — hot‑link Google photo vs cache? (lean = hot‑link)
- **Image retention** — purge >12 months via nightly job?
- **Monitoring** — Traefik/Loki log ship later.
- **CDN** — Cloudflare in front of R2 for faster image delivery?
- **Backup strategy** — Automated DB backups to R2?

---

## 17 · Admin System Architecture (MVP 1.5)

### 17.1 Admin Authentication & Authorization

**Security Approach for Open Source Deployment:**

```typescript
// Environment-based admin configuration
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(",") || [
  "naufaldi.rafif@gmail.com",
];

// Admin role middleware
export const requireAdmin = async (c: AuthContext, next: Next) => {
  const userId = c.get("user_id");
  const user = await getUserById(userId);

  if (!user || user.role !== "admin") {
    return c.json({ error: "Admin access required" }, 403);
  }

  await next();
};
```

**Database Schema for Admin Management:**

```sql
-- Add role field to users table
ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'));
CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);

-- Add verification fields to reports table
ALTER TABLE reports ADD COLUMN status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'deleted'));
ALTER TABLE reports ADD COLUMN verified_at TIMESTAMPTZ;
ALTER TABLE reports ADD COLUMN verified_by UUID REFERENCES users(id);
ALTER TABLE reports ADD COLUMN rejection_reason TEXT;
ALTER TABLE reports ADD COLUMN deleted_at TIMESTAMPTZ;

-- Add indexes for verification queries
CREATE INDEX IF NOT EXISTS reports_status_idx ON reports(status);
CREATE INDEX IF NOT EXISTS reports_verified_at_idx ON reports(verified_at DESC);
CREATE INDEX IF NOT EXISTS reports_verified_by_idx ON reports(verified_by);
CREATE INDEX IF NOT EXISTS reports_deleted_at_idx ON reports(deleted_at);
```

### 17.2 Admin API Endpoints

**Admin Reports Management:**

```http
# Admin Dashboard Statistics
GET /api/admin/stats
  -> 200 OK {totalReports, pendingCount, verifiedCount, rejectedCount, deletedCount}

# Admin Reports List (with filters)
GET /api/admin/reports?status=pending&page=1&limit=20
  -> 200 OK {items: Report[], total: number, page: number}

# Verify Report
POST /api/admin/reports/:id/verify
  -> 200 OK {report: Report} | 403 | 404

# Reject Report
POST /api/admin/reports/:id/reject
  Body: {reason: string}
  -> 200 OK {report: Report} | 403 | 404

# Toggle Report Status
POST /api/admin/reports/:id/toggle-status
  Body: {status: 'verified' | 'rejected' | 'pending'}
  -> 200 OK {report: Report} | 403 | 404

# Soft Delete Report
POST /api/admin/reports/:id/delete
  -> 200 OK {report: Report} | 403 | 404

# Restore Deleted Report
POST /api/admin/reports/:id/restore
  -> 200 OK {report: Report} | 403 | 404

# Get Report Detail (Admin View)
GET /api/admin/reports/:id
  -> 200 OK {report: ReportWithUser} | 403 | 404
```

**Admin Activity Logging:**

```typescript
// Audit log table
CREATE TABLE admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES users(id),
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL, -- 'report', 'user', etc.
  target_id UUID NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_actions_admin_idx ON admin_actions(admin_user_id);
CREATE INDEX IF NOT EXISTS admin_actions_target_idx ON admin_actions(target_type, target_id);
CREATE INDEX IF NOT EXISTS admin_actions_created_at_idx ON admin_actions(created_at DESC);
```

### 17.3 Admin Dashboard Implementation

**Route Structure:**

```typescript
// apps/web/app/admin/
├── dashboard/
│   ├── page.tsx              # Main admin dashboard
│   ├── reports/
│   │   ├── page.tsx          # Reports management table
│   │   └── [id]/
│   │       └── page.tsx      # Report detail view
│   ├── stats/
│   │   └── page.tsx          # Statistics and analytics
│   └── activity/
│       └── page.tsx          # Admin activity logs
```

**Admin Dashboard Components:**

```typescript
// apps/web/components/admin/
├── AdminDashboard.tsx        # Main dashboard layout
├── AdminStats.tsx            # Statistics overview
├── ReportsTable.tsx          # Full reports management table
├── ReportDetail.tsx          # Detailed report view
├── VerificationModal.tsx     # Verify/reject modal
├── RejectionModal.tsx        # Rejection reason input
├── AdminActivity.tsx         # Activity timeline
└── AdminNavigation.tsx       # Admin-specific navigation
```

### 17.4 Security Considerations for Open Source

**Environment Configuration:**

```bash
# .env
ADMIN_EMAILS=naufaldi.rafif@gmail.com,other@email.com
ADMIN_SESSION_TIMEOUT=3600
ADMIN_RATE_LIMIT=100
```

**Security Best Practices:**

1. **No Hardcoded Credentials:**
   - Admin emails configured via environment variables
   - Database-based role management
   - Secure session handling

2. **Access Control:**
   - Admin role verification on every endpoint
   - Rate limiting for admin actions
   - Session timeout for admin sessions

3. **Audit Trail:**
   - Log all admin actions with timestamps
   - Track admin user for each action
   - Store action details for accountability

4. **Input Validation:**
   - Validate all admin inputs
   - Sanitize rejection reasons
   - Prevent SQL injection and XSS

5. **Error Handling:**
   - Don't expose sensitive information in errors
   - Log errors for debugging
   - Return appropriate HTTP status codes

### 17.5 Admin Configuration Management

**Admin User Setup:**

```typescript
// apps/api/scripts/setup-admin.ts
export const setupAdminUser = async (email: string) => {
  const result = await sql`
    UPDATE users 
    SET role = 'admin' 
    WHERE email = ${email}
    RETURNING id, email, role
  `;

  if (result.length === 0) {
    throw new Error(`User with email ${email} not found`);
  }

  return result[0];
};
```

**Environment Variable Validation:**

```typescript
// apps/api/src/config/admin.ts
export const getAdminEmails = (): string[] => {
  const adminEmails = process.env.ADMIN_EMAILS;
  if (!adminEmails) {
    throw new Error("ADMIN_EMAILS environment variable is required");
  }

  return adminEmails.split(",").map((email) => email.trim());
};

export const isAdminEmail = (email: string): boolean => {
  const adminEmails = getAdminEmails();
  return adminEmails.includes(email);
};
```

### 17.6 Admin User Experience

**Dashboard Layout (`/admin/dashboard`):**

```typescript
// Main dashboard with statistics and quick actions
const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <AdminStats />
      <PendingReportsQueue />
      <RecentActivity />
      <QuickActions />
    </div>
  );
};
```

**Reports Management Table:**

```typescript
// Full-featured table with all admin actions
const ReportsTable = () => {
  return (
    <DataTable
      data={reports}
      columns={[
        { key: 'image', label: 'Image', render: ImageThumbnail },
        { key: 'category', label: 'Category', render: CategoryBadge },
        { key: 'street_name', label: 'Street' },
        { key: 'status', label: 'Status', render: StatusBadge },
        { key: 'created_at', label: 'Created' },
        { key: 'actions', label: 'Actions', render: ActionButtons }
      ]}
      filters={['status', 'category', 'date']}
      pagination={true}
    />
  );
};
```

**Verification Workflow:**

```typescript
// One-click verification with confirmation
const handleVerify = async (reportId: string) => {
  await apiCall(`/api/admin/reports/${reportId}/verify`, {
    method: "POST",
  });
  // Refresh data and show success message
};

// Rejection with reason modal
const handleReject = async (reportId: string, reason: string) => {
  await apiCall(`/api/admin/reports/${reportId}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
  // Refresh data and show success message
};
```

### 17.7 Performance & Scalability

**Database Optimization:**

```sql
-- Composite indexes for common admin queries
CREATE INDEX IF NOT EXISTS reports_admin_status_created_idx
ON reports(status, created_at DESC)
WHERE status IN ('pending', 'verified', 'rejected');

CREATE INDEX IF NOT EXISTS reports_admin_user_status_idx
ON reports(user_id, status, created_at DESC);
```

**Caching Strategy:**

```typescript
// Cache admin statistics for 5 minutes
const getAdminStats = async () => {
  const cacheKey = "admin:stats";
  const cached = await redis.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  const stats = await calculateAdminStats();
  await redis.setex(cacheKey, 300, JSON.stringify(stats));
  return stats;
};
```

---

_This comprehensive RFC incorporates all PRD requirements while maintaining implementation focus. Ready for development sprint planning._
