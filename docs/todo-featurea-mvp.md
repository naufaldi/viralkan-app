# Viralkan Development TODO - V1, V2, V3

*Aligned with RFC v1 and PRD v0.3 - Updated: January 2025*

## 📋 **Overview & Version Strategy**

This TODO follows a **true MVP approach** aligned with the RFC, organizing all tasks into three clear development phases:

- **V1 (2-3 weeks)**: Core MVP - Validate concept with minimal features
- **V2 (3-4 weeks)**: Production Polish - Enhanced UX and deployment  
- **V3 (4-6 weeks)**: Advanced Platform - Maps, admin, and scaling

---

## 🚀 **V1 - Core MVP TODO (2-3 weeks)**
*Goal: Ship working app to validate core concept*

### ✅ **DATABASE & SCHEMA - COMPLETED**
- [x] Database schema with PostGIS extension
- [x] Users and reports tables with proper indexes
- [x] API route structure (/reports, /auth, /me)
- [ ] Basic CRUD operations for reports

### 🔐 **AUTHENTICATION**
- [ ] Google OAuth implementation using Firebase Auth
- [ ] JWT session management
- [ ] **Cookie Security**: HTTP-only, secure, sameSite settings
- [ ] **Session Expiry**: 7-day rolling sessions
- [ ] **Logout Endpoint**: Clear cookies and invalidate tokens

### 📤 **FILE UPLOAD & STORAGE**
- [ ] Cloudflare R2 integration
- [ ] Pre-signed URL generation
- [ ] **File Validation**: MIME type checking (images only)
- [ ] **File Size Limits**: Max 10MB per image
- [ ] **Image Processing**: Basic resize/compress for web display
- [ ] **Error Handling**: Upload failures and retries

### 📝 **REPORT CREATION (Core)**
- [x] Manual form with required fields
- [ ] **Category Dropdown**: berlubang, retak, lainnya (RFC v1 Indonesian categories)
- [ ] **Street Address Input**: Text field with basic validation
- [ ] **Location Description**: Basic text field for location context
- [ ] **GPS Coordinates**: Optional lat/lng fields (basic)
- [ ] **Form Validation**: Client-side and server-side
- [ ] **Submit Flow**: Save report → upload image → success page

### 📋 **PUBLIC LISTING (Basic)**
- [x] Public reports API endpoint
- [ ] **Simple List View**: Card layout with image, title, location
- [ ] **Basic Pagination**: 20 reports per page
- [ ] **Sort Options**: Newest first, oldest first
- [ ] **No Authentication Required**: Public access only
- [ ] **Responsive Design**: Mobile-friendly layout

### 🛡️ **SECURITY & VALIDATION (Basic)**
- [ ] **Rate Limiting**: 10 reports per user per day
- [ ] **Input Sanitization**: XSS protection
- [ ] **CORS Setup**: Proper origin restrictions
- [ ] **Environment Variables**: Secure config management
- [ ] **Basic Error Pages**: 404, 500 error handling

### 🚀 **DEPLOYMENT (Simple)**
- [ ] **Docker Setup**: Single container deployment
- [ ] **Environment Config**: Production .env template
- [ ] **Database Migration**: Production schema deployment
- [ ] **Basic Health Check**: /health endpoint
- [ ] **VPS Deployment**: Docker + Traefik setup (RFC v1 includes Traefik)

---

## 🌟 **V2 - Production Polish TODO (3-4 weeks)**
*Goal: Production-ready app with enhanced UX*

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
- [ ] **Unit Tests**: Core business logic coverage
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
*Goal: Full-featured platform with maps and admin*

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
- [ ] **Admin Authentication**: Role-based access control
- [ ] **Report Moderation**: Approve, reject, edit reports
- [ ] **User Management**: View, suspend, delete users
- [ ] **Analytics Dashboard**: Usage stats and trends
- [ ] **Content Moderation**: Flag inappropriate content
- [ ] **Bulk Operations**: Mass approve/reject reports
- [ ] **Admin Notifications**: Email alerts for new reports

### 📊 **ANALYTICS & REPORTING**
- [ ] **Usage Analytics**: Google Analytics/Plausible integration
- [ ] **Report Statistics**: Category trends, location hotspots
- [ ] **User Engagement**: Active users, retention metrics
- [ ] **Performance Monitoring**: API response times, error rates
- [ ] **Export Functionality**: CSV/PDF reports for admin
- [ ] **Public Statistics**: Community stats page

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
- [ ] **Public API**: RESTful API for third-party access
- [ ] **API Documentation**: OpenAPI/Swagger docs
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
- Complete authentication and file upload
- Finish basic report creation flow
- Deploy simple version for testing

### **Sprint 3-4 (Weeks 3-4): V1 Polish**
- Complete public listing
- Security hardening
- Simple deployment and testing

### **Sprint 5-7 (Weeks 5-7): V2 Production**
- Enhanced UX and mobile support
- Production infrastructure setup
- Comprehensive testing suite

### **Sprint 8-11 (Weeks 8-11): V2 Advanced**
- Search and filtering
- Performance optimization
- Security hardening

### **Sprint 12-15 (Weeks 12-15): V3 Maps**
- Map integration and geocoding
- Advanced location features

### **Sprint 16-18 (Weeks 16-18): V3 Admin**
- Admin dashboard and moderation
- Analytics and workflow automation

---

## ⚡ **Development Notes**

### **V1 Focus Areas:**
- Keep it simple - manual processes are okay
- Focus on core user journey: login → create report → view reports
- Basic deployment without complex infrastructure
- Validate concept before adding complexity

### **V2 Focus Areas:**
- Production-ready deployment and monitoring
- Enhanced user experience and mobile support
- Comprehensive testing and security

### **V3 Focus Areas:**
- Advanced features that differentiate the platform
- Admin tools for community management
- Scalability and performance optimization

### **Key Dependencies:**
- V2 cannot start until V1 is fully deployed and tested
- V3 map features require V2 geocoding foundation
- Admin dashboard requires stable V2 infrastructure

### **Success Metrics:**
- **V1**: App deployed, users can create and view reports
- **V2**: Production-ready, mobile-optimized, tested
- **V3**: Full-featured platform with maps and admin tools
