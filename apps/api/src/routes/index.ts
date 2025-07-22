// Central route aggregator for all API routes
// Each feature should export its router and be included here

// Router exports
export { authRouter } from "./auth";
export { reportsRouter } from "./reports";
export { uploadRouter } from "./upload";

// Middleware exports (for convenience)
export {
  firebaseAuthMiddleware,
  optionalAuthMiddleware,
  requireRole,
} from "./auth";

// Public API type exports - these are the main types external consumers would use
export type {
  // Auth types
  CreateUser,
  UserResponse,
  AuthVerificationResponse,
  LogoutResponse,
  ErrorResponse,
  UserStatsResponse,
} from "./auth";

export type {
  // Reports types
  CreateReportInput,
  ReportQuery,
  ReportParams,
  Report,
  ReportWithUser,
  PaginatedReports,
} from "./reports";

export type {
  // Upload types
  UploadResponse,
  UploadErrorResponse,
  FileValidationConfig,
} from "./upload";

// Note: Common types (AppResult, error classes) should be imported directly from @/types
