# Viralkan App Development TODO

## 🚀 NEW PLAN: Server-Side Stats Generation for /laporan Page

### Problem Analysis:
- ❌ No `/api/reports/stats` endpoint exists in the API
- ✅ We have `/api/reports/` endpoint that returns all reports with pagination
- ✅ Reports data contains all information needed to calculate stats
- ✅ `/laporan` page is public and needs SEO optimization (server-side rendering)

### Solution: Generate Stats from Reports Data Using Next.js Server Components

Instead of creating a new API endpoint, we'll process the reports data server-side in Next.js to generate statistics. This approach is:

1. **More Efficient**: No additional API calls or database queries
2. **SEO Friendly**: Server-side processing for public page 
3. **Real-time**: Stats always reflect current data
4. **Simple**: Reuses existing working API endpoint

---

## Implementation Plan

### Phase 1: Server-Side Stats Processing ⚡ (HIGH PRIORITY)

#### Task 1.1: Create Stats Processing Utility Function
- [ ] **Create `apps/web/utils/stats-utils.ts`**
  - [ ] `calculateStatsFromReports(reports: ReportWithUser[]): StatsData`
  - [ ] Calculate total reports count
  - [ ] Calculate reports by category (berlubang, retak, lainnya)
  - [ ] Calculate recent reports (this week, today)
  - [ ] Use date-fns or similar for date calculations
  - [ ] Add proper TypeScript types

```typescript
interface StatsData {
  totalReports: number;
  thisWeek: number;
  today: number;
  byCategory: {
    berlubang: number;
    retak: number;
    lainnya: number;
  };
}

// Example calculation logic:
function calculateStatsFromReports(reports: ReportWithUser[]): StatsData {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  return {
    totalReports: reports.length,
    thisWeek: reports.filter(r => new Date(r.created_at) >= weekAgo).length,
    today: reports.filter(r => new Date(r.created_at) >= todayStart).length,
    byCategory: {
      berlubang: reports.filter(r => r.category === 'berlubang').length,
      retak: reports.filter(r => r.category === 'retak').length,
      lainnya: reports.filter(r => r.category === 'lainnya').length,
    }
  };
}
```

#### Task 1.2: Enhance getPublicReportsAction for Stats
- [ ] **Modify `/laporan` page data fetching**
  - [ ] Fetch larger dataset when generating stats (e.g., limit=1000)
  - [ ] Add optional `includeStats: boolean` parameter
  - [ ] When `includeStats=true`, fetch more data for accurate stats
  - [ ] Return both paginated reports AND calculated stats
  - [ ] Cache results for performance

```typescript
// Enhanced server action approach:
export async function getPublicReportsWithStats(
  queryParams: URLSearchParams,
  includeStats = false
) {
  // Fetch paginated reports for display
  const displayReports = await getPublicReportsAction(queryParams);
  
  if (!includeStats) {
    return { reports: displayReports, stats: null };
  }
  
  // Fetch larger dataset for stats calculation (no pagination)
  const statsParams = new URLSearchParams();
  statsParams.set("limit", "1000"); // Get more data for accurate stats
  const allReports = await getPublicReportsAction(statsParams);
  
  // Calculate stats from all reports
  const stats = calculateStatsFromReports(allReports.items || []);
  
  return { reports: displayReports, stats };
}
```

#### Task 1.3: Update /laporan Page Implementation
- [ ] **Modify `apps/web/app/laporan/page.tsx`**
  - [ ] Remove broken stats API call completely
  - [ ] Use enhanced `getPublicReportsWithStats()` function
  - [ ] Process stats server-side before rendering
  - [ ] Keep server component architecture for SEO
  - [ ] Handle loading and error states properly

```typescript
// Updated laporan page approach:
export default async function LaporanPage({ searchParams }: LaporanPageProps) {
  const params = await searchParams;
  // ... existing param processing ...
  
  try {
    // Fetch both reports and stats in one optimized call
    const { reports, stats } = await getPublicReportsWithStats(queryParams, true);
    
    // Stats are now calculated server-side from real data
    const transformedStats = stats || defaultStats;
    
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="relative">
          <ReportsHero stats={transformedStats} searchQuery={searchQuery} />
          <LaporanClientWrapper 
            initialReports={reports}
            currentPage={currentPage}
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
          />
        </main>
      </div>
    );
  } catch (error) {
    // ... error handling ...
  }
}
```

---

### Phase 2: Performance Optimization 🚀 (MEDIUM PRIORITY)

#### Task 2.1: Implement Smart Caching
- [ ] **Add Next.js caching for stats**
  - [ ] Cache stats calculation results for 5-10 minutes
  - [ ] Use Next.js `unstable_cache` or similar
  - [ ] Invalidate cache when new reports are created
  - [ ] Balance freshness vs performance

```typescript
import { unstable_cache } from 'next/cache';

const getCachedStats = unstable_cache(
  async () => {
    const allReports = await getPublicReportsAction(/* large limit */);
    return calculateStatsFromReports(allReports.items || []);
  },
  ['public-reports-stats'],
  { revalidate: 300 } // Cache for 5 minutes
);
```

#### Task 2.2: Optimize Database Queries
- [ ] **Consider API-level optimization (Future)**
  - [ ] Add `GET /api/reports/summary` endpoint for efficient stats
  - [ ] Use SQL aggregation instead of fetching all records
  - [ ] Return count queries only (no full report data)
  - [ ] This is optional - client-side processing works fine for now

---

### Phase 3: Type Safety & Error Handling 🛡️ (MEDIUM PRIORITY)

#### Task 3.1: Fix Type Mismatches
- [ ] **Update component types**
  - [ ] Ensure `LaporanClientWrapper` uses correct API types
  - [ ] Match types with actual API response structure
  - [ ] Remove mock/placeholder types
  - [ ] Add proper error boundary types

#### Task 3.2: Enhance Error Handling
- [ ] **Robust error states**
  - [ ] Handle stats calculation failures gracefully
  - [ ] Show default/fallback stats when calculation fails
  - [ ] Add retry mechanism for failed API calls
  - [ ] Proper error logging for debugging

---

## Benefits of This Approach

### ✅ Technical Advantages:
1. **No New API Endpoint**: Reuses existing `/api/reports/` endpoint
2. **Better Performance**: Single API call instead of multiple
3. **SEO Optimized**: Server-side rendering for public page
4. **Real-time Stats**: Always reflects current data
5. **Type Safe**: Full TypeScript support throughout

### ✅ User Experience:
1. **Fast Loading**: Server-rendered content loads immediately
2. **Always Accurate**: Stats match visible reports
3. **No Loading States**: Stats available on first render
4. **Better SEO**: Search engines can index stats content

### ✅ Development Benefits:
1. **Less Complexity**: No new API routes to maintain
2. **Easier Testing**: Pure functions for stats calculation
3. **Better Caching**: Can cache at multiple levels
4. **Future Flexibility**: Easy to optimize later if needed

---

## Current Task Priority:

### 🚨 IMMEDIATE (Complete today):
1. ✅ **DONE**: Remove broken `getPublicReportsStatsAction()`
2. ✅ **DONE**: Fix server component function passing issue
3. [ ] **IN PROGRESS**: Create `calculateStatsFromReports()` utility
4. [ ] **PENDING**: Update `/laporan` page to use new stats approach
5. [ ] **PENDING**: Test and verify everything works

### 🚀 NEXT (This week):
6. [ ] Add performance caching
7. [ ] Optimize for large datasets
8. [ ] Add comprehensive error handling
9. [ ] Write tests for stats calculations

---

## Testing Checklist:

### ✅ Must Work:
- [ ] `/laporan` page loads without errors
- [ ] Stats display accurate numbers
- [ ] Server-side rendering works (view source shows content)
- [ ] Search and filtering work correctly
- [ ] Mobile responsive design
- [ ] No lint/TypeScript errors

### ✅ Performance Tests:
- [ ] Page loads in <2 seconds
- [ ] Stats calculation handles 1000+ reports
- [ ] Memory usage remains reasonable
- [ ] Caching works properly

---

## Files to Modify:

### ✅ Core Implementation:
- `apps/web/lib/stats-utils.ts` ← **NEW FILE** (stats calculation)
- `apps/web/app/laporan/page.tsx` ← **MODIFY** (use new stats approach)
- `apps/web/lib/auth-actions.ts` ← **ENHANCE** (add stats option)

### ✅ Type Safety:
- `apps/web/components/reports/laporan-client-wrapper.tsx` ← **VERIFY TYPES**
- `apps/web/components/reports/reports-hero.tsx` ← **VERIFY PROPS**

### ✅ Testing:
- Test stats calculation with various data sets
- Test error handling when API fails
- Test caching performance

---

**This approach gives us accurate, real-time stats without requiring any API changes, while maintaining excellent SEO and performance for the public `/laporan` page.**