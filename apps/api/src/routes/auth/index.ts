// Public exports for the auth feature
// Following the 4-layer clean architecture pattern

// API Layer exports
export { authRouter } from "./api";

// Middleware exports
export {
  firebaseAuthMiddleware,
  optionalAuthMiddleware,
  requireRole,
} from "./middleware";

// Type exports
export type {
  CreateUser,
  UserResponse,
  AuthVerificationResponse,
  LogoutResponse,
  ErrorResponse,
  DbUser,
  FirebaseToken,
  UserStatsResponse,
} from "./types";

// Shell layer exports (for use by other features)
export * as authShell from "./shell";

// Core layer exports (for use by other features)
export * as authCore from "./core";
