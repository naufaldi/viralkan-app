# API Integration with TanStack Query - Architecture Plan

## Current State Analysis
- ✅ Backend API endpoints ready (reports.ts, api.ts)
- ✅ OpenAPI schemas defined with proper validation
- ✅ Mock data and custom hooks exist (useReportsFilter, useReportsStats)
- ❌ No real API integration yet
- ❌ No TanStack Query implementation

## API Files Analysis

### Current API Structure Issues:
**services/api.ts:**
- Functional approach with `apiRequest()` and `authenticatedApiRequest()`
- Functions: `createReport`, `getReports`, `getReport`, `getUserReports`
- Uses environment variable `NEXT_PUBLIC_API_URL`
- Has auth token handling

**lib/api-client.ts:**
- Class-based approach with `ApiClient` class
- Methods: `getReports`, `getEnrichedReports`, `getReportById`
- Also uses `NEXT_PUBLIC_API_URL`
- Has `post()` method for authenticated requests
- Different error handling approach

### Problems:
- **Duplication**: Both files have similar functionality but different patterns
- **Inconsistency**: Different error handling and request patterns
- **Maintenance**: Two different approaches to maintain
- **Confusion**: Developers might use wrong API file

## Recommended Architecture: Consolidate & Optimize

### Option 1: Consolidate into Single Service (RECOMMENDED)
**Implementation**: Merge both files into `services/reports.ts` with consistent patterns

**✅ Pros:**
- **Single Source of Truth**: One API service for all reports operations
- **Consistent Patterns**: Unified error handling and request methods
- **Better Maintainability**: One file to maintain and update
- **Type Safety**: Consistent TypeScript types from backend schemas
- **TanStack Query Ready**: Clean service functions for query hooks

**❌ Cons:**
- Need to refactor existing code that uses both files
- Migration effort required

### Option 2: Keep Both, Use api-client.ts as Primary
**Implementation**: Use `api-client.ts` for new features, deprecate `api.ts`

**✅ Pros:**
- Less refactoring needed
- Class-based approach is more extensible

**❌ Cons:**
- Still have two files to maintain
- Confusion about which to use
- Inconsistent patterns

## Implementation Plan

### Phase 1: Consolidate API Services ✅ COMPLETED
- [x] **Create unified `services/reports.ts`**:
  - ✅ Merge functionality from both `api.ts` and `api-client.ts`
  - ✅ Use consistent error handling and request patterns
  - ✅ Keep all functions in one place
  - ✅ Add proper TypeScript types from backend schemas

- [x] **API Service Functions**:
  ```typescript
  // services/reports.ts
  export const reportsService = {
    // Main reports list with pagination/filters
    getReports: (params: ReportQueryParams) => Promise<PaginatedReports>,
    
    // Statistics for hero section
    getReportsStats: () => Promise<ReportsStats>,
    
    // Individual report details
    getReportById: (id: number) => Promise<ReportWithUser>,
    
    // Create new report (authenticated)
    createReport: (data: CreateReportInput, token: string) => Promise<{ id: number }>,
    
    // User's reports (authenticated)
    getUserReports: (token: string, params?: PaginationParams) => Promise<PaginatedReports>,
  }
  ```

- [x] **Backward Compatibility**:
  - ✅ Updated `lib/api-client.ts` to use unified service internally
  - ✅ Marked `services/api.ts` as deprecated with warnings
  - ✅ Existing code (like `upload.ts`) continues to work
  - ✅ No breaking changes introduced

### Phase 2: Setup TanStack Query for Next.js App Router
- [ ] **Install dependencies**:
  ```bash
  npm install @tanstack/react-query @tanstack/react-query-devtools
  ```

- [ ] **Create `lib/providers.tsx`** (QueryClientProvider setup):
  ```typescript
  'use client'
  
  import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
  import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
  
  function makeQueryClient() {
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000, // 1 minute
          retry: 2,
        },
      },
    })
  }
  
  let browserQueryClient: QueryClient | undefined = undefined
  
  function getQueryClient() {
    if (typeof window === 'undefined') {
      return makeQueryClient()
    } else {
      if (!browserQueryClient) browserQueryClient = makeQueryClient()
      return browserQueryClient
    }
  }
  
  export function Providers({ children }: { children: React.ReactNode }) {
    const queryClient = getQueryClient()
    
    return (
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    )
  }
  ```

- [ ] **Update `app/layout.tsx`** to include Providers:
  ```typescript
  import { Providers } from '@/lib/providers'
  
  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="en">
        <body>
          <Providers>{children}</Providers>
        </body>
      </html>
    )
  }
  ```

### Phase 3: Create TanStack Query Hooks
- [ ] **Create `hooks/reports/use-reports.ts`**:
  ```typescript
  import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
  import { reportsService } from '@/services/reports'
  
  // Main reports query with pagination and filters
  export const useReports = (params: ReportQueryParams) => {
    return useQuery({
      queryKey: ['reports', params],
      queryFn: () => reportsService.getReports(params),
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  }
  
  // Statistics query for hero section
  export const useReportsStats = () => {
    return useQuery({
      queryKey: ['reports-stats'],
      queryFn: () => reportsService.getReportsStats(),
      staleTime: 10 * 60 * 1000, // 10 minutes
    })
  }
  
  // Individual report query
  export const useReport = (id: number) => {
    return useQuery({
      queryKey: ['report', id],
      queryFn: () => reportsService.getReportById(id),
      enabled: !!id,
    })
  }
  
  // Create report mutation
  export const useCreateReport = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
      mutationFn: ({ data, token }: { data: CreateReportInput; token: string }) =>
        reportsService.createReport(data, token),
      onSuccess: () => {
        // Invalidate and refetch reports
        queryClient.invalidateQueries({ queryKey: ['reports'] })
        queryClient.invalidateQueries({ queryKey: ['reports-stats'] })
      },
    })
  }
  ```

### Phase 4: Update Page Component
- [ ] **Update `app/laporan/page.tsx`**:
  ```typescript
  'use client'
  
  import { useReports, useReportsStats } from '@/hooks/use-reports'
  
  export default function LaporanPage() {
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedCategory, setSelectedCategory] = useState<string>('')
    const [searchQuery, setSearchQuery] = useState('')
    
    // TanStack Query hooks
    const { data: reports, isLoading, error } = useReports({
      page: currentPage,
      limit: 20,
      category: selectedCategory || undefined,
      search: searchQuery || undefined,
    })
    
    const { data: stats } = useReportsStats()
    
    // Handle loading and error states
    if (error) {
      return <ErrorBoundary error={error} />
    }
    
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="relative">
          <ReportsHero
            stats={stats}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          
          <ReportsFilterSection
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
            onCategoryChange={setSelectedCategory}
            onSearchChange={setSearchQuery}
          />
          
          <section className="py-12">
            <div className="container mx-auto px-4">
              <ReportsGrid
                reports={reports?.items || []}
                isLoading={isLoading}
                onReportClick={handleReportClick}
              />
              
              {reports && reports.pages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={reports.pages}
                  onPageChange={setCurrentPage}
                />
              )}
            </div>
          </section>
        </main>
      </div>
    )
  }
  ```

### Phase 5: Add Loading States & Error Handling
- [ ] **Create loading skeletons** for better UX
- [ ] **Add error boundaries** with user-friendly messages
- [ ] **Implement retry logic** for failed requests
- [ ] **Add optimistic updates** for better perceived performance

## Benefits of This Approach

### Performance Benefits:
- **Efficient Caching**: TanStack Query handles caching automatically
- **Background Updates**: Data stays fresh without blocking UI
- **Optimistic Updates**: Instant UI feedback for mutations
- **Deduplication**: Prevents duplicate API calls
- **SSR Ready**: Can prefetch data on server for faster initial load

### Developer Experience:
- **Type Safety**: Full TypeScript support with backend schemas
- **Centralized Error Handling**: Consistent error management
- **Easy Testing**: Simple to mock and test data flows
- **DevTools**: Built-in debugging with React Query DevTools
- **Consistent Patterns**: One way to handle all API calls

### User Experience:
- **Fast Loading**: Cached data loads instantly
- **Consistent States**: Unified loading and error states
- **Offline Support**: Can work with cached data
- **Real-time Updates**: Background refetching keeps data fresh
- **Smooth Interactions**: No loading flickers with proper caching

## Migration Strategy

### Step 1: Setup TanStack Query
- [ ] Install dependencies
- [ ] Create Providers component
- [ ] Update app layout
- [ ] Test basic setup

### Step 2: Consolidate API Services
- [ ] Create unified `services/reports.ts`
- [ ] Migrate existing functions
- [ ] Update imports in existing code
- [ ] Test all API endpoints

### Step 3: Create Query Hooks
- [ ] Implement `useReports`, `useReportsStats`, `useReport`
- [ ] Add `useCreateReport` mutation
- [ ] Test loading and error states
- [ ] Add proper TypeScript types

### Step 4: Update Page Component
- [ ] Replace mock data with TanStack Query hooks
- [ ] Maintain existing filter functionality
- [ ] Add proper loading states
- [ ] Test pagination and filtering

### Step 5: Polish & Optimize
- [ ] Add loading skeletons
- [ ] Implement error boundaries
- [ ] Add retry logic
- [ ] Test performance and UX

## Success Metrics:
- Page loads in under 2 seconds with cached data
- Smooth pagination and filtering
- Consistent loading states across components
- Proper error handling with user-friendly messages
- Efficient caching reduces API calls by 80%
- Type-safe API integration with backend schemas