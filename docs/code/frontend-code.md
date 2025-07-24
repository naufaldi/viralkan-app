# Frontend Code Development Guide for Next.js

This document outlines the core code conventions, architectural patterns, and best practices for frontend development using Next.js, React, and TypeScript. It follows clean architecture principles with practical implementation guidelines.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Layer Responsibilities](#layer-responsibilities)
4. [Component Patterns](#component-patterns)
5. [State Management](#state-management)
6. [Data Fetching](#data-fetching)
7. [Styling Guidelines](#styling-guidelines)
8. [Testing Strategy](#testing-strategy)
9. [Code Style Guidelines](#code-style-guidelines)

## Architecture Overview

We follow a **Component-Based Architecture** with clear separation of concerns:

```
┌─────────────────────────────────────┐
│         Page Components              │  ← Route-level components
├─────────────────────────────────────┤
│       Feature Components             │  ← Business logic components
├─────────────────────────────────────┤
│        UI Components                 │  ← Reusable UI elements
├─────────────────────────────────────┤
│         Custom Hooks                 │  ← State and data logic
├─────────────────────────────────────┤
│         Services/API                 │  ← External data access
└─────────────────────────────────────┘
```

**Dependency Direction**: `Pages → Features → UI ← Hooks → Services`

## Project Structure

```
apps/web/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   ├── dashboard/         # Dashboard pages
│   ├── laporan/          # Report pages
│   └── layout.tsx        # Root layout
├── components/            # Feature-specific components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   ├── reports/          # Report components
│   ├── forms/            # Form components
│   ├── layout/           # Layout components
│   └── ui/               # Local UI overrides
├── hooks/                 # Custom hooks
│   ├── dashboard/        # Dashboard-specific hooks
│   ├── reports/          # Report-specific hooks
│   └── useAuth.ts        # Authentication hooks
├── services/              # API and external services
│   ├── api-client.ts     # Base API client
│   ├── api.ts            # API endpoints
│   └── upload.ts         # File upload service
├── lib/                   # Utilities and configurations
│   ├── api-client.ts     # API client configuration
│   ├── auth-actions.ts   # Server actions
│   └── providers.tsx     # Context providers
├── contexts/              # React contexts
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions

packages/ui/               # Shared UI components
├── src/
│   ├── components/ui/    # shadcn/ui components
│   └── index.ts          # Public exports
```

## Layer Responsibilities

### 1. Page Components (`app/`)

**Purpose**: Route-level components using Next.js App Router

**Responsibilities**:
- Route definitions and layouts
- Server-side data fetching
- SEO and metadata
- Error boundaries

**Should NOT**:
- Contain complex business logic
- Handle client-side state management
- Include styling details

```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react'
import { DashboardContent } from '@/components/dashboard/DashboardContent'
import { DashboardStats } from '@/components/dashboard/DashboardStats'

export default async function DashboardPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <Suspense fallback={<DashboardStatsSkeleton />}>
        <DashboardStats />
      </Suspense>
      <Suspense fallback={<DashboardContentSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  )
}
```

### 2. Feature Components (`components/`)

**Purpose**: Business logic components specific to features

**Responsibilities**:
- Feature-specific business logic
- Component composition
- State management coordination
- User interactions

```typescript
// components/reports/create-report-form.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { useCreateReport } from '@/hooks/use-create-report'

export const CreateReportForm = () => {
  const [formData, setFormData] = useState({})
  const { mutate: createReport, isLoading } = useCreateReport()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createReport(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        name="title"
        placeholder="Report title"
        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Report'}
      </Button>
    </form>
  )
}
```

### 3. UI Components (`packages/ui/`)

**Purpose**: Reusable UI elements built with shadcn/ui

**Responsibilities**:
- Atomic UI components
- Consistent styling
- Accessibility features
- Component composition

```typescript
// packages/ui/src/components/ui/button.tsx
import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
```

### 4. Custom Hooks (`hooks/`)

**Purpose**: Encapsulate state logic and data fetching

**Responsibilities**:
- State management
- Data fetching with React Query
- Business logic coordination
- Side effects

```typescript
// hooks/reports/use-reports.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'

export const useReports = (filters?: ReportFilters) => {
  return useQuery({
    queryKey: ['reports', filters],
    queryFn: () => api.reports.list(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// hooks/use-create-report.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'

export const useCreateReport = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateReportData) => api.reports.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}
```

### 5. Services (`services/`)

**Purpose**: External API communication and data access

**Responsibilities**:
- API client configuration
- HTTP request handling
- Data transformation
- Error handling

```typescript
// services/api-client.ts
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// services/api.ts
import { apiClient } from './api-client'

export const api = {
  reports: {
    list: (filters?: ReportFilters) => 
      apiClient.get('/reports', { params: filters }).then(res => res.data),
    create: (data: CreateReportData) => 
      apiClient.post('/reports', data).then(res => res.data),
    getById: (id: string) => 
      apiClient.get(`/reports/${id}`).then(res => res.data),
  },
  auth: {
    login: (credentials: LoginCredentials) => 
      apiClient.post('/auth/login', credentials).then(res => res.data),
    logout: () => 
      apiClient.post('/auth/logout').then(res => res.data),
  },
}
```

## Component Patterns

### Component Structure

```typescript
// 1. External imports
import { useState } from 'react'
import { Button } from '@/ui/button'

// 2. Internal imports
import { useReports } from '@/hooks/use-reports'

// 3. Types
interface ReportCardProps {
  report: Report
  onEdit?: (id: string) => void
}

// 4. Component
export const ReportCard = ({ report, onEdit }: ReportCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleEdit = () => {
    onEdit?.(report.id)
  }

  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold">{report.title}</h3>
      <p className="text-sm text-gray-600">{report.description}</p>
      <Button onClick={handleEdit} variant="outline" size="sm">
        Edit
      </Button>
    </div>
  )
}
```

### Form Patterns

```typescript
// components/forms/report-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'

const reportSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['berlubang', 'retak', 'lainnya']),
})

type ReportFormData = z.infer<typeof reportSchema>

export const ReportForm = ({ onSubmit }: { onSubmit: (data: ReportFormData) => void }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          {...register('title')}
          placeholder="Report title"
          aria-invalid={errors.title ? 'true' : 'false'}
        />
        {errors.title && (
          <p className="text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>
      
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Report'}
      </Button>
    </form>
  )
}
```

## State Management

### React Query for Server State

```typescript
// hooks/use-reports-stats.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'

export const useReportsStats = () => {
  return useQuery({
    queryKey: ['reports', 'stats'],
    queryFn: () => api.reports.getStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// hooks/use-reports-mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'

export const useUpdateReport = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReportData }) =>
      api.reports.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['reports', id] })
    },
  })
}
```

### Context for Global State

```typescript
// contexts/AuthContext.tsx
'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { User } from '@/types'

interface AuthContextType {
  user: User | null
  login: (user: User) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = (userData: User) => {
    setUser(userData)
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

## Data Fetching

### Server Components

```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react'
import { getReports } from '@/lib/api'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { ReportsList } from '@/components/dashboard/ReportsList'

export default async function DashboardPage() {
  const reports = await getReports()

  return (
    <div className="container mx-auto p-6">
      <Suspense fallback={<div>Loading stats...</div>}>
        <DashboardStats reports={reports} />
      </Suspense>
      <Suspense fallback={<div>Loading reports...</div>}>
        <ReportsList initialReports={reports} />
      </Suspense>
    </div>
  )
}
```

### Server Actions

```typescript
// lib/auth-actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export async function loginAction(formData: FormData) {
  const validatedFields = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return { error: 'Invalid fields' }
  }

  const { email, password } = validatedFields.data

  try {
    // Authenticate user
    const user = await authenticateUser(email, password)
    
    // Set session
    await setSession(user)
    
    revalidatePath('/dashboard')
    redirect('/dashboard')
  } catch (error) {
    return { error: 'Invalid credentials' }
  }
}
```

### Client-side Fetching

```typescript
// hooks/use-reports.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'

export const useReports = (filters?: ReportFilters) => {
  return useQuery({
    queryKey: ['reports', filters],
    queryFn: () => api.reports.list(filters),
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}
```

## Styling Guidelines

### Tailwind CSS v4

```typescript
// Use CSS variables for theming
// app/globals.css
:root {
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 84% 4.9%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 84% 4.9%;
}

// Component styling
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
  <div className="bg-background border rounded-lg p-4 shadow-sm">
    <h3 className="text-lg font-semibold text-foreground">Title</h3>
    <p className="text-sm text-muted-foreground">Description</p>
  </div>
</div>
```

### Responsive Design

```typescript
// Grid layout: 12 columns desktop, 8 tablet, 4 mobile
<div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-4">
  <div className="col-span-4 md:col-span-4 lg:col-span-6">Main content</div>
  <div className="col-span-4 md:col-span-4 lg:col-span-6">Sidebar</div>
</div>

// Flexbox for content alignment
<div className="flex flex-col md:flex-row items-center justify-between gap-4">
  <div className="flex items-center gap-2">
    <Icon className="w-5 h-5" />
    <span>Label</span>
  </div>
  <Button>Action</Button>
</div>
```

## Testing Strategy

### Unit Tests

```typescript
// __tests__/components/ReportCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ReportCard } from '@/components/reports/ReportCard'

describe('ReportCard', () => {
  const mockReport = {
    id: '1',
    title: 'Test Report',
    description: 'Test description',
    category: 'berlubang' as const,
  }

  it('renders report information', () => {
    render(<ReportCard report={mockReport} />)
    
    expect(screen.getByText('Test Report')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = jest.fn()
    render(<ReportCard report={mockReport} onEdit={onEdit} />)
    
    fireEvent.click(screen.getByText('Edit'))
    expect(onEdit).toHaveBeenCalledWith('1')
  })
})
```

### Integration Tests

```typescript
// e2e/reports.spec.ts
import { test, expect } from '@playwright/test'

test('create report flow', async ({ page }) => {
  await page.goto('/reports/create')
  
  await page.fill('[name="title"]', 'New Report')
  await page.fill('[name="description"]', 'Report description')
  await page.selectOption('[name="category"]', 'berlubang')
  
  await page.click('button[type="submit"]')
  
  await expect(page).toHaveURL('/reports')
  await expect(page.locator('text=New Report')).toBeVisible()
})
```

## Code Style Guidelines

### TypeScript

```typescript
// Strict typing - no any types
interface Report {
  id: string
  title: string
  description: string
  category: 'berlubang' | 'retak' | 'lainnya'
  userId: string
  createdAt: Date
  updatedAt: Date
}

// Function types
const handleSubmit = (data: ReportFormData): void => {
  // Implementation
}

// Component props
interface ReportCardProps {
  report: Report
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  className?: string
}
```

### Naming Conventions

```typescript
// Components: PascalCase
export const ReportCard = () => {}
export const CreateReportForm = () => {}

// Functions: camelCase with descriptive verbs
const handleSubmit = () => {}
const validateEmail = () => {}
const fetchReports = () => {}

// Constants: UPPER_SNAKE_CASE
const API_ENDPOINTS = {
  REPORTS: '/api/reports',
  AUTH: '/api/auth',
}

// Files: kebab-case
// report-card.tsx
// create-report-form.tsx
// use-reports.ts
```

### Import Organization

```typescript
// 1. React and Next.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// 2. External libraries
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

// 3. UI components
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'

// 4. Internal components
import { ReportCard } from '@/components/reports/ReportCard'

// 5. Hooks
import { useReports } from '@/hooks/use-reports'

// 6. Utilities
import { formatDate } from '@/utils/date'
```

## Development Checklist

### For New Features

- [ ] Component follows proper TypeScript typing
- [ ] Uses shared UI components from packages/ui
- [ ] Implements proper error handling and loading states
- [ ] Follows responsive design principles
- [ ] Includes accessibility features (ARIA labels, keyboard navigation)
- [ ] Uses appropriate data fetching patterns (Server Components vs Client)
- [ ] Implements proper form validation
- [ ] Includes unit tests for business logic
- [ ] Follows naming conventions and import organization
- [ ] Uses Tailwind CSS for styling

### Code Review Checklist

- [ ] No business logic in UI components
- [ ] Proper separation of concerns
- [ ] TypeScript strict mode compliance
- [ ] Accessibility features implemented
- [ ] Responsive design considerations
- [ ] Error boundaries in place
- [ ] Loading states handled
- [ ] Performance optimizations applied
- [ ] Security considerations addressed
- [ ] Documentation is clear and complete

---

This guide should be treated as a living document and updated as new patterns and best practices emerge. Always refer to existing code for examples and maintain consistency across the codebase.
