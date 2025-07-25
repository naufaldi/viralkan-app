# Authentication System Design

**Viralkan App - Firebase + Next.js + Hono Authentication Architecture**

_Version: 1.0 | Last Updated: January 2025_

---

## Overview

This document outlines the authentication system design for Viralkan, a road damage reporting platform. The system uses **Firebase Authentication** for identity management, **Next.js App Router** for frontend protection, and **Hono API** for backend verification.

### Core Principles

- **Security First**: Multi-layer protection with server-side verification
- **Performance Optimized**: Lightweight checks with strategic caching
- **Developer Experience**: Type-safe, easy to extend and maintain
- **User Experience**: Seamless authentication flow with minimal friction

---

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Firebase      │
│   (Next.js)     │    │   (Hono API)    │    │   Auth          │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Middleware    │◄──►│ • Auth Routes   │◄──►│ • ID Tokens     │
│ • Server Comp.  │    │ • Middleware    │    │ • User Mgmt     │
│ • Server Action │    │ • Verification  │    │ • Google OAuth  │
│ • Client Context│    │ • User Storage  │    │ • Token Refresh │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## Authentication Flow

### 1. User Login Process

```typescript
// Flow: User Login
1. User clicks "Login with Google"
2. Firebase handles OAuth redirect
3. Firebase returns ID token
4. Frontend stores token in HTTP-only cookie
5. Frontend verifies token with backend
6. Backend validates token with Firebase Admin SDK
7. Backend creates/updates user in PostgreSQL
8. User is authenticated and redirected
```

### 2. Protected Route Access

```typescript
// Flow: Accessing Protected Routes
1. User navigates to protected route
2. Next.js middleware checks for auth cookie
3. If no cookie: redirect to login
4. If cookie exists: proceed to page
5. Server component verifies token with backend
6. If valid: render page with user data
7. If invalid: clear cookie and redirect to login
```

### 3. API Request Authentication

```typescript
// Flow: API Requests
1. Client makes authenticated request
2. Token from cookie added to Authorization header
3. Hono middleware verifies Firebase token
4. Firebase Admin SDK validates token
5. User context set for request
6. API endpoint processes with authenticated user
```

---

## Implementation Layers

### Layer 1: Next.js Middleware (Fast Protection)

**Purpose**: Lightweight route protection with quick redirects

```typescript
// apps/web/middleware.ts
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Quick token existence check
  const token = request.cookies.get("firebase-token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Basic format validation (optional optimization)
  if (!token.includes(".") || token.length < 100) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("firebase-token");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/laporan/buat", "/profile/:path*"],
};
```

**Characteristics**:

- ✅ Runs only on protected routes (performance)
- ✅ Fast cookie existence check
- ✅ No backend calls (minimal latency)
- ✅ Preserves intended destination

### Layer 2: Server Component Authentication

**Purpose**: Full token verification with user data fetching

```typescript
// apps/web/lib/auth-server.ts
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getAuthUser(): Promise<AuthUser | null> {
  const token = cookies().get("firebase-token")?.value;

  if (!token) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) return null;

    const data: AuthVerificationResponse = await response.json();
    return data.user;
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) redirect("/login");
  return user;
}
```

**Usage in Protected Pages**:

```typescript
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const user = await requireAuth(); // Server-side auth check

  return <DashboardContent user={user} />;
}
```

**Characteristics**:

- ✅ Full token verification via Hono API
- ✅ Server-rendered with authenticated user data
- ✅ No client-side loading states
- ✅ SEO-friendly protected content

### Layer 3: Server Actions Protection

**Purpose**: Secure server-side mutations and data operations

```typescript
// apps/web/lib/auth-actions.ts
"use server";
import { getAuthUser } from "./auth-server";
import { redirect } from "next/navigation";

export async function withAuth<T extends any[], R>(
  action: (user: AuthUser, ...args: T) => Promise<R>,
) {
  return async (...args: T): Promise<R> => {
    const user = await getAuthUser();
    if (!user) redirect("/login");
    return action(user, ...args);
  };
}

export const createReportAction = withAuth(async (user, formData: FormData) => {
  const reportData = {
    image_url: formData.get("image_url") as string,
    category: formData.get("category") as string,
    street_name: formData.get("street_name") as string,
    location_text: formData.get("location_text") as string,
  };

  const response = await fetch(`${API_BASE_URL}/api/reports`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reportData),
  });

  if (!response.ok) {
    throw new Error("Failed to create report");
  }

  return response.json();
});
```

**Characteristics**:

- ✅ Type-safe protected mutations
- ✅ Automatic user context injection
- ✅ Server-side validation and security
- ✅ Seamless error handling

### Layer 4: Client Context Integration

**Purpose**: UI state management and client-server synchronization

```typescript
// apps/web/contexts/AuthContext.tsx
'use client'
export function AuthProvider({
  children,
  initialUser
}: {
  children: React.ReactNode;
  initialUser?: AuthUser | null;
}) {
  const [user, setUser] = useState<AuthUser | null>(initialUser || null);
  const [isLoading, setIsLoading] = useState(!initialUser);

  // Sync with server-side auth state
  useEffect(() => {
    if (!initialUser) {
      refreshAuth();
    }
  }, [initialUser]);

  return (
    <AuthContext.Provider value={{ user, isLoading, ... }}>
      {children}
    </AuthContext.Provider>
  );
}
```

**Root Layout Integration**:

```typescript
// app/layout.tsx
export default async function RootLayout({ children }) {
  const initialUser = await getAuthUser(); // Server-side initial state

  return (
    <html>
      <body>
        <AuthProvider initialUser={initialUser}>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

**Characteristics**:

- ✅ Server-side initial auth state
- ✅ No client-side loading on first render
- ✅ Seamless client/server synchronization
- ✅ Type-safe auth context throughout app

---

## Backend Authentication (Hono API)

### Token Verification Middleware

```typescript
// apps/api/src/routes/auth/middleware.ts
export const firebaseAuthMiddleware = async (c: AuthContext, next: Next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Missing Authorization header" }, 401);
  }

  const idToken = authHeader.substring(7);
  const result = await shell.verifyTokenAndGetUser(sql, idToken);

  if (!result.success) {
    return c.json({ error: result.error }, result.statusCode);
  }

  c.set("user_id", result.data.user_id);
  await next();
};
```

### Authentication Routes

```typescript
// apps/api/src/routes/auth/api.ts

// POST /api/auth/verify - Token verification
authRouter.openapi(verifyRoute, async (c) => {
  const authHeader = c.req.header("Authorization");
  const idToken = authHeader.substring(7);

  const result = await shell.verifyTokenAndGetUser(sql, idToken);

  if (result.success) {
    return c.json(result.data, 200);
  } else {
    return c.json({ error: result.error }, result.statusCode);
  }
});

// GET /api/auth/me - User profile
authRouter.openapi(getMeRoute, async (c) => {
  const userId = c.get("user_id");
  const result = await shell.getUserById(sql, userId, userId);

  return result.success
    ? c.json(result.data, 200)
    : c.json({ error: result.error }, result.statusCode);
});
```

### Response Schemas

```typescript
// apps/api/src/schema/auth.ts
export const AuthVerificationResponseSchema = z.object({
  message: z.string(),
  user_id: z.number(),
  user: UserResponseSchema,
});

export const UserResponseSchema = z.object({
  id: z.number(),
  firebase_uid: z.string(),
  email: z.string(),
  name: z.string(),
  avatar_url: z.string().nullable(),
  provider: z.string(),
  created_at: z.string(),
});
```

---

## Cookie Management

### Secure Cookie Strategy

```typescript
// apps/web/lib/auth-cookies.ts
"use server";
import { cookies } from "next/headers";

export async function setAuthCookie(token: string) {
  cookies().set("firebase-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function clearAuthCookie() {
  cookies().delete("firebase-token");
}
```

**Cookie Security Features**:

- ✅ **httpOnly**: Prevents XSS access to tokens
- ✅ **secure**: HTTPS-only in production
- ✅ **sameSite: strict**: CSRF protection
- ✅ **maxAge**: Automatic expiration
- ✅ **path: '/'**: Available to all routes

---

## Type Safety

### Shared Type Definitions

```typescript
// Consistent types across frontend and backend
interface AuthUser {
  id: number;
  firebase_uid: string;
  email: string;
  name: string;
  avatar_url: string | null;
  provider: string;
  created_at: string;
}

interface AuthVerificationResponse {
  message: string;
  user_id: number;
  user: AuthUser;
}
```

### Frontend-Backend Alignment

```typescript
// Frontend types match backend Zod schemas exactly
// apps/web/lib/types/auth.ts - matches apps/api/src/schema/auth.ts
export type AuthUser = z.infer<typeof UserResponseSchema>;
export type AuthVerificationResponse = z.infer<
  typeof AuthVerificationResponseSchema
>;
```

---

## Error Handling

### Comprehensive Error Management

```typescript
type AuthError =
  | "firebase-auth-failed"
  | "firebase-token-invalid"
  | "backend-verification-failed"
  | "network-error"
  | "unknown-error";

const AUTH_ERROR_MESSAGES: Record<AuthError, string> = {
  "firebase-auth-failed": "Gagal masuk dengan Google. Silakan coba lagi.",
  "firebase-token-invalid": "Sesi telah berakhir. Silakan masuk kembali.",
  "backend-verification-failed":
    "Gagal verifikasi dengan server. Silakan coba lagi.",
  "network-error": "Tidak ada koneksi internet. Silakan coba lagi.",
  "unknown-error": "Terjadi kesalahan. Silakan coba lagi.",
};
```

### Error Recovery Strategies

```typescript
// Automatic token refresh on expiration
useEffect(() => {
  if (firebaseUser && authError === "firebase-token-invalid") {
    // Attempt token refresh
    getIdToken(true).then((newToken) => {
      if (newToken) {
        setAuthCookie(newToken);
        verifyWithBackend();
      }
    });
  }
}, [authError, firebaseUser]);
```

---

## Performance Optimizations

### Caching Strategy

- **Middleware**: No caching (security first)
- **Server Components**: `cache: 'no-store'` for auth verification
- **Static Routes**: Normal Next.js caching
- **Client State**: Memory caching with refresh capability

### Bundle Optimization

- **Firebase SDK**: Client-side only where needed
- **Server Components**: Zero client-side auth logic
- **Code Splitting**: Auth logic loaded on demand

---

## Security Considerations

### Token Security

1. **Firebase ID Tokens**: Short-lived (1 hour), automatically refreshed
2. **HTTP-only Cookies**: Prevents XSS token theft
3. **CSRF Protection**: SameSite cookies + Next.js built-in protection
4. **Token Validation**: Server-side verification with Firebase Admin SDK

### Route Protection

1. **Middleware Layer**: Fast unauthorized access prevention
2. **Server Component Layer**: Full verification before content access
3. **Server Action Layer**: Protected mutations and sensitive operations
4. **Client Layer**: UI state management and user experience

### Data Protection

1. **User Data**: Stored in PostgreSQL with proper indexing
2. **Sensitive Operations**: Server-side only (no client exposure)
3. **API Security**: Bearer token validation on all protected endpoints
4. **Audit Trail**: Comprehensive logging for security events

---

## Implementation Checklist

### Phase 1: Core Infrastructure

- [ ] Configure Firebase project and Admin SDK
- [ ] Set up Next.js middleware for route protection
- [ ] Implement server component auth utilities
- [ ] Create secure cookie management system

### Phase 2: Backend Integration

- [ ] Implement Hono auth middleware
- [ ] Create auth verification endpoints
- [ ] Set up user management in PostgreSQL
- [ ] Add comprehensive error handling

### Phase 3: Frontend Enhancement

- [ ] Build client auth context with server sync
- [ ] Create protected server actions
- [ ] Implement auth-aware UI components
- [ ] Add token refresh and error recovery

### Phase 4: Testing & Security

- [ ] Test all authentication flows
- [ ] Verify security headers and cookies
- [ ] Load test protected endpoints
- [ ] Security audit and penetration testing

---

## File Structure

```
apps/web/
├── middleware.ts                 # Layer 1: Route protection
├── lib/
│   ├── auth-server.ts           # Layer 2: Server component auth
│   ├── auth-actions.ts          # Layer 3: Protected server actions
│   └── auth-cookies.ts          # Secure cookie management
├── contexts/
│   └── AuthContext.tsx          # Layer 4: Client state management
└── app/
    ├── layout.tsx               # Root auth provider
    └── (protected)/
        ├── dashboard/           # Protected routes
        └── profile/

apps/api/
├── src/routes/auth/
│   ├── api.ts                   # Auth endpoints
│   ├── middleware.ts            # Token verification
│   ├── shell.ts                 # Business logic
│   └── types.ts                 # Type definitions
└── src/schema/
    └── auth.ts                  # Zod validation schemas
```

---

## Data Fetching Strategies: Server vs Client

### Understanding the Approaches

The authentication system supports two distinct data patterns, each optimized for different use cases:

1. **Server-Side Data Fetching** - For static content that needs SEO and fast initial loads
2. **Client-Side Context State** - For reactive UI components that change frequently

### Server-Side Data Fetching (Server Actions/Components)

**When to Use:**

- ✅ Dashboard data that loads once with the page
- ✅ Content that needs to be SEO-friendly
- ✅ Data that requires server-side validation
- ✅ Initial page loads that should be fast
- ✅ Content that rarely changes during user session

**When NOT to Use:**

- ❌ Data that needs real-time updates
- ❌ Interactive components with frequent state changes
- ❌ Global state shared across many components
- ❌ Components that need loading/error states

**Example: Dashboard Reports**

```typescript
// apps/web/app/dashboard/page.tsx
export default async function DashboardPage() {
  // ✅ Server-side authentication check
  const user = await requireAuth(); // Runs on server, no loading state needed
  const stats = await getUserStats(); // Direct API call from server

  // ✅ Server-side data fetching with error handling
  let userReports: Report[] = [];
  try {
    userReports = await getUserReportsAction(new URLSearchParams("limit=6"));
  } catch (error) {
    console.error("Error fetching user reports:", error);
    userReports = []; // Fallback to empty array
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      {/* ✅ Data is immediately available, no loading state */}
      <main className="container mx-auto px-8 py-12 max-w-7xl">
        <div className="mb-16">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">
            Selamat datang, {user.name}! {/* Direct server data */}
          </h1>
        </div>

        {/* ✅ Stats loaded server-side, conditionally rendered */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card>
              <CardContent>
                <div className="text-4xl font-bold text-neutral-900 mb-2">
                  {stats.total_reports} {/* No loading state needed */}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ✅ Reports table with server-fetched data */}
        <ReportsTable data={userReports} />
      </main>
    </div>
  );
}
```

**Server Action Pattern:**

```typescript
// apps/web/lib/auth-actions.ts
"use server";

export async function getUserReportsAction(searchParams?: URLSearchParams) {
  // ✅ Server-side authentication
  const user = await getAuthUser();
  if (!user) redirect("/login");

  // ✅ Direct API call with server-side token
  const cookieStore = await cookies();
  const token = cookieStore.get("firebase-token")?.value;

  const response = await fetch(`${API_BASE_URL}/api/reports/me${queryString}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store", // Always fresh data
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json(); // Returns directly to server component
}
```

**Characteristics:**

- 🚀 **Fast Initial Load** - No client-side JavaScript needed
- 🔍 **SEO Friendly** - Content available in initial HTML
- 🔒 **Secure** - Authentication happens server-side
- 📊 **Perfect for Dashboards** - Static data that loads once
- ⚡ **No Loading States** - Data is ready when page renders

### Client-Side Context State (Reactive Components)

**When to Use:**

- ✅ Header/navigation that shows user status
- ✅ Components that need real-time auth state changes
- ✅ Interactive elements that respond to login/logout
- ✅ Global state shared across multiple components
- ✅ Components that need loading and error states

**When NOT to Use:**

- ❌ SEO-critical content
- ❌ Large datasets that load once
- ❌ Server-side protected routes
- ❌ Content that doesn't change during session

**Example: Header Component**

```typescript
// apps/web/components/layout/header.tsx
"use client";

const Header = () => {
  // ✅ Client-side reactive auth state
  const { isAuthenticated, isLoading, backendUser, signOut } = useAuthContext();

  const handleLogout = async () => {
    try {
      await signOut(); // ✅ Triggers state change across app
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const renderAuthButton = () => {
    // ✅ Loading state for better UX
    if (isLoading) {
      return (
        <Button size="default" disabled variant="default">
          Loading...
        </Button>
      );
    }

    // ✅ Reactive UI based on auth state
    if (isAuthenticated && backendUser) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-11 w-11 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={backendUser.avatar_url || undefined}
                  alt={backendUser.name}
                />
                <AvatarFallback>
                  {backendUser.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {backendUser.name} {/* Reactive user data */}
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    // ✅ Login button for unauthenticated users
    return (
      <Button asChild>
        <Link href="/login">Masuk</Link>
      </Button>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <MapPin className="h-6 w-6" />
          <span className="font-bold">Viralkan</span>
        </Link>

        {/* ✅ Reactive auth button */}
        {renderAuthButton()}
      </div>
    </header>
  );
};
```

**Context Implementation:**

```typescript
// apps/web/contexts/AuthContext.tsx
'use client'

export function AuthProvider({
  children,
  initialUser // ✅ Server-side initial state for hydration
}: {
  children: React.ReactNode;
  initialUser?: AuthUser | null;
}) {
  // ✅ Client state synchronized with server
  const [backendUser, setBackendUser] = useState<AuthUser | null>(initialUser || null);
  const [isLoading, setIsLoading] = useState(!initialUser);

  // ✅ Firebase client-side auth state
  const firebaseUser = useFirebaseAuth();

  // ✅ Sync server and client state
  useEffect(() => {
    if (firebaseUser && !backendUser) {
      // User logged in on client, sync with backend
      verifyWithBackend();
    } else if (!firebaseUser && backendUser) {
      // User logged out, clear backend state
      setBackendUser(null);
    }
  }, [firebaseUser, backendUser]);

  const signOut = async () => {
    try {
      await logoutAction(); // ✅ Server action for logout
      setBackendUser(null); // ✅ Update client state
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!backendUser,
      isLoading,
      backendUser,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
```

**Root Layout Integration:**

```typescript
// apps/web/app/layout.tsx
export default async function RootLayout({ children }) {
  // ✅ Server-side initial auth state (no loading on first render)
  const initialUser = await getAuthUser();

  return (
    <html>
      <body>
        {/* ✅ Hydrate client context with server state */}
        <AuthProvider initialUser={initialUser}>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

**Characteristics:**

- ⚡ **Real-time Updates** - Responds to auth state changes immediately
- 🎯 **Interactive** - Loading states, error handling, user actions
- 🌐 **Global State** - Available to any component using the context
- 🔄 **Reactive** - UI updates automatically when auth state changes
- 🎨 **Rich UX** - Loading spinners, error messages, smooth transitions

### Decision Matrix: When to Use Each Approach

| Use Case                        | Server Action      | Client Context     | Reasoning                                                |
| ------------------------------- | ------------------ | ------------------ | -------------------------------------------------------- |
| **Dashboard data loading**      | ✅ **Recommended** | ❌ Not suitable    | Data loads once, needs to be fast and SEO-friendly       |
| **User profile in header**      | ❌ Not suitable    | ✅ **Recommended** | Changes frequently (login/logout), needs reactive UI     |
| **Protected page content**      | ✅ **Recommended** | ❌ Not suitable    | Static content, better SEO, server-side protection       |
| **Login/logout buttons**        | ❌ Not suitable    | ✅ **Recommended** | Interactive, needs loading states, real-time updates     |
| **Report creation form**        | ✅ **Recommended** | ❌ Not suitable    | Form submission, server-side validation, one-time action |
| **Navigation menu state**       | ❌ Not suitable    | ✅ **Recommended** | Global state, responsive to auth changes                 |
| **Initial page authentication** | ✅ **Recommended** | ❌ Not suitable    | Fast loading, no client-side delays, SEO benefits        |
| **Real-time notifications**     | ❌ Not suitable    | ✅ **Recommended** | Dynamic updates, user interaction required               |

### Hybrid Pattern: Best of Both Worlds

The optimal approach combines both strategies:

```typescript
// Server component provides initial data
export default async function DashboardPage() {
  const user = await requireAuth(); // ✅ Server-side auth
  const initialReports = await getUserReportsAction(); // ✅ Server-side data

  return (
    <div>
      {/* ✅ Client component for reactive UI */}
      <Header /> {/* Uses client context for auth state */}

      {/* ✅ Server-rendered content with initial data */}
      <main>
        <h1>Welcome, {user.name}!</h1>

        {/* ✅ Client component that can refetch data */}
        <ReportsTable
          initialData={initialReports}
          userId={user.id}
        />
      </main>
    </div>
  );
}
```

This hybrid approach provides:

- 🚀 Fast initial load (server-rendered)
- ⚡ Interactive updates (client-side)
- 🔍 SEO benefits (server content)
- 🎯 Great UX (reactive components)

---

This system design provides a robust, secure, and performant authentication architecture that scales with the application's growth while maintaining excellent developer and user experience.
