# Missing Features Analysis - Viralkan App

Based on RFC v1.0, PRD v0.3, and current codebase analysis.

## 📊 **Summary**

**Total Missing Features: 17+**
- **Critical (MVP V1)**: 5 features
- **V2 Smart Metadata**: 0 features (All implemented ✓)
- **V3 Map Visual**: 5 features
- **V4 Admin/Monitoring**: 6+ features
- **Infrastructure**: 3 features

---

## 🎯 **CRITICAL - MVP V1 Missing Features**

---

### 2. **PWA Configuration & Service Worker**
**RFC Section:** 12.3 PWA Configuration
**Priority:** HIGH
**Description:** Offline support and PWA capabilities
**Requirements:**
- Vite PWA plugin configuration
- Workbox runtime caching for API responses
- Service worker registration
- Manifest file
- Offline page (/offline)
**Files to Create:**
- `apps/web/vite.config.ts` (update if using Vite, or Next config for PWA)
- `apps/web/public/manifest.json`
- `apps/web/app/offline/page.tsx`
- `apps/web/components/pwa/pwa-install-prompt.tsx`

---

### 3. **404 Not Found Page**
**PRD Section:** Epic 5 - User Story 5.1
**Priority:** HIGH
**Description:** Handle invalid routes gracefully
**Requirements:**
- Custom 404 page with navigation
- Search functionality
- Links back to main sections
**Files to Create:**
- `apps/web/app/not-found.tsx` (Next.js 13+ app router)
- Update `next.config.js` to handle 404s

---

### 4. **500 Server Error Page**
**PRD Section:** Epic 5 - User Story 5.1
**Priority:** HIGH
**Description:** Handle server errors gracefully
**Requirements:**
- Custom 500 error page
- Retry button
- Contact information
**Files to Create:**
- `apps/web/app/error.tsx`
- Error boundary component

---

### 5. **User Statistics API Integration**
**PRD Section:** User Story 3.1 - View My Reports Dashboard
**Priority:** MEDIUM
**Description:** Dashboard statistics not displaying
**Current State:** Dashboard page exists, statistics not loading
**Requirements:**
- Implement GET /api/me/stats endpoint (if missing)
- Fix dashboard stats display
- Show: total reports, this month, by category
**Files to Create/Update:**
- Backend: `apps/api/src/routes/auth/api.ts` (add /me/stats)
- Frontend: `apps/web/components/dashboard/status-card.tsx`
- Frontend: `apps/web/hooks/dashboard/use-dashboard-stats.ts`

---

### 6. **Rate Limiting Middleware**
**RFC Section:** 12.1 Rate Limiting
**Priority:** HIGH
**Description:** Prevent abuse with request limits
**Requirements:**
- Implement rate limiting for:
  - REPORT_CREATION: 10 requests / 24h per user
  - IMAGE_UPLOAD: 20 requests / 1h per user
  - API_REQUESTS: 1000 requests / 1h per user
- Database table for rate limiting
**Files to Create:**
- `apps/api/src/middleware/rate-limit.ts`
- Database migration for rate_limits table

---


### 18. **Admin User Management**
**RFC Section:** 17.2 Admin API Endpoints
**Current State:** Admin endpoints exist
**Priority:** HIGH
**Description:** Verify admin can verify/reject reports
**Requirements:**
- Test all admin report actions
- Verify audit logging
- Ensure proper permissions
**Files to Test:**
- `apps/api/src/routes/admin/api.ts`
- `apps/web/components/admin/admin-reports-table.tsx`

---

### 19. **Admin Activity Logs**
**RFC Section:** 17 Admin System
**Current State:** Admin users page exists
**Priority:** MEDIUM
**Description:** Admin can view and manage users
**Requirements:**
- List all users
- View user report counts
- Deactivate/activate users if needed
**Files to Enhance:**
- `apps/web/app/admin/users/page.tsx`
- `apps/web/components/admin/admin-users-table.tsx`

---

### 20. **Admin Statistics Dashboard**
**RFC Section:** 17.2 Admin Activity Logging
**Priority:** LOW
**Description:** Track all admin actions for audit
**Requirements:**
- Log all admin report actions
- Display activity timeline
- Export logs
**Files to Create:**
- `apps/web/app/admin/activity/page.tsx`
- `apps/web/components/admin/admin-activity.tsx`
- Backend logging for admin actions

---

### 21. **Admin Report Bulk Actions**
**RFC Section:** 17.3 Admin Dashboard
**Current State:** Basic admin dashboard exists
**Priority:** MEDIUM
**Description:** Comprehensive admin statistics
**Requirements:**
- Total reports by status
- Verification rate and processing time
- Geographic distribution
- User activity metrics
**Files to Enhance:**
- `apps/web/app/admin/page.tsx`
- `apps/web/components/admin/admin-stats.tsx`

---

## 🎯 **Infrastructure & DevOps**

### 22. **Monitoring & Observability**
**RFC Section:** 17 Admin System
**Priority:** LOW
**Description:** Perform actions on multiple reports at once
**Requirements:**
- Bulk verify/reject reports
- Bulk delete (soft delete)
- Export selected reports
**Files to Create:**
- `apps/web/components/admin/bulk-actions-toolbar.tsx`
- Bulk action API endpoints

---

## 🎯 **V3 - Map Visualization Features**

### 13. **Leaflet Map Integration**
**RFC Section:** 3.3 User Flows (V3)
**Current State:** leaflet installed but not used
**Priority:** MEDIUM
**Description:** Display reports on interactive map
**Requirements:**
- Map view for public reports
- Marker clustering for performance
- Filter map by category/location
**Files to Create:**
- `apps/web/components/maps/reports-map.tsx`
- `apps/web/app/peta/page.tsx` (map view page)
- `apps/web/app/laporan/peta/page.tsx` (alternative route)

---

### 14. **Map Marker Clustering**
**RFC Section:** 3.3 User Flows (V3)
**Priority:** MEDIUM
**Description:** Cluster markers by zoom level
**Requirements:**
- Implement supercluster or leaflet marker cluster
- Zoom to cluster on click
- Show count of reports in cluster
**Files to Create:**
- `apps/web/components/maps/marker-cluster.tsx`

---

### 15. **Map Filter Integration**
**RFC Section:** 3.3 User Flows (V3)
**Priority:** LOW
**Description:** Filter reports on map by various criteria
**Requirements:**
- Filter by category (berlubang/retak/lainnya)
- Filter by date range
- Filter by admin boundaries
- Real-time map updates
**Files to Create:**
- `apps/web/components/maps/map-filters.tsx`

---

### 16. **Personal Reports Map View**
**RFC Section:** 3.3 User Flows (V3)
**Priority:** LOW
**Description:** User dashboard with personal reports on map
**Requirements:**
- Tab/option to view personal reports on map
- Highlight user's own reports
- Quick actions from map
**Files to Update:**
- `apps/web/app/dashboard/page.tsx`

---

### 17. **Map Share & Link**
**RFC Section:** 3.3 User Flows (V3)
**Priority:** LOW
**Description:** Share map views with specific filters/zoom
**Requirements:**
- Generate shareable URLs with map state
- Deep link to specific map locations
- Social media preview for map links
**Files to Create:**
- `apps/web/lib/utils/map-share.ts`

---

## 🎯 **V4 - Admin & Moderation Features**

### 18. **Admin Reports Verification**
**RFC Section:** 17.2 Admin API Endpoints
**Current State:** Admin endpoints exist
**Priority:** HIGH
**Description:** Verify admin can verify/reject reports
**Requirements:**
- Test all admin report actions
- Verify audit logging
- Ensure proper permissions
**Files to Test:**
- `apps/api/src/routes/admin/api.ts`
- `apps/web/components/admin/admin-reports-table.tsx`

---

### 19. **Database Migrations Setup**
**RFC Section:** 10 Local Dev Setup
**Current State:** Migration tool unclear
**Priority:** HIGH
**Description:** Proper database migration system
**Requirements:**
- Choose migration tool (Sqitch, Prisma, Drizzle)
- Migrate development to production
- Seed data for testing
**Files to Create:**
- `apps/api/migrations/` directory
- Migration scripts
- Database initialization scripts

---

### 20. **GitHub Actions CI/CD for Pull Requests**
**RFC Section:** 13 Milestone Checklist - Item 17a
**Current State:** Deployment workflow exists (build-and-push.yml), but PR testing missing
**Priority:** HIGH
**Description:** Automated build and test for each Pull Request
**Requirements:**
- Build API and Web on every PR
- Run TypeScript type checking
- Run linting (ESLint)
- Build Docker images to verify builds
- Optional: Run basic smoke tests
- Block merge if any step fails
**Files to Create:**
- `.github/workflows/ci.yml` (triggered on pull_request events)
- Test scripts in package.json
- Basic smoke test scripts

---

### 21. **Security Headers & CORS**
**RFC Section:** 6.5 Security Considerations
**Priority:** HIGH
**Description:** Proper security headers and CORS configuration
**Requirements:**
- CORS configuration for frontend origin
- Security headers (CSP, HSTS, etc.)
- Rate limiting headers
- API security middleware
**Files to Create/Update:**
- `apps/api/src/middleware/security.ts`
- `apps/api/src/middleware/cors.ts`

---

### 22. **Monitoring & Observability**
**RFC Section:** 15 Monitoring & Observability
**Priority:** LOW
**Description:** Metrics collection and health checks
**Requirements:**
- Custom metrics (reportCreations, uploadDuration, authFailures)
- Health check endpoints (/health)
- Grafana integration (optional)
**Files to Create:**
- `apps/api/src/middleware/metrics.ts`
- Health check handlers
- Database query performance monitoring

---

### 23. **Performance Optimization**
**RFC Section:** 6.7 Performance Considerations
**Priority:** MEDIUM
**Description:** Optimize application performance
**Requirements:**
- Image optimization and CDN
- API response caching
- Database query optimization
- Bundle size optimization
**Files to Create/Update:**
- Image optimization middleware
- Redis caching layer (optional)
- Database index optimization

---

## 📝 **Implementation Priority Order**

### Phase 1 (Week 1-2): Critical V1 Fixes
1. Rate Limiting Middleware
2. PWA Configuration
3. 404/500 Error Pages
4. Security Headers & CORS

### Phase 2 (Week 3-4): User Experience
5. Dashboard Statistics
6. Database Migrations
7. GitHub Actions CI/CD for Pull Requests
8. Security Headers & CORS

### Phase 3 (Month 2): V3 Map Visual
9. Leaflet Map Integration
10. Marker Clustering
11. Map Filters
12. Personal Reports Map
13. Map Sharing

### Phase 4 (Month 3): V4 Admin & Monitoring
14. Admin Verification Features
15. Admin User Management
16. Admin Statistics
17. Activity Logs
18. Bulk Actions
19. Monitoring & Observability

### Phase 5 (Month 4): V5 Mobile & Enhancement
20. Database Migrations Setup
21. GitHub Actions CI/CD
22. Performance Optimization
23. Security Hardening
24. Documentation Updates

---

## 🏷️ **GitHub Issue Labels**

**Priority Labels:**
- `priority/high` - Critical for V1
- `priority/medium` - Important but not blocking
- `priority/low` - Nice to have

**Feature Labels:**
- `feature/auth` - Authentication related
- `feature/reports` - Report CRUD operations
- `feature/maps` - Map visualization
- `feature/admin` - Admin features
- `feature/pwa` - PWA features
- `feature/geocoding` - GPS/address features

**Type Labels:**
- `bug` - Bug fixes
- `enhancement` - Feature improvements
- `task` - Maintenance tasks
- `documentation` - Documentation updates

---

## 📋 **How to Use This List**

1. **Create GitHub Issues** using the template below
2. **Assign to milestones** based on priority order
3. **Break down large features** into smaller tasks
4. **Link related issues** using GitHub issue references
5. **Update this list** as features get implemented

---

## 📌 **GitHub Issue Template**

```markdown
## Problem
[Describe the issue or missing feature]

## Solution
[Describe how to fix/implement]

## Requirements
- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

## Additional Context
- RFC Section: [Section reference]
- PRD Section: [Section reference]
- Priority: [High/Medium/Low]
- Estimated Effort: [XS/S/M/L/XL]
```

---

**Last Updated:** 2025-11-28
**Based On:** RFC v1.0, PRD v0.3, Current Codebase
