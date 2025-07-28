// Central route aggregator for all API routes
// Each feature should export its router and be included here

// Router exports
export { authRouter } from "./auth";
export { reportsRouter } from "./reports";
export { uploadRouter } from "./upload";
export { adminRouter } from "./admin";
export { administrativeRouter } from "./administrative";

// Middleware exports (for convenience)
export {
  firebaseAuthMiddleware,
  optionalAuthMiddleware,
  requireRole,
  requireAdmin,
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

export type {
  // Administrative types
  Province,
  Regency,
  District,
  SyncStatus,
  AdministrativeHierarchy,
  AdministrativeNames,
} from "./administrative";

// Note: Common types (AppResult, error classes) should be imported directly from @/types
