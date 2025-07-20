# Implementation Plan

- [x] 1. Set up backend upload endpoint infrastructure following 4-layer architecture
  - Create upload route directory at `apps/api/src/routes/upload/` with api.ts, shell.ts, core.ts, data.ts, types.ts files
  - Configure Cloudflare R2 client with environment variables in data layer
  - Add upload route to main API router in `apps/api/src/index.ts`
  - Follow backend-rules.mdc for proper layer separation and type organization
  - _Requirements: 2.1, 3.1_

- [x] 2. Implement MVP image upload endpoint using AppResult pattern
  - Write POST `/api/upload` endpoint in api.ts with Firebase auth middleware and Zod validation
  - Implement business logic orchestration in shell.ts using AppResult pattern
  - Add pure file validation logic in core.ts (size, type validation)
  - Implement R2 storage operations in data.ts with unique key generation using user ID and timestamp
  - Define feature-specific types in types.ts, import common types from @/types
  - _Requirements: 1.3, 2.1, 2.2, 3.1, 3.2_

- [ ] 3. Add comprehensive error handling following backend error patterns
  - Implement structured error responses using AppError classes (ValidationError, UnauthorizedError, etc.)
  - Add specific error handling for file validation failures in core layer
  - Add error handling for R2 storage failures in data layer
  - Add authentication error handling in api layer with proper HTTP status codes
  - _Requirements: 5.1, 3.4_

- [ ] 4. Create upload service for frontend integration following frontend-rule.mdc
  - Create `apps/web/services/upload.ts` with uploadImage function using Axios
  - Implement proper TypeScript interfaces for upload requests/responses
  - Add error handling and response parsing with proper type safety
  - Include authentication token in request headers following auth patterns
  - _Requirements: 1.1, 1.4, 4.1_

- [ ] 5. Enhance ImageUpload component following React best practices
  - Update `apps/web/components/forms/image-upload.tsx` using shadcn/ui components
  - Add upload progress state management with proper TypeScript typing
  - Implement client-side file validation before upload (size, type) with clear error states
  - Use Tailwind CSS for styling and proper responsive design
  - _Requirements: 1.1, 1.2, 1.4, 6.4_

- [ ] 6. Integrate upload system with CreateReportForm following component composition patterns
  - Modify `apps/web/components/reports/create-report-form.tsx` to use upload service
  - Update form submission to upload image before creating report using proper async patterns
  - Handle upload errors in form validation with user-friendly error messages
  - Update form state management using react-hook-form with proper TypeScript integration
  - _Requirements: 4.1, 4.3, 4.4_

- [ ] 7. Update report creation API following existing backend architecture
  - Modify existing report creation endpoint in shell layer to handle image_url processing
  - Add image_key field to database schema using postgres.js migration
  - Update report creation logic in data layer to store both image_url and image_key
  - Ensure report creation fails gracefully if image_url is invalid using AppResult pattern
  - _Requirements: 2.3, 4.2, 4.4_

- [ ] 8. Add comprehensive validation and security measures following backend security patterns
  - Implement rate limiting middleware for upload endpoint using Hono middleware
  - Add server-side MIME type validation in core layer beyond file extensions
  - Add CORS configuration for upload endpoint in api layer
  - Implement file size validation at multiple layers (client and server) with proper error responses
  - _Requirements: 3.1, 3.3, 5.2, 5.4_

- [ ] 9. Create unit tests following testing hierarchy from frontend-rule.mdc
  - Write unit tests for upload endpoint business logic in core and shell layers
  - Write tests for file validation logic with proper mocking of external dependencies
  - Write tests for R2 integration in data layer with proper error scenarios
  - Write tests for frontend upload service with proper TypeScript assertions
  - _Requirements: 1.1, 1.2, 1.4, 2.1, 3.1_

- [ ] 10. Create integration tests for end-to-end upload flow
  - Write E2E tests using Playwright for complete upload flow from form submission to storage
  - Write integration tests for authentication flow with upload process
  - Write tests for report creation with image upload using proper test data setup
  - Write tests for error scenarios and recovery with proper cleanup procedures
  - _Requirements: 4.1, 4.2, 4.4, 5.1_

- [ ] 11. Add monitoring and logging infrastructure following backend patterns
  - Add structured logging to upload endpoint using proper log levels and context
  - Implement error tracking with sufficient context for debugging in all layers
  - Add performance metrics collection for upload times and file sizes
  - Create logging for security events (auth failures, invalid files) with proper alerting
  - _Requirements: 5.1, 5.3_

- [ ] 12. Implement cleanup and maintenance procedures following deployment practices
  - Create database migration script using postgres.js to add image_key column if not exists
  - Add environment variable configuration for R2 credentials with proper validation
  - Create documentation for upload system configuration following project standards
  - Add health check endpoint for upload system status in api layer
  - _Requirements: 2.2, 2.4, 5.4_
