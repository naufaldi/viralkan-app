// Re-export auth middleware from the central routes aggregator
export { 
  firebaseAuthMiddleware, 
  optionalAuthMiddleware, 
  requireRole 
} from '../routes' 