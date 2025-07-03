// Central route aggregator for all API routes
// Each feature should export its router and be included here

// Auth feature (4-layer architecture)
export { authRouter } from './auth'

// Reports feature
export { reportsRouter } from './reports'

// User profile feature  
export { meRouter } from './me'

// Middleware exports (for convenience)
export { 
  firebaseAuthMiddleware, 
  optionalAuthMiddleware, 
  requireRole 
} from './auth'

// Type exports from features
export type {
  AppResult,
  CreateUser,
  UserResponse,
  AuthVerificationResponse,
  LogoutResponse,
  ErrorResponse
} from './auth'
