# Requirements Document

## Introduction

The image upload system enables users to upload road damage photos as part of their incident reports through the existing create report form. The system must integrate seamlessly with the current backend API (`apps/api/src/routes/reports/api.ts`) and frontend form (`apps/web/components/reports/create-report-form.tsx`) to handle image uploads efficiently, securely, and reliably. The system will focus on MVP implementation (Version 1 - Backend Proxy Upload) first, with future scalability through presigned URLs (Version 2) planned for later phases.

## Requirements

### Requirement 1

**User Story:** As a user reporting road damage, I want to upload photos of the damage, so that I can provide visual evidence to support my report.

#### Acceptance Criteria

1. WHEN a user selects an image file in CreateReportForm THEN the ImageUpload component SHALL validate file extension is JPEG, PNG, or WebP
2. WHEN a user selects an image file THEN the ImageUpload component SHALL validate file size is under 10MB before allowing selection
3. WHEN an image upload is successful THEN the backend SHALL return a publicly accessible image URL to the frontend
4. WHEN frontend validation fails THEN the ImageUpload component SHALL display clear error messaging without making backend calls

### Requirement 2

**User Story:** As a system administrator, I want uploaded images to be stored securely in cloud storage, so that they are reliably accessible and properly managed.

#### Acceptance Criteria

1. WHEN the `/api/upload` endpoint processes an image THEN it SHALL store the image in Cloudflare R2 bucket
2. WHEN the backend stores an image THEN it SHALL generate a unique key using user ID and timestamp format
3. WHEN an image is successfully stored THEN the backend SHALL NOT record metadata in PostgreSQL (report creation handles this)
4. IF the `/api/upload` endpoint fails THEN it SHALL return error response without creating orphaned files

### Requirement 3

**User Story:** As a user, I want my image uploads to be authenticated and secure, so that only I can upload images to my account.

#### Acceptance Criteria

1. WHEN a user attempts to upload an image THEN the system SHALL verify their Firebase authentication token
2. WHEN storing image metadata THEN the system SHALL associate it with the authenticated user's ID
3. WHEN generating image URLs THEN the system SHALL ensure they are publicly accessible for report viewing
4. IF authentication fails THEN the system SHALL reject the upload with appropriate error message

### Requirement 4

**User Story:** As a developer, I want the upload system to integrate with existing report creation workflow, so that image uploads work seamlessly with the current form submission process.

#### Acceptance Criteria

1. WHEN a user submits CreateReportForm component THEN the backend SHALL handle image upload during report creation process
2. WHEN the backend creates a report THEN it SHALL upload the image to R2 and include the image URL in the report record
3. WHEN CreateReportForm validates submission THEN it SHALL ensure an image is selected before allowing report creation
4. WHEN the upload process fails during report creation THEN the backend SHALL return error and prevent report creation

### Requirement 5

**User Story:** As a system administrator, I want the upload system to handle errors gracefully and provide monitoring capabilities, so that I can maintain system reliability.

#### Acceptance Criteria

1. WHEN an upload fails THEN the system SHALL log the error with sufficient detail for debugging
2. WHEN implementing rate limiting THEN the system SHALL prevent abuse by limiting uploads per user
3. WHEN using MVP approach THEN the system SHALL handle file streaming efficiently to avoid memory issues
4. WHEN processing uploads THEN the system SHALL validate file types and sizes before storage

### Requirement 6

**User Story:** As a user on mobile devices, I want image uploads to work reliably on slower connections, so that I can report issues even in areas with poor connectivity.

#### Acceptance Criteria

1. WHEN uploading on slow connections THEN the system SHALL provide upload progress feedback (V2 only)
2. WHEN an upload is interrupted THEN the system SHALL support retry mechanisms (V2 only)
3. WHEN using mobile devices THEN the system SHALL optimize image sizes through WebP conversion (V2 only)
4. WHEN uploads fail THEN the system SHALL provide clear guidance on next steps
