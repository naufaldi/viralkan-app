# Viralkan Development TODO - V1, V2, V3

_Aligned with RFC v1 and PRD v0.3 - Updated: January 2025_

## 📋 **Overview & Version Strategy**

This TODO follows a **true MVP approach** aligned with the RFC, organizing all tasks into three clear development phases:

- **V1 (2-3 weeks)**: Core MVP - Validate concept with minimal features
- **V2 (3-4 weeks)**: Production Polish - Enhanced UX and deployment
- **V3 (4-6 weeks)**: Advanced Platform - Maps, admin, and scaling

---

## 🚀 **V1 - Core MVP TODO (2-3 weeks)**

_Goal: Ship working app to validate core concept_

### 🔧 **BACKEND API STATUS - 85% COMPLETE**

### ✅ **DATABASE & SCHEMA - COMPLETED**

- [x] Database schema with PostGIS extension
- [x] Users and reports tables with proper indexes
- [x] API route structure (/reports, /auth, /me)
- [x] Basic CRUD operations for reports
- [x] Database migration and reset scripts
- [x] Database connection with Postgres

### ✅ **AUTHENTICATION - COMPLETED**

- [x] Firebase Authentication implementation using Admin SDK
- [x] Bearer token session management
- [x] **Token Verification**: Firebase ID token verification
- [x] **User Management**: User creation/update with upsert functionality
- [x] **Authorization Middleware**: Bearer token validation
- [x] **Logout Endpoint**: Server-side logout confirmation
- [x] **User Profile**: GET /api/auth/me endpoint
- [x] **User Statistics**: GET /api/auth/me/stats endpoint

### 📤 **FILE UPLOAD & STORAGE - PARTIALLY COMPLETED**

- [x] Cloudflare R2 configuration setup
- [x] Environment variable configuration for R2
- [ ] Pre-signed URL generation implementation
- [ ] **File Validation**: MIME type checking (images only)
- [ ] **File Size Limits**: Max 10MB per image validation
- [ ] **Image Processing**: Basic resize/compress for web display
- [ ] **Error Handling**: Upload failures and retries

### ✅ **REPORT CREATION (Core) - COMPLETED**

- [x] Complete reports API with CRUD operations
- [x] **Category Support**: berlubang, retak, lainnya (Indonesian categories)
- [x] **Street Address Input**: Text field validation
- [x] **Location Description**: Text field for location context
- [x] **GPS Coordinates**: Optional lat/lng fields
- [x] **Form Validation**: Zod schema validation (client & server)
- [x] **Submit Flow**: Create report endpoint with proper authentication
- [x] **Ownership Validation**: Users can only edit/delete their own reports

### ✅ **PUBLIC LISTING (Basic) - COMPLETED**

- [x] Public reports API endpoint with pagination
- [x] **Pagination**: Configurable page size (default 20, max 100)
- [x] **Sort Options**: Created date DESC by default
- [x] **Category Filtering**: Filter by damage type
- [x] **User Filtering**: Filter reports by user ID
- [x] **No Authentication Required**: Public access for listing
- [x] **Report Details**: GET /api/reports/:id endpoint

### ✅ **SECURITY & VALIDATION (Basic) - COMPLETED**

- [x] **Input Sanitization**: Zod validation for all endpoints
- [x] **CORS Setup**: Proper origin restrictions configured
- [x] **Environment Variables**: Secure config management with validation
- [x] **Authorization**: Bearer token middleware
- [x] **Data Validation**: Comprehensive schema validation
- [ ] **Rate Limiting**: 10 reports per user per day (needs implementation)
- [x] **Error Handling**: Structured error responses

### ✅ **API DOCUMENTATION - COMPLETED**

- [x] **OpenAPI Specification**: Complete API documentation
- [x] **Swagger UI**: Available at /docs endpoint
- [x] **Schema Documentation**: All endpoints documented with examples
- [x] **Security Documentation**: Bearer token authentication documented

### 🚀 **DEPLOYMENT (Simple) - PARTIALLY COMPLETED**

- [x] **Environment Config**: Production .env template provided
- [x] **Database Migration**: Production schema deployment scripts
- [x] **Health Check**: / endpoint with status information
- [x] **Build Configuration**: Bun build setup
- [ ] **Docker Setup**: Single container deployment (needs Dockerfile)
- [ ] **VPS Deployment**: Docker + Traefik setup (needs implementation)

### 🎨 **FRONTEND UI STATUS - 0% COMPLETE**

_Focus: Essential MVP features only - fast development_

### 🔐 **AUTHENTICATION UI (Essential)**

- [ ] **Login Page**: Simple Google Sign-In button with Firebase
- [ ] **Authentication State**: Basic React context for logged-in user
- [ ] **Protected Routes**: Simple route guard for authenticated pages
- [ ] **Logout Button**: Clear auth and redirect to home

### 📝 **REPORT CREATION UI (Core)**

- [ ] **Create Report Page**: Simple form at `/create`
- [ ] **Basic Form**: Category dropdown + Address + Description + Image upload
- [ ] **Image Upload**: Simple file picker (no preview needed)
- [ ] **Submit**: Loading button + success message
- [ ] **Validation**: Basic required field validation

### 📋 **PUBLIC REPORTS LISTING UI (Core)**

- [ ] **Home Page**: Simple list of reports at `/`
- [ ] **Report Cards**: Basic card with image + title + date
- [ ] **Simple Pagination**: Next/Previous buttons only
- [ ] **Basic Loading**: Simple spinner while loading

### 🔍 **REPORT DETAIL UI (Basic)**

- [ ] **Detail Page**: `/reports/[id]` with image + info
- [ ] **Edit/Delete**: Only for report owner (simple buttons)

### 👤 **USER DASHBOARD UI (Minimal)**

- [ ] **Dashboard**: `/dashboard` with user stats + "My Reports" list
- [ ] **My Reports**: Simple table with edit/delete buttons

### 🎨 **LAYOUT (Minimal)**

- [ ] **Header**: Logo + Login/Logout button
- [ ] **Navigation**: Home, Create Report, Dashboard (if logged in)
- [ ] **Mobile Responsive**: Basic responsive design

### ⚙️ **SETUP (Essential)**

- [ ] **Next.js App**: Basic Next.js 14 setup
- [ ] **TailwindCSS**: For quick styling
- [ ] **Firebase Config**: Client-side auth setup
- [ ] **API Client**: Simple fetch calls to backend
- [ ] **Environment**: API URL configuration

### 🔗 **API INTEGRATION (Essential)**

- [ ] **Auth Service**: Login with Firebase + API token calls
- [ ] **Reports API**: Fetch, create, update, delete reports
- [ ] **Error Handling**: Basic try/catch with user-friendly messages
- [ ] **Loading States**: Simple loading indicators

---

## 🔧 **V1 API STATUS SUMMARY**

### **✅ COMPLETED ENDPOINTS:**

- `GET /` - Health check
- `GET /api/auth/health` - Auth service health
- `POST /api/auth/verify` - Firebase token verification
- `GET /api/auth/me` - Get user profile
- `GET /api/auth/me/stats` - Get user statistics
- `POST /api/auth/logout` - Logout confirmation
- `GET /api/reports` - List all reports (paginated, filterable)
- `GET /api/reports/enriched` - Reports with user data
- `GET /api/reports/:id` - Get specific report
- `POST /api/reports` - Create new report (authenticated)
- `PUT /api/reports/:id` - Update report (authenticated, owner only)
- `DELETE /api/reports/:id` - Delete report (authenticated, owner only)
- `GET /api/reports/me` - Get current user's reports
- `GET /api/reports/:id/ownership` - Validate report ownership
- `GET /docs` - Swagger UI documentation
- `GET /openapi` - OpenAPI specification

### **✅ COMPLETED FEATURES:**

- Firebase Authentication with Admin SDK
- PostgreSQL database with PostGIS spatial extension
- Complete reports CRUD with authorization
- User management and statistics
- Input validation with Zod schemas
- Error handling with structured responses
- CORS configuration
- Environment variable management
- API documentation with OpenAPI/Swagger
- Database migration system
- Test suite for core functionality

### **⚠️ MISSING FOR V1 MVP:**

- File upload integration with Cloudflare R2
- Rate limiting middleware
- Docker containerization
- Production deployment setup

---

## 🌟 **V2 - Production Polish TODO (3-4 weeks)**

_Goal: Production-ready app with enhanced UX_

### 📝 **ENHANCED REPORT FEATURES**

- [ ] **Description Field**: Rich text area (500 char limit)
- [ ] **Enhanced Categories**: Infrastructure, Safety, Environment (English categories)
- [ ] **Manual GPS Entry**: Enhanced coordinate input with validation
- [ ] **Report Status Workflow**: Draft, Published, Under Review states

### 📸 **ENHANCED FILE UPLOAD**

- [ ] **EXIF Data Extraction**: Auto-extract GPS from image metadata
- [ ] **Multiple Image Support**: Up to 3 images per report
- [ ] **Image Preview**: Show selected images before upload
- [ ] **Drag & Drop Interface**: Modern file upload UX
- [ ] **Progressive Upload**: Upload progress indicators
- [ ] **Image Optimization**: WebP conversion and multiple sizes

### 🎨 **USER EXPERIENCE IMPROVEMENTS**

- [ ] **User Dashboard**: Personal reports management
- [ ] **Report Status**: Draft, Published, Under Review states
- [ ] **Edit Reports**: Allow users to modify their own reports
- [ ] **Better Forms**: Multi-step wizard for report creation
- [ ] **Success/Error States**: Improved feedback and messaging
- [ ] **Loading States**: Skeleton screens and spinners

### 🔍 **SEARCH & FILTERING**

- [ ] **Search Functionality**: Search by description, address, category
- [ ] **Category Filters**: Filter reports by type
- [ ] **Location Filters**: Filter by area/neighborhood
- [ ] **Date Range Filters**: Filter by submission date
- [ ] **Advanced Search**: Combined filters with URL state

### 📱 **MOBILE & ACCESSIBILITY**

- [ ] **Mobile Responsive**: Touch-friendly design
- [ ] **PWA Support**: Install prompts and offline capability
- [ ] **Accessibility**: ARIA labels, keyboard navigation
- [ ] **Performance**: Code splitting and lazy loading
- [ ] **SEO Optimization**: Meta tags and structured data

### 🏗️ **PRODUCTION INFRASTRUCTURE**

- [ ] **Traefik Setup**: Reverse proxy with auto-SSL
- [ ] **Docker Compose**: Multi-service production setup
- [ ] **Monitoring**: Health checks and uptime monitoring
- [ ] **Logging**: Structured logging with log rotation
- [ ] **Backup Strategy**: Automated database backups
- [ ] **SSL Certificates**: Let's Encrypt integration

### 🧪 **COMPREHENSIVE TESTING**

- [x] **Unit Tests**: Core business logic coverage (basic tests implemented)
- [ ] **Integration Tests**: API endpoint testing
- [ ] **E2E Tests**: Playwright/Cypress test suite
- [ ] **Performance Tests**: Load testing and optimization
- [ ] **Security Tests**: Vulnerability scanning
- [ ] **CI/CD Pipeline**: Automated testing and deployment

### 🔒 **SECURITY HARDENING**

- [ ] **Advanced Rate Limiting**: Per-IP and per-user limits
- [ ] **Content Security Policy**: XSS prevention headers
- [ ] **SQL Injection Protection**: Parameterized queries audit
- [ ] **File Upload Security**: Virus scanning, secure storage
- [ ] **Session Security**: Refresh tokens, secure cookies
- [ ] **API Security**: Request signing and validation

---

## 🗺️ **V3 - Advanced Platform TODO (4-6 weeks)**

_Goal: Full-featured platform with maps and admin_

### 🗺️ **MAP INTEGRATION**

- [ ] **Leaflet Map**: Interactive map showing all reports
- [ ] **Clustering**: Group nearby reports for performance
- [ ] **Map Filters**: Show/hide categories on map
- [ ] **Custom Markers**: Category-specific map icons
- [ ] **Report Popup**: Click marker to see report details
- [ ] **Geolocation**: Auto-center map on user location
- [ ] **Map Layers**: Satellite, street, terrain view options

### 🔍 **ADVANCED GEOCODING**

- [ ] **Address Autocomplete**: Google Places API integration
- [ ] **Reverse Geocoding**: Convert GPS to human-readable address
- [ ] **Location Validation**: Verify addresses exist
- [ ] **Neighborhood Detection**: Auto-tag reports by area
- [ ] **Distance Calculations**: "Reports near me" functionality

### 👨‍💼 **ADMIN DASHBOARD**

- ✅ **Admin Authentication**: Role-based access control
- ✅ **Report Moderation**: Approve, reject, edit reports
- ✅ **User Management**: View user statistics and admin users
- ✅ **Analytics Dashboard**: Usage stats and trends
- ✅ **Content Moderation**: Flag inappropriate content
- ❌ **Bulk Operations**: Mass approve/reject reports
- ❌ **Admin Notifications**: Email alerts for new reports

### 📊 **ANALYTICS & REPORTING**

- ✅ **Usage Analytics**: Admin dashboard with comprehensive statistics
- ✅ **Report Statistics**: Category trends, verification rates, user statistics
- ✅ **User Engagement**: Active users, admin users, verification metrics
- ✅ **Performance Monitoring**: API response times, error rates
- ❌ **Export Functionality**: CSV/PDF reports for admin
- ❌ **Public Statistics**: Community stats page

### 🔄 **WORKFLOW & AUTOMATION**

- [ ] **Report Status Workflow**: Draft → Review → Published → Resolved
- [ ] **Email Notifications**: Status updates to report creators
- [ ] **Automated Moderation**: AI content filtering
- [ ] **Report Expiry**: Auto-archive old reports
- [ ] **Duplicate Detection**: Similar report identification
- [ ] **Priority System**: Urgent vs normal reports

### 🚀 **SCALABILITY & PERFORMANCE**

- [ ] **Database Optimization**: Query optimization, indexes
- [ ] **Caching Strategy**: Redis for API responses
- [ ] **CDN Integration**: Cloudflare for static assets
- [ ] **Load Balancing**: Multiple app server instances
- [ ] **Database Replica**: Read replicas for performance
- [ ] **Auto-scaling**: Container orchestration setup

### 🔌 **API & INTEGRATIONS**

- [x] **Public API**: RESTful API implemented
- [x] **API Documentation**: OpenAPI/Swagger docs completed
- [ ] **Webhooks**: External system notifications
- [ ] **Government Integration**: Connect with city systems
- [ ] **Social Sharing**: Share reports on social media
- [ ] **Mobile App API**: Prepare for native mobile apps

### 📧 **COMMUNICATION FEATURES**

- [ ] **Email System**: Transactional email setup
- [ ] **Push Notifications**: Browser push for updates
- [ ] **Comment System**: Allow comments on reports
- [ ] **Report Updates**: Status change notifications
- [ ] **Community Features**: User profiles and reputation

---

## 📅 **Sprint Timeline**

### **Sprint 1-2 (Weeks 1-2): V1 Core**

- ✅ Complete authentication and database setup
- ✅ Complete basic report CRUD operations
- ✅ Complete public API endpoints

### **Sprint 3-4 (Weeks 3-4): V1 Polish**

- ⚠️ Complete file upload integration (R2)
- ⚠️ Implement rate limiting
- ⚠️ Simple deployment and testing

### **Sprint 5-7 (Weeks 5-7): V2 Production**

- [ ] Enhanced UX and mobile support
- [ ] Production infrastructure setup
- [ ] Comprehensive testing suite

### **Sprint 8-11 (Weeks 8-11): V2 Advanced**

- [ ] Search and filtering
- [ ] Performance optimization
- [ ] Security hardening

### **Sprint 12-15 (Weeks 12-15): V3 Maps**

- [ ] Map integration and geocoding
- [ ] Advanced location features

### **Sprint 16-18 (Weeks 16-18): V3 Admin**

- ✅ Admin dashboard and moderation (completed ahead of schedule)
- ✅ Analytics and workflow automation (completed ahead of schedule)
- ❌ Bulk operations and advanced admin features

---

## ⚡ **Development Notes**

### **V1 Current Status:**

- **API Backend**: ~95% complete - Core functionality implemented
- **Authentication**: 100% complete - Firebase integration working
- **Database**: 100% complete - Schema and operations ready
- **Reports CRUD**: 100% complete - Full functionality with authorization
- **Admin Dashboard**: 100% complete - Full admin interface with real API integration
- **Missing**: File uploads, rate limiting, deployment setup

### **V3 Current Status:**

- **Admin Dashboard**: 100% complete - Full admin interface with verification system
- **Admin API**: 100% complete - All admin endpoints implemented
- **Admin Statistics**: 100% complete - Comprehensive dashboard statistics
- **Admin Actions**: 100% complete - Verify, reject, delete functionality
- **Admin Authentication**: 100% complete - Role-based access control

### **V1 Remaining Work:**

- File upload integration with Cloudflare R2
- Rate limiting middleware implementation
- Docker containerization
- Production deployment setup

### **V2 Focus Areas:**

- Production-ready deployment and monitoring
- Enhanced user experience and mobile support
- Comprehensive testing and security

### **V3 Focus Areas:**

- Advanced features that differentiate the platform
- Admin tools for community management
- Scalability and performance optimization

### **Key Dependencies:**

- V2 cannot start until V1 file uploads and deployment are complete
- V3 map features require V2 geocoding foundation
- Admin dashboard requires stable V2 infrastructure

### **Success Metrics:**

- **V1**: API fully functional, file uploads working, basic deployment ready
- **V2**: Production-ready, mobile-optimized, tested
- **V3**: Full-featured platform with maps and admin tools

## 🎯 **V1 FRONTEND SUMMARY**

**Total Tasks: ~25 essential items** (vs 80+ in full version)

**Core User Journey:**

1. **Login** → Google OAuth
2. **View Reports** → Simple list with pagination
3. **Create Report** → Basic form with image upload
4. **Manage Reports** → Edit/delete own reports

**Tech Stack:**

- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS (fast styling)
- **Auth**: Firebase Auth (client-side)
- **API**: Simple fetch calls to existing backend
- **State**: React Context (no complex state management)

**Development Time: ~1 week** with existing API backend
