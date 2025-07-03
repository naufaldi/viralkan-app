# Viralkan Frontend Implementation Plan
## Road Damage Reporting Platform - MVP Web Interface

---

## 📋 **Project Overview**
Building a **civic-focused road damage reporting platform** using:
- **Next.js 15** with App Router
- **Firebase Authentication** (Google Sign-In)
- **Tailwind CSS v4** with Shadcn UI components
- **Monorepo** structure with `@repo/ui` package
- **Design System** from `ui-concept.md`

---

## 🎯 **Phase 1: Foundation & Authentication (Priority 1)**

### **Task 1.1: UI Foundation Setup**
**Status:** 🟡 In Progress
**Dependencies:** None
**Estimated:** 2 hours

**Implementation:**
```bash
# Add missing shadcn/ui components
npx shadcn@latest add input
npx shadcn@latest add button  # Already exists
npx shadcn@latest add table
npx shadcn@latest add form
npx shadcn@latest add card    # Already exists
```

**Files to Create/Update:**
- [ ] `packages/ui/src/components/ui/input.tsx`
- [ ] `packages/ui/src/components/ui/table.tsx`
- [ ] `packages/ui/src/components/ui/form.tsx`
- [ ] Update `packages/ui/src/index.ts` exports
- [ ] Apply Viralkan design tokens to components

### **Task 1.2: Firebase Auth Client Setup**
**Status:** 🔴 Not Started
**Dependencies:** Task 1.1
**Estimated:** 3 hours

**Implementation:**
```typescript
// apps/web/lib/firebase.ts
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  // From environment variables
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
```

**Files to Create:**
- [ ] `apps/web/lib/firebase.ts`
- [ ] `apps/web/.env.local` (from .env.local.example)
- [ ] `apps/web/lib/auth-utils.ts`

### **Task 1.3: Authentication Context Provider**
**Status:** 🔴 Not Started
**Dependencies:** Task 1.2
**Estimated:** 4 hours

**Implementation:**
```typescript
// apps/web/contexts/auth-context.tsx
'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({})
export const useAuth = () => useContext(AuthContext)
```

**Files to Create:**
- [ ] `apps/web/contexts/auth-context.tsx`
- [ ] `apps/web/hooks/use-auth.ts`
- [ ] Update `apps/web/app/layout.tsx` with provider

---

## 🎯 **Phase 2: Core UI Components (Priority 2)**

### **Task 2.1: API Client Utilities**
**Status:** 🔴 Not Started
**Dependencies:** Task 1.3
**Estimated:** 3 hours

**Implementation:**
```typescript
// apps/web/lib/api-client.ts
class ApiClient {
  constructor(private baseUrl: string) {}
  
  async request<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const token = await this.getAuthToken()
    // Implementation with auth headers
  }
  
  // Reports endpoints
  async getReports(params?: ReportsParams): Promise<Report[]>
  async createReport(data: CreateReportData): Promise<Report>
  async updateReport(id: string, data: UpdateReportData): Promise<Report>
}
```

**Files to Create:**
- [ ] `apps/web/lib/api-client.ts`
- [ ] `apps/web/types/api.ts`
- [ ] `apps/web/lib/constants.ts`

### **Task 2.2: Main Layout & Navigation**
**Status:** 🔴 Not Started
**Dependencies:** Task 1.3, Task 2.1
**Estimated:** 5 hours

**Implementation:**
```typescript
// apps/web/components/layout/main-layout.tsx
import { useAuth } from '@/contexts/auth-context'
import { Navigation } from './navigation'
import { Header } from './header'

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <Navigation user={user} />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
```

**Files to Create:**
- [ ] `apps/web/components/layout/main-layout.tsx`
- [ ] `apps/web/components/layout/header.tsx`
- [ ] `apps/web/components/layout/navigation.tsx`
- [ ] `apps/web/components/ui/avatar.tsx`
- [ ] Apply civic blue design theme

---

## 🎯 **Phase 3: Authentication Pages (Priority 3)**

### **Task 3.1: Login Page**
**Status:** 🔴 Not Started
**Dependencies:** Task 2.2
**Estimated:** 4 hours

**Implementation:**
```typescript
// apps/web/app/login/page.tsx
'use client'
import { Button } from '@repo/ui/button'
import { Card } from '@repo/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const { signInWithGoogle, loading } = useAuth()
  const router = useRouter()
  
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
      router.push('/dashboard')
    } catch (error) {
      // Error handling
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-civic-blue-50 to-civic-blue-100">
      <Card className="w-full max-w-md p-8">
        <div className="text-center space-y-6">
          <h1 className="text-2xl font-bold text-civic-blue-900">
            Viralkan - Lapor Kerusakan Jalan
          </h1>
          <p className="text-gray-600">
            Masuk untuk melaporkan kerusakan jalan di sekitar Anda
          </p>
          <Button 
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Sedang masuk...' : 'Masuk dengan Google'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
```

**Files to Create:**
- [ ] `apps/web/app/login/page.tsx`
- [ ] `apps/web/components/auth/login-form.tsx`
- [ ] `apps/web/components/ui/loading-spinner.tsx`
- [ ] Error handling components

### **Task 3.2: Protected Routes**
**Status:** 🔴 Not Started
**Dependencies:** Task 3.1
**Estimated:** 2 hours

**Implementation:**
```typescript
// apps/web/components/auth/protected-route.tsx
'use client'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])
  
  if (loading) return <LoadingScreen />
  if (!user) return null
  
  return <>{children}</>
}
```

**Files to Create:**
- [ ] `apps/web/components/auth/protected-route.tsx`
- [ ] `apps/web/middleware.ts` (route protection)
- [ ] `apps/web/components/loading-screen.tsx`

---

## 🎯 **Phase 4: Reports Management (Priority 4)**

### **Task 4.1: Reports Data Types**
**Status:** 🔴 Not Started
**Dependencies:** Task 2.1
**Estimated:** 2 hours

**Implementation:**
```typescript
// apps/web/types/reports.ts
export interface Report {
  id: string
  title: string
  description: string
  category: 'pothole' | 'crack' | 'surface_damage' | 'drainage' | 'other'
  severity: 'low' | 'medium' | 'high' | 'critical'
  location: {
    lat: number
    lng: number
    address: string
  }
  images: string[]
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected'
  userId: string
  createdAt: string
  updatedAt: string
}

export interface CreateReportData {
  title: string
  description: string
  category: Report['category']
  severity: Report['severity']
  location: Report['location']
  images: File[]
}
```

**Files to Create:**
- [ ] `apps/web/types/reports.ts`
- [ ] `apps/web/lib/report-utils.ts`
- [ ] `apps/web/constants/report-categories.ts`

### **Task 4.2: Reports List with Data Table**
**Status:** 🔴 Not Started
**Dependencies:** Task 4.1
**Estimated:** 6 hours

**Implementation:**
```typescript
// apps/web/components/reports/reports-data-table.tsx
'use client'
import { useState, useEffect } from 'react'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@repo/ui/button'
import { Input } from '@repo/ui/input'
import { Badge } from '@repo/ui/badge'
import { useReactTable, ColumnDef } from '@tanstack/react-table'

const columns: ColumnDef<Report>[] = [
  {
    accessorKey: 'title',
    header: 'Judul Laporan',
  },
  {
    accessorKey: 'category',
    header: 'Kategori',
    cell: ({ row }) => (
      <Badge variant={getCategoryVariant(row.original.category)}>
        {getCategoryLabel(row.original.category)}
      </Badge>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={getStatusVariant(row.original.status)}>
        {getStatusLabel(row.original.status)}
      </Badge>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Tanggal Dibuat',
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
]

export function ReportsDataTable() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [columnFilters, setColumnFilters] = useState([])
  
  // Data fetching and table setup
}
```

**Files to Create:**
- [ ] `apps/web/components/reports/reports-data-table.tsx`
- [ ] `apps/web/components/ui/data-table.tsx` (from shadcn docs)
- [ ] `apps/web/components/ui/badge.tsx`
- [ ] `apps/web/components/reports/report-card.tsx`
- [ ] `apps/web/app/reports/page.tsx`

### **Task 4.3: Individual Report Detail Page**
**Status:** 🔴 Not Started
**Dependencies:** Task 4.2
**Estimated:** 4 hours

**Implementation:**
```typescript
// apps/web/app/reports/[id]/page.tsx
import { ReportDetail } from '@/components/reports/report-detail'
import { ProtectedRoute } from '@/components/auth/protected-route'

export default async function ReportDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const report = await getReport(params.id)
  
  if (!report) {
    return <NotFound />
  }
  
  return (
    <ProtectedRoute>
      <ReportDetail report={report} />
    </ProtectedRoute>
  )
}
```

**Files to Create:**
- [ ] `apps/web/app/reports/[id]/page.tsx`
- [ ] `apps/web/components/reports/report-detail.tsx`
- [ ] `apps/web/components/reports/report-actions.tsx`
- [ ] `apps/web/components/ui/image-gallery.tsx`

---

## 🎯 **Phase 5: User Features (Priority 5)**

### **Task 5.1: User Dashboard**
**Status:** 🔴 Not Started
**Dependencies:** Task 4.2
**Estimated:** 5 hours

**Implementation:**
```typescript
// apps/web/app/dashboard/page.tsx
import { DashboardStats } from '@/components/dashboard/stats'
import { RecentReports } from '@/components/dashboard/recent-reports'
import { ProtectedRoute } from '@/components/auth/protected-route'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-civic-blue-900">
            Dashboard Saya
          </h1>
          <p className="text-gray-600">
            Lihat laporan Anda dan statistik terbaru
          </p>
        </div>
        
        <DashboardStats />
        <RecentReports />
      </div>
    </ProtectedRoute>
  )
}
```

**Files to Create:**
- [ ] `apps/web/app/dashboard/page.tsx`
- [ ] `apps/web/components/dashboard/stats.tsx`
- [ ] `apps/web/components/dashboard/recent-reports.tsx`
- [ ] `apps/web/components/dashboard/quick-actions.tsx`

### **Task 5.2: Create Report Form**
**Status:** 🔴 Not Started
**Dependencies:** Task 5.1
**Estimated:** 6 hours

**Implementation:**
```typescript
// apps/web/app/reports/create/page.tsx
'use client'
import { CreateReportForm } from '@/components/reports/create-report-form'
import { ProtectedRoute } from '@/components/auth/protected-route'

export default function CreateReportPage() {
  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-civic-blue-900">
            Buat Laporan Baru
          </h1>
          <p className="text-gray-600">
            Laporkan kerusakan jalan yang Anda temukan
          </p>
        </div>
        
        <CreateReportForm />
      </div>
    </ProtectedRoute>
  )
}
```

**Files to Create:**
- [ ] `apps/web/app/reports/create/page.tsx`
- [ ] `apps/web/components/reports/create-report-form.tsx`
- [ ] `apps/web/components/forms/location-picker.tsx`
- [ ] `apps/web/components/forms/image-upload.tsx`
- [ ] `apps/web/components/forms/category-selector.tsx`

---

## 🎯 **Phase 6: Enhancement & Polish (Priority 6)**

### **Task 6.1: Error Handling & Loading States**
**Status:** 🔴 Not Started
**Dependencies:** All previous tasks
**Estimated:** 3 hours

**Files to Create:**
- [ ] `apps/web/components/ui/error-boundary.tsx`
- [ ] `apps/web/components/ui/loading-states.tsx`
- [ ] `apps/web/app/error.tsx`
- [ ] `apps/web/app/loading.tsx`
- [ ] `apps/web/app/not-found.tsx`

### **Task 6.2: Mobile Optimization**
**Status:** 🔴 Not Started
**Dependencies:** Task 6.1
**Estimated:** 4 hours

**Implementation Focus:**
- Responsive design improvements
- Touch-friendly interactions
- Mobile navigation patterns
- Performance optimization

**Files to Update:**
- [ ] All layout components for mobile-first design
- [ ] Navigation for mobile menu
- [ ] Forms for mobile usability
- [ ] Tables for mobile responsiveness

---

## 📦 **Dependencies & Installation**

### **Package Dependencies:**
```bash
# Core dependencies (already installed)
npm install firebase@11.10.0
npm install @tanstack/react-table
npm install class-variance-authority
npm install clsx tailwind-merge

# Form handling
npm install react-hook-form @hookform/resolvers
npm install zod

# Additional UI components
npx shadcn@latest add input table form badge avatar
```

### **Environment Variables:**
```bash
# apps/web/.env.local
NEXT_PUBLIC_FIREBASE_API_KEY=""
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=""
NEXT_PUBLIC_FIREBASE_PROJECT_ID=""
NEXT_PUBLIC_API_BASE_URL="http://localhost:3001"
```

---

## 🚀 **Implementation Order & Timeline**

**Week 1:** Phase 1 - Foundation & Authentication
**Week 2:** Phase 2 - Core UI Components + Phase 3 - Authentication Pages  
**Week 3:** Phase 4 - Reports Management
**Week 4:** Phase 5 - User Features + Phase 6 - Enhancement & Polish

---

## 📋 **Success Criteria**

### **MVP Completion:**
- [ ] Users can sign in with Google
- [ ] Users can view list of reports with filtering/pagination
- [ ] Users can create new reports with images and location
- [ ] Users can view their dashboard with personal reports
- [ ] Mobile-responsive design
- [ ] Error handling and loading states
- [ ] Integration with existing backend API

### **Design System Compliance:**
- [ ] Civic blue color scheme implementation
- [ ] Geist font family usage
- [ ] Consistent spacing (4px base unit)
- [ ] Accessible components (WCAG 2.1 AA)
- [ ] Performance optimized for mobile networks

---

## 🔗 **Key References**
- **Design System:** `docs/ui-concept.md`
- **Backend API:** `apps/api/src/routes/`
- **Next.js Docs:** Context7 `/vercel/next.js`
- **Firebase Auth:** Context7 `/firebase/firebase-js-sdk`
- **Shadcn UI:** Context7 `/shadcn-ui/ui`
