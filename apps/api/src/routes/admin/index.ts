// Public exports for the admin feature
// Following the 4-layer clean architecture pattern

// API Layer exports
export { adminRouter } from "./api";

// Middleware exports
export { requireAdmin } from "../auth/middleware";

// Type exports
export type {
  AdminStatsResponse,
  AdminReportsResponse,
  AdminReportActionRequest,
  AdminReportActionResponse,
  AdminActionLog,
} from "./types";

// Shell layer exports (for use by other features)
export * as adminShell from "./shell";

// Core layer exports (for use by other features)
export * as adminCore from "./core"; 