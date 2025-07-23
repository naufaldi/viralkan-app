# Dashboard API Integration & Recent Reports Layout Analysis

## 🚨 CRITICAL BUG FIX: Server-Side Authentication (Following system-design.md)

### Problem Analysis:
**Error**: `Server Error fetching user reports: Error: Failed to fetch user reports`

**Root Cause Identified**:
- **Cookie Token Issue**: Firebase token not properly accessible in server actions
- **Timing Issue**: Server action might run before cookie is set
- **Token Validation**: Token might be expired or invalid

### ✅ **System Design Architecture Available**: system-design.md
The app already has a perfect 4-layer server-side authentication system:

```typescript
// Layer 1: Next.js Middleware (Fast Protection) ✅ Working
// Layer 2: Server Component Authentication ✅ Working  
// Layer 3: Server Actions Protection ❌ Needs Fix
// Layer 4: Client Context Integration ✅ Working
```

### Current Implementation Status:
✅ **Cookie Management**: `auth-cookies.ts` exists with proper functions
✅ **Client Auth**: `useAuth.ts` sets Firebase tokens in HTTP-only cookies
✅ **Server Actions**: `auth-actions.ts` reads tokens from cookies
✅ **API Endpoints**: `/api/reports/me` exists and works
❌ **Token Access**: Server actions can't read Firebase tokens properly

### Architecture Verification:
```typescript
// ✅ Client sets token in cookie (useAuth.ts:104-110)
const firebaseToken = await getIdToken();
if (firebaseToken) {
  await setAuthCookie(firebaseToken); // Sets HTTP-only cookie
}

// ✅ Server reads token from cookie (auth-actions.ts:95-96)
const cookieStore = await cookies();
const token = cookieStore.get("firebase-token")?.value;

// ❌ Issue: Token might be undefined, expired, or invalid
```

## Solution: Fix Server-Side Authentication (Keep system-design.md Architecture)

### Why Server-Side Auth is Better:
1. **✅ Follows Design**: Matches established system-design.md architecture
2. **✅ Server Rendered**: Better SEO and performance
3. **✅ Secure**: Server-side validation and protection
4. **✅ Consistent**: Same pattern as other server actions
5. **✅ Type Safe**: Full TypeScript support with proper types

### Implementation Plan:

#### Phase 1: ✅ FIXED - Server-Side Authentication & Upload System
- [x] **Identified Root Cause**: UUID format mismatch
  - [x] Database had `bigint` IDs but API expected UUID format
  - [x] User ID was `1` (integer) but API expected UUID string
  - [x] Created and ran UUID migration successfully

- [x] **Database Migration Completed**
  ```sql
  -- Successfully migrated from BIGSERIAL to UUID
  -- users.id: bigint → uuid
  -- reports.id: bigint → uuid  
  -- reports.user_id: bigint → uuid
  -- All foreign key relationships preserved
  -- All data migrated successfully
  ```

- [x] **Upload System Fixed**
  - [x] Created missing `uploads` table via `001_add_upload_system.sql`
  - [x] Added `image_key` field to `reports` table
  - [x] Upload API now has proper database support
  - [x] File uploads can be tracked and rate-limited

- [x] **Authentication Flow Fixed**
  - [x] Server actions now work with UUID user IDs
  - [x] API endpoints accept UUID format properly
  - [x] Dashboard loads without authentication errors
  - [x] User reports display correctly

**Result**: ✅ Dashboard and upload system now work perfectly with server-side authentication!

#### Phase 2: Enhance Server-Side Auth (Optional)
- [ ] **Add Token Validation**
  - [ ] Validate token format before API calls
  - [ ] Add token expiration checking
  - [ ] Implement automatic token refresh

- [ ] **Improve Error Recovery**
  - [ ] Add retry mechanism for failed requests
  - [ ] Implement graceful degradation
  - [ ] Add user-friendly error messages

#### Phase 3: Implement Table Layout (Keep Server-Side)
- [ ] **Keep Server Component Architecture**
  - [ ] Dashboard remains server component
  - [ ] Use server actions for data fetching
  - [ ] Implement client-side table with server data

- [ ] **Create Reports Table Component**
  - [ ] Define column schema: Date, Thumbnail, Title, Category, Status, Actions
  - [ ] Implement sorting with client-side JavaScript
  - [ ] Add responsive design for mobile

- [ ] **Integrate with Server Data**
  - [ ] Pass server-fetched data to client table component
  - [ ] Handle loading states with skeleton rows
  - [ ] Add empty state when no reports exist

### Benefits of This Approach:
1. **✅ Follows Design**: Matches established system-design.md architecture
2. **✅ Server Rendered**: Better SEO and performance
3. **✅ Secure**: Server-side validation and protection
4. **✅ Consistent**: Same pattern as other server actions
5. **✅ Type Safe**: Full TypeScript support with proper types

### Files to Modify:
- `apps/web/lib/auth-actions.ts` - Add debugging and better error handling
- `apps/web/hooks/useAuth.ts` - Ensure proper cookie setting
- `apps/web/app/dashboard/page.tsx` - Keep as server component
- `apps/web/components/dashboard/reports-table.tsx` - Client component for table

### What We Need to Fix:
1. **Cookie Token Access**: Ensure Firebase tokens are properly stored and read
2. **Token Validation**: Add proper token format and expiration checking
3. **Error Handling**: Better error messages and recovery mechanisms
4. **Timing Issues**: Handle cases where server action runs before cookie is set

### Testing Checklist:
- [ ] Dashboard loads without authentication errors
- [ ] User reports display correctly
- [ ] Loading states work properly
- [ ] Error states handle failures gracefully
- [ ] Table sorting and pagination work
- [ ] Mobile responsiveness maintained

## Current State Analysis

**Existing Implementation:**
- Dashboard currently shows redesigned UI with better spacing and typography
- Quick action cards are static/visual only - not connected to API
- Recent reports section uses gallery/grid layout (3 columns)
- Stats cards already integrated with API (`getUserStats()`)

## Task 1: API Integration for Cards

### Cards to Integrate:
- [ ] **"Buat Laporan Baru" Card**: Already linked to `/laporan/buat` route
- [ ] **"Lihat Laporan Anda" Card**: Already linked to `/laporan?filter=my-reports` 
- [ ] **Stats Cards**: ✅ Already integrated with `getUserStats()` API

**Assessment**: The cards are already functionally integrated. They navigate to correct routes and stats pull from API.

## Task 2: Recent Reports Layout Decision Analysis

### Current Implementation: Gallery/Grid Layout
```
┌─────────┬─────────┬─────────┐
│ Report 1│ Report 2│ Report 3│
│ [IMAGE] │ [IMAGE] │ [IMAGE] │
│ Title   │ Title   │ Title   │
│ Status  │ Status  │ Status  │
└─────────┴─────────┴─────────┘
```

## Layout Options Comparison

### Option 1: Table Layout
**Pros:**
- **Information density**: Can show more data per row (ID, date, category, status, location)
- **Scannable**: Easy to compare multiple reports side-by-side
- **Sortable**: Can add sorting by date, status, category
- **Compact**: Shows more reports in less vertical space
- **Professional**: Matches civic/government dashboard conventions
- **Mobile responsive**: Can stack/hide columns on smaller screens

**Cons:**
- **Less visual**: No prominent image display
- **Boring**: May feel less engaging than visual cards
- **Limited preview**: Harder to get quick visual context of damage
- **No thumbnail benefit**: Users can't quickly identify reports by image

### Option 2: Gallery/Grid Layout (Current)
**Pros:**
- **Visual appeal**: Images provide immediate context
- **Quick recognition**: Users can identify reports by damage photos
- **Modern UX**: Feels more like social media/modern apps
- **Engagement**: More likely to encourage interaction
- **Better for photos**: Showcases the core evidence (damage images)

**Cons:**
- **Space inefficient**: Takes more vertical scrolling
- **Limited information**: Can't show much metadata per card
- **Mobile issues**: May become too small on mobile devices
- **Loading heavy**: All images need to load simultaneously

### Option 3: List Layout (Hybrid)
**Pros:**
- **Balanced approach**: Shows image + detailed info in rows
- **Efficient**: More compact than gallery, more visual than table
- **Flexible**: Can show variable amounts of information
- **Mobile friendly**: Naturally responsive design

**Cons:**
- **Design complexity**: Harder to make visually consistent
- **Image sizing**: Challenging to balance image vs text space
- **Not specialized**: May not excel at either visual or data aspects

## Recommendation Analysis

### For Civic/Government Context:
**Table layout is recommended** for the following reasons:

1. **Government User Expectations**: Officials expect data-rich, scannable interfaces
2. **Efficiency**: Need to process many reports quickly
3. **Data Priority**: Status, date, location more important than visual appeal
4. **Professional Image**: Tables convey seriousness and professionalism
5. **Accessibility**: Screen readers handle tables better
6. **Performance**: No image loading delays

### For Citizen/Public Context:
**Gallery layout is recommended** for the following reasons:

1. **User Engagement**: Citizens more likely to browse visual content
2. **Recognition**: People remember their reports by the damage photo
3. **Motivation**: Seeing fixed roads provides positive reinforcement
4. **Modern Expectations**: Matches social media interaction patterns

## Implementation Recommendation

**Hybrid Approach - Context Aware:**

### For Dashboard "Recent Reports":
- Use **Table Layout** for efficiency and professionalism
- Show: Date, Title, Status, Category, Actions
- Add thumbnail column for visual reference
- Enable sorting and filtering

### For Public Reports Page:
- Keep **Gallery Layout** for public engagement
- Focus on visual storytelling
- Encourage community participation

## Implementation Plan

### Phase 1: Critical Bug Fix
- [ ] **Fix API Endpoint URL** in `auth-actions.ts`
  - [ ] Change `/api/me/reports` to `/api/reports/me` in `getUserReportsAction()`
  - [ ] Update comment to reflect correct endpoint
  - [ ] Test dashboard loads without errors
- [ ] **Verify API Integration**
  - [ ] Confirm stats cards API integration working
  - [ ] Test navigation from action cards
  - [ ] Ensure all routes function correctly

### Phase 2: Recent Reports Table Implementation with TanStack Table
- [ ] **Install dependencies**
  - [ ] Add `@tanstack/react-table` to web app
  - [ ] Verify shadcn table components available
  
- [ ] **Setup TanStack Table Structure**
  - [ ] Create table column definitions using TanStack Table API
  - [ ] Define column schema: Date, Thumbnail, Title, Category, Status, Location, Actions
  - [ ] Implement column sorting with TanStack Table hooks
  - [ ] Add column filtering capabilities
  
- [ ] **Implement shadcn Table Components**
  - [ ] Use shadcn `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell` components
  - [ ] Integrate with TanStack Table data and state management
  - [ ] Style table with monochrome civic design system
  - [ ] Add responsive design with column hiding/stacking on mobile
  
- [ ] **Table Features Implementation**
  - [ ] **Sorting**: Click column headers to sort by date, status, category
  - [ ] **Thumbnail column**: Small image preview (64x64px) with fallback
  - [ ] **Status badges**: Use existing monochrome badge system
  - [ ] **Actions column**: View Details, Edit Report (for user's own reports)
  - [ ] **Row hover states**: Subtle highlight matching design system
  
- [ ] **Data Integration**
  - [ ] Connect to existing `getUserReportsAction()` API
  - [ ] Handle loading states with skeleton rows
  - [ ] Implement error handling for failed requests
  - [ ] Add empty state when no reports exist
  
- [ ] **Mobile Responsiveness**
  - [ ] Test table on mobile devices (responsive columns)
  - [ ] Consider horizontal scroll or column stacking
  - [ ] Ensure touch-friendly action buttons

### Phase 3: Enhanced TanStack Table Features
- [ ] **Pagination with TanStack Table**
  - [ ] Implement `usePagination` hook from TanStack Table
  - [ ] Add pagination controls (previous, next, page numbers)
  - [ ] Set page size options (10, 25, 50 reports per page)
  - [ ] Show total results count
  
- [ ] **Advanced Filtering**
  - [ ] Implement `useFilters` hook for column-based filtering
  - [ ] Add status filter dropdown (pending, in-review, resolved)
  - [ ] Add category filter (berlubang, retak, lainnya)
  - [ ] Add date range filter for created_at
  - [ ] Global search across title and location
  
- [ ] **Performance Optimization**
  - [ ] Implement virtual scrolling for large datasets (if needed)
  - [ ] Add debounced search input
  - [ ] Optimize API calls with proper caching
  - [ ] Lazy load images in thumbnail column
  
- [ ] **Additional Features**
  - [ ] Export table data to CSV
  - [ ] Column visibility toggle
  - [ ] Column reordering (drag & drop)
  - [ ] Bulk actions (if needed for admin features)

## Final Recommendation: **Table Layout with TanStack Table**

**Technical Implementation:**
- **TanStack Table**: Powerful, headless table library with built-in sorting, filtering, pagination
- **shadcn Components**: Pre-styled `Table` components that match civic design system
- **Responsive Design**: Mobile-friendly with column hiding/stacking
- **Performance**: Virtual scrolling and lazy loading for large datasets

**Reasoning:**
1. **Context**: This is a dashboard for tracking contributions - data efficiency > visual appeal
2. **User Goal**: Monitor status and manage reports - not browse casually
3. **Civic Standards**: Government platforms prioritize information density
4. **Scalability**: Tables handle 10+ reports better than galleries
5. **Accessibility**: Better for screen readers and keyboard navigation
6. **TanStack Benefits**: Built-in sorting, filtering, pagination without reinventing the wheel

The gallery was good for the initial design, but a professional table interface powered by TanStack Table will better serve the dashboard's core purpose of efficient report management while providing advanced features out of the box.

---

## 🚨 CRITICAL ARCHITECTURE FIX: Data Fetching Strategy Mismatch

### Problem Analysis:
**Issue**: Dashboard doesn't auto-refresh after form submission due to incorrect data fetching patterns

**Current Wrong Architecture**:
- ❌ `/laporan` page (public) → Might be using client-side (should be server-side for SEO)
- ❌ `/dashboard` page (private) → Uses server-side caching (should be client-side for real-time updates)
- ❌ Form submission flow → Submit → redirect to dashboard → stale cached data shown

**Root Cause**: Mixing server-side and client-side patterns incorrectly based on use case

### ✅ Correct Architecture (Following system-design.md):

#### `/laporan` Page - Public Reports Listing
**Should Use: Server-Side Data Fetching**
- **Why**: SEO-friendly, fast initial load, public content needs to be indexed
- **Pattern**: Server components + server actions
- **Benefits**: Fast public access, search engine indexing, no authentication needed

#### `/dashboard` Page - Private User Dashboard  
**Should Use: Client-Side Data Fetching**
- **Why**: Real-time updates after form submissions, interactive, no SEO needed
- **Pattern**: Client components + React Query/SWR or useEffect
- **Benefits**: Auto-refresh on navigation, real-time data, better UX for authenticated users

#### Form Submission Flow
**Current Flow**: Submit form → redirect to dashboard → stale server-cached data
**Correct Flow**: Submit form → redirect to dashboard → fresh client-side data fetch

### Implementation Plan:

#### Phase 1: Fix Data Fetching Architecture
- [ ] **Audit Current Implementation**
  - [ ] Check `/laporan` page current data fetching method
  - [ ] Check `/dashboard` page current data fetching method  
  - [ ] Identify which pages use server vs client-side data fetching
  - [ ] Document current caching behavior

#### Phase 2: Convert `/laporan` to Server-Side (SEO Optimization)
- [ ] **Implement Server-Side Data Fetching for Public Reports**
  - [ ] Create `getPublicReportsAction()` server action
  - [ ] Convert `/laporan` page to server component
  - [ ] Add proper pagination with server-side logic
  - [ ] Implement filtering/search with URL search params
  - [ ] Ensure SEO-friendly URLs and meta tags
  - [ ] Test that public page loads fast without JavaScript

#### Phase 3: Convert `/dashboard` to Client-Side (Real-time Updates)
- [ ] **Implement Client-Side Data Fetching for Dashboard**
  - [ ] Replace server-side `getUserReportsAction()` with client-side hook
  - [ ] Create `useDashboardData()` hook with React Query or SWR
  - [ ] Add loading states and error handling
  - [ ] Implement automatic refetch on focus/visibility change
  - [ ] Add manual refresh capability
  - [ ] Ensure data refreshes when navigating back from form submission

#### Phase 4: Fix Form Submission Cache Invalidation
- [ ] **Ensure Dashboard Auto-Refresh After Form Submission**
  - [ ] Modify form submission to trigger dashboard data refresh
  - [ ] Add success callback that invalidates dashboard cache
  - [ ] Test: Submit form → redirect to dashboard → see new report immediately
  - [ ] Add optimistic updates if needed for better UX
  - [ ] Handle edge cases (network failures, slow API responses)

### Architecture Decision Matrix:

| Page | Current | Should Be | Reasoning |
|------|---------|-----------|-----------|
| `/laporan` (public) | ❓ Unknown | 🚀 Server-side | SEO, fast public access, no auth needed |
| `/dashboard` (private) | 🚀 Server-side | ⚡ Client-side | Real-time updates, interactive, no SEO needed |
| Form submission | ❌ No refresh | ✅ Auto refresh | Better UX after actions |

### Benefits After Fix:
1. **🔍 Better SEO**: Public reports indexed by search engines
2. **⚡ Real-time Dashboard**: Fresh data after form submissions
3. **🚀 Fast Public Access**: Server-rendered public content
4. **🎯 Better UX**: Interactive dashboard with live updates
5. **📱 Correct Patterns**: Server for public, client for private

### Files to Modify:
- `apps/web/app/laporan/page.tsx` - Convert to server component
- `apps/web/app/dashboard/page.tsx` - Convert to client component  
- `apps/web/lib/auth-actions.ts` - Keep server actions for laporan
- `apps/web/hooks/` - Create dashboard data hooks
- `apps/web/components/reports/create-report-form.tsx` - Add success callback

### Testing Checklist:
- [ ] Public `/laporan` page loads fast without JavaScript
- [ ] Public `/laporan` page has proper SEO meta tags
- [ ] Dashboard shows fresh data after form submission
- [ ] Dashboard has loading states and error handling
- [ ] Form submission → dashboard redirect → new report visible immediately
- [ ] Dashboard data refreshes when returning from other pages

**Priority**: 🚨 **HIGH** - This affects core user experience and SEO
