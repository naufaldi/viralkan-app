# Viralkan Frontend Implementation Plan

## Road Damage Reporting Platform - MVP Web Interface

---

## �� **Project Overview & Strategy**

Building a **civic-focused road damage reporting platform** with **UI-FIRST approach** for fast iteration and user flow validation.

**Current Status:**

- **✅ Backend API**: Fully implemented with all endpoints ready
- **✅ UI Components**: 25+ shadcn/ui components installed
- **✅ Framework**: Next.js 15, Tailwind CSS v4, TypeScript, Bun configured
- **✅ Database**: PostgreSQL + PostGIS schema ready

**Strategy Decision: UI-First Development**

- Build complete user interface with mock data first
- Validate user flow and design before integration complexity
- Enable stakeholder feedback on working prototype immediately
- Faster iteration on UX/UI decisions without backend concerns

---

## 🎯 **Phase 1: UI & User Flow Creation (Priority 1)**

**Goal:** Build complete clickable prototype with mock data
**Duration:** Week 1 (8-10 hours)
**Result:** Working user journey for stakeholder feedback

### **Task 1.1: Landing Page & Navigation Structure**

**Status:** ✅ Completed
**Dependencies:** None
**Estimated:** 2 hours

**Objective:** Create welcoming landing page that clearly explains Viralkan's purpose and guides users to key actions.

**Requirements:**

- Hero section explaining road damage reporting
- Clear call-to-action buttons (View Reports, Create Report)
- Navigation header with logo and menu
- Footer with basic information
- Mobile-responsive design

**Files to Create:**

- [ ] Replace `apps/web/app/page.tsx` with landing page
- [ ] `apps/web/components/layout/header.tsx` - Site navigation
- [ ] `apps/web/components/layout/footer.tsx` - Site footer
- [ ] `apps/web/components/layout/nav-menu.tsx` - Navigation menu

**Mock Data Needed:**

- Static hero content
- Navigation menu items
- Footer links

**Success Criteria:**

- ✅ Landing page loads and looks professional
- ✅ Navigation works between pages
- ✅ Mobile responsive
- ✅ Clear user action paths

**Completed Implementation:**
- Complete landing page redesign with Streamline-inspired design
- Fixed government claims - now clearly community-focused
- Hero section with proper messaging
- Statistics showing community impact
- How it works section explaining viral approach
- Community testimonials section
- Professional footer with proper links

### **Task 1.2: Public Reports List Page (Mock Data)**

**Status:** 🔴 Not Started (NEXT PRIORITY)
**Dependencies:** Task 1.1 ✅
**Estimated:** 3 hours

**Objective:** Create engaging reports listing that shows the platform's value with realistic mock data.

**Requirements:**

- Grid/table view of road damage reports
- Filtering by category (berlubang, retak, lainnya)
- Pagination controls
- Search functionality (UI only)
- Report cards showing images, location, date
- "Login to create report" prompts for anonymous users

**Updated Requirements based on API Schema Analysis:**

**API Schema Integration:**
- Use `ReportWithUserResponseSchema` for individual reports
- Use `PaginatedReportsResponseSchema` for listing
- Categories: "berlubang", "retak", "lainnya"
- Include user information (name, avatar) from joined data

**Files to Create:**

- [ ] `apps/web/app/laporan/page.tsx` - Reports listing page (renamed from /reports)
- [ ] `apps/web/components/reports/reports-grid.tsx` - Grid layout
- [ ] `apps/web/components/reports/report-card.tsx` - Individual report display
- [ ] `apps/web/components/reports/report-filters.tsx` - Category/search filters
- [ ] `apps/web/components/ui/pagination.tsx` - Page navigation
- [ ] `apps/web/lib/mock-data.ts` - Sample reports data matching API schema
- [ ] Update navigation header to include "Laporan" menu item

**Mock Data Structure (Based on API Schema):**

```typescript
// ReportWithUserResponseSchema format
{
  id: number,
  user_id: number,
  image_url: string,
  category: "berlubang" | "retak" | "lainnya",
  street_name: string,
  location_text: string,
  lat: number | null,
  lon: number | null,
  created_at: string, // ISO datetime
  user_name: string | null,
  user_avatar: string | null
}
```

- 20-30 sample reports with realistic Indonesian addresses
- Mix of categories (berlubang, retak, lainnya)
- Sample images (placeholder images)
- Realistic dates in ISO format
- User information included

**Success Criteria:**

- Reports display in attractive grid/list format
- Filtering works with mock data
- Pagination functions properly
- Responsive design works on mobile
- Clear path to login for creating reports

### **Task 1.3: Mock Login & User States**

**Status:** 🔴 Not Started
**Dependencies:** Task 1.2
**Estimated:** 2 hours

**Objective:** Create login interface and simulate authenticated vs unauthenticated states for testing user flow.

**Requirements:**

- Login page with Google OAuth button (UI only)
- Fake authentication using localStorage
- Show different navigation for logged in users
- Logout functionality (removes localStorage)
- Protected route behavior simulation

**Files to Create:**

- [ ] `apps/web/app/login/page.tsx` - Login page
- [ ] `apps/web/components/auth/login-form.tsx` - Login UI
- [ ] `apps/web/lib/mock-auth.ts` - Fake auth using localStorage
- [ ] `apps/web/components/auth/auth-guard.tsx` - Route protection simulation
- [ ] `apps/web/hooks/use-mock-auth.ts` - Mock authentication hook

**Mock Authentication Logic:**

- Store fake user data in localStorage
- Toggle between authenticated/unauthenticated states
- Simulate user profile data
- Mock user permissions

**Success Criteria:**

- Login page accessible and professional
- Can "fake login" and see authenticated state
- Navigation changes based on auth state
- Logout works and returns to unauthenticated state
- Protected pages redirect to login when not authenticated

### **Task 1.4: User Dashboard (Mock Data)**

**Status:** 🔴 Not Started
**Dependencies:** Task 1.3
**Estimated:** 2 hours

**Objective:** Create user dashboard showing personal statistics and recent reports with mock data.

**Requirements:**

- Welcome message with user name
- Statistics cards (total reports, this month, resolved)
- Recent reports list
- Quick action buttons
- User profile information
- Dashboard navigation menu

**Files to Create:**

- [ ] `apps/web/app/dashboard/page.tsx` - Main dashboard
- [ ] `apps/web/app/dashboard/layout.tsx` - Dashboard layout with nav
- [ ] `apps/web/components/dashboard/stats-cards.tsx` - Statistics display
- [ ] `apps/web/components/dashboard/recent-reports.tsx` - User's recent reports
- [ ] `apps/web/components/dashboard/quick-actions.tsx` - Action buttons
- [ ] `apps/web/components/layout/dashboard-nav.tsx` - Dashboard navigation

**Mock Data Needed:**

- User profile information
- Personal statistics
- User's recent reports
- Dashboard navigation items

**Success Criteria:**

- Dashboard loads quickly and looks professional
- Statistics cards show meaningful data
- Recent reports display correctly
- Navigation between dashboard sections works
- Quick actions are clearly visible

### **Task 1.5: Create Report Form (UI Only)**

**Status:** 🔴 Not Started
**Dependencies:** Task 1.4
**Estimated:** 3 hours

**Objective:** Build complete report creation flow focusing on user experience and form validation.

**Requirements:**

- Multi-step form (image upload, details, location, review)
- Image upload with preview (store in localStorage temporarily)
- Category selection with descriptions
- Location input field
- Form validation and error messages
- Success page after submission
- Form saves progress in localStorage

**Files to Create:**

- [ ] `apps/web/app/reports/create/page.tsx` - Create report page
- [ ] `apps/web/components/reports/create-report-form.tsx` - Main form component
- [ ] `apps/web/components/forms/image-upload-section.tsx` - Image upload UI
- [ ] `apps/web/components/forms/report-details-section.tsx` - Details form
- [ ] `apps/web/components/forms/location-section.tsx` - Location input
- [ ] `apps/web/components/forms/review-section.tsx` - Review before submit
- [ ] `apps/web/app/reports/create/success/page.tsx` - Success confirmation
- [ ] `apps/web/lib/form-storage.ts` - localStorage form persistence

**Form Sections:**

1. Image upload with preview
2. Category selection (berlubang, retak, lainnya)
3. Location details (street name, description)
4. Additional details and description
5. Review all information
6. Submit confirmation

**Success Criteria:**

- Form flows smoothly through all steps
- Image preview works properly
- Form validation provides clear feedback
- Progress saves in localStorage
- Success page confirms submission
- Can navigate back to edit information

### **Task 1.6: Report Detail Pages (Mock Data)**

**Status:** 🔴 Not Started
**Dependencies:** Task 1.5
**Estimated:** 2 hours

**Objective:** Create detailed view of individual reports showing all information clearly.

**Requirements:**

- Full report information display
- Image gallery with zoom capability
- Location information
- Report metadata (date, category, status)
- Related reports suggestions
- Action buttons for report owner
- Comments section placeholder

**Files to Create:**

- [ ] `apps/web/app/reports/[id]/page.tsx` - Report detail page
- [ ] `apps/web/components/reports/report-detail-view.tsx` - Main detail component
- [ ] `apps/web/components/reports/report-image-gallery.tsx` - Image display
- [ ] `apps/web/components/reports/report-metadata.tsx` - Report information
- [ ] `apps/web/components/reports/related-reports.tsx` - Suggestions
- [ ] `apps/web/components/ui/image-viewer.tsx` - Image zoom modal

**Display Elements:**

- High-quality image display
- Complete report information
- Location details
- Timestamp and status
- User information (if public)
- Suggested related reports

**Success Criteria:**

- Report details display clearly
- Images load and zoom properly
- All metadata is visible
- Related reports show relevant suggestions
- Page is mobile-friendly
- Clear navigation back to reports list

---

## 🎯 **Phase 2: Data Integration (Priority 2)**

**Goal:** Connect UI to real backend API
**Duration:** Week 2 (6-8 hours)
**Result:** Working app with real data

### **Task 2.1: API Client Setup**

**Status:** 🔴 Not Started
**Dependencies:** Phase 1 Complete
**Estimated:** 2 hours

**Objective:** Create API client to communicate with existing Hono backend.

**Requirements:**

- API client class with all endpoint methods
- Error handling and response typing
- Environment configuration
- Request/response interceptors

**Files to Create:**

- [ ] `apps/web/lib/api-client.ts` - Main API client
- [ ] `apps/web/types/api-types.ts` - API response types
- [ ] `apps/web/lib/api-endpoints.ts` - Endpoint constants
- [ ] `apps/web/.env.local` - Environment variables

**API Endpoints to Integrate:**

- `GET /api/reports` - List reports
- `GET /api/reports/:id` - Get report details
- `POST /api/reports` - Create report
- `GET /api/reports/me` - User's reports

### **Task 2.2: Replace Mock Data with Real API**

**Status:** 🔴 Not Started
**Dependencies:** Task 2.1
**Estimated:** 3 hours

**Objective:** Replace all mock data calls with real API integration.

**Requirements:**

- Update reports list to fetch real data
- Add loading states during API calls
- Handle API errors gracefully
- Update pagination to work with API
- Cache frequently accessed data

**Files to Update:**

- [ ] Reports listing components
- [ ] Dashboard statistics
- [ ] Report detail pages
- [ ] Search and filtering

### **Task 2.3: Form Submission Integration**

**Status:** 🔴 Not Started
**Dependencies:** Task 2.2
**Estimated:** 3 hours

**Objective:** Connect create report form to real backend submission.

**Requirements:**

- Image upload to backend/cloud storage
- Form validation with backend rules
- Handle submission errors
- Success confirmation with real report ID
- Progress tracking during upload

**Files to Update:**

- [ ] Create report form components
- [ ] Image upload functionality
- [ ] Form validation logic
- [ ] Success page with real data

---

## 🎯 **Phase 3: Authentication Integration (Priority 3)**

**Goal:** Add real Firebase authentication
**Duration:** Week 3 (6-8 hours)
**Result:** Secure user authentication

### **Task 3.1: Firebase Client Setup**

**Status:** 🔴 Not Started
**Dependencies:** Phase 2 Complete
**Estimated:** 2 hours

**Objective:** Configure Firebase client for Google OAuth authentication.

**Requirements:**

- Firebase project configuration
- Google OAuth provider setup
- Environment variables
- Auth state management

**Files to Create:**

- [ ] `apps/web/lib/firebase-config.ts` - Firebase setup
- [ ] `apps/web/contexts/auth-context.tsx` - Auth state management
- [ ] `apps/web/hooks/use-auth.ts` - Authentication hook

### **Task 3.2: Replace Mock Auth with Firebase**

**Status:** 🔴 Not Started
**Dependencies:** Task 3.1
**Estimated:** 3 hours

**Objective:** Replace localStorage mock auth with real Firebase authentication.

**Requirements:**

- Update login flow to use Firebase
- Replace mock user data with real Firebase user
- Update auth guards for real authentication
- Handle authentication errors

**Files to Update:**

- [ ] Login page components
- [ ] Auth guard components
- [ ] User profile display
- [ ] Protected route logic

### **Task 3.3: Backend Auth Integration**

**Status:** 🔴 Not Started
**Dependencies:** Task 3.2
**Estimated:** 3 hours

**Objective:** Connect frontend auth with backend API authentication.

**Requirements:**

- Send Firebase tokens to backend
- Handle token refresh
- Update API client with auth headers
- Handle authentication failures

**Files to Update:**

- [ ] API client authentication
- [ ] Token management
- [ ] Protected API calls
- [ ] Logout flow

---

## 🎯 **Phase 4: Polish & Error Handling (Priority 4)**

**Goal:** Production-ready user experience
**Duration:** Week 4 (6-8 hours)
**Result:** Polished, error-free application

### **Task 4.1: Error Handling & Loading States**

**Status:** 🔴 Not Started
**Dependencies:** Phase 3 Complete
**Estimated:** 3 hours

**Objective:** Add comprehensive error handling and loading states throughout the application.

**Requirements:**

- Global error boundary
- API error handling
- Loading spinners and skeletons
- User-friendly error messages
- Retry mechanisms

**Files to Create:**

- [ ] `apps/web/components/ui/error-boundary.tsx`
- [ ] `apps/web/components/ui/loading-states.tsx`
- [ ] `apps/web/components/ui/error-messages.tsx`
- [ ] `apps/web/app/error.tsx`
- [ ] `apps/web/app/loading.tsx`

### **Task 4.2: Mobile Optimization**

**Status:** 🔴 Not Started
**Dependencies:** Task 4.1
**Estimated:** 3 hours

**Objective:** Optimize entire application for mobile devices.

**Requirements:**

- Mobile navigation menu
- Touch-friendly interactions
- Responsive image handling
- Mobile form optimization
- Performance optimization

**Files to Update:**

- [ ] All layout components
- [ ] Navigation components
- [ ] Form components
- [ ] Image components

### **Task 4.3: Final Testing & Bug Fixes**

**Status:** 🔴 Not Started
**Dependencies:** Task 4.2
**Estimated:** 2 hours

**Objective:** Test complete user flows and fix any remaining issues.

**Requirements:**

- Test all user journeys
- Fix responsive design issues
- Verify all links and navigation
- Test error scenarios
- Performance optimization

**Testing Checklist:**

- [ ] Anonymous user can browse reports
- [ ] User can login with Google
- [ ] User can create reports with images
- [ ] User can view their dashboard
- [ ] All pages work on mobile
- [ ] Error states work properly

---

## 📦 **Dependencies & Setup**

### **Required Package Installations:**

```bash
# Additional packages needed
cd apps/web
bun add react-hook-form @hookform/resolvers zod
bun add @tanstack/react-query @tanstack/react-query-devtools
bun add sonner  # Toast notifications
```

### **Environment Variables:**

```bash
# apps/web/.env.local
NEXT_PUBLIC_FIREBASE_API_KEY=""
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=""
NEXT_PUBLIC_FIREBASE_PROJECT_ID=""
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

---

## 🚀 **Development Strategy & Timeline**

### **Week 1: UI-First Prototype**

- Build complete user interface with mock data
- Focus on user experience and flow
- Get stakeholder feedback on design
- No backend integration complexity

### **Week 2: Data Integration**

- Connect UI to real backend API
- Replace mock data with live data
- Add proper loading and error states
- Test with real data scenarios

### **Week 3: Authentication**

- Add Firebase authentication
- Secure protected routes
- Connect user accounts to backend
- Test authentication flows

### **Week 4: Polish & Deploy**

- Error handling and edge cases
- Mobile optimization
- Performance improvements
- Final testing and deployment

---

## ✅ **Success Metrics**

### **Phase 1 Success (UI-First):**

- [ ] Complete user journey clickable in browser
- [ ] Stakeholders can provide feedback on design
- [ ] All major pages and flows implemented
- [ ] Mobile-responsive design verified

### **Phase 2 Success (Data Integration):**

- [ ] Real data displays in all components
- [ ] API calls work reliably
- [ ] Loading states provide good UX
- [ ] Error handling works properly

### **Phase 3 Success (Authentication):**

- [ ] Users can login with Google
- [ ] Protected routes work securely
- [ ] User sessions persist properly
- [ ] Backend recognizes authenticated users

### **Phase 4 Success (Production Ready):**

- [ ] No bugs in major user flows
- [ ] Mobile experience is excellent
- [ ] Error messages are user-friendly
- [ ] Performance is acceptable on slow connections

---

## 🎯 **Core Development Philosophy**

**UI-First Benefits:**

1. **Fast Feedback Loop** - See results immediately
2. **Design Validation** - Test UX before technical complexity
3. **Stakeholder Engagement** - Demos work from Day 1
4. **Reduced Risk** - Validate user flow before integration
5. **Parallel Development** - UI and backend can be refined simultaneously

**This approach ensures:**

- Faster time to working prototype
- Better user experience through iteration
- Lower risk of rework
- Clear separation of concerns
- Ability to demo progress weekly

**Key Principle:** Build what users will see and use first, then make it work with real data and authentication.
