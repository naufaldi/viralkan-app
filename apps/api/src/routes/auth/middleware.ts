import type { Context, Next } from "hono";
import { sql } from "../../db/connection";
import * as shell from "./shell";
import type { ErrorResponse } from "./types";

interface AuthContext extends Context {
  get: (key: "user_id") => string; // Changed from number to string (UUID v7)
  set: (key: "user_id", value: string) => void; // Changed from number to string (UUID v7)
}

/**
 * Firebase authentication middleware using the 4-layer architecture
 * API Layer - handles HTTP concerns and authentication
 */
export const firebaseAuthMiddleware = async (c: AuthContext, next: Next) => {
  try {
    console.log(`[DEBUG] firebaseAuthMiddleware - Starting authentication check`);
    
    const authHeader = c.req.header("Authorization");
    console.log(`[DEBUG] firebaseAuthMiddleware - Auth header: ${authHeader ? 'Present' : 'Missing'}`);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log(`[DEBUG] firebaseAuthMiddleware - Invalid auth header format`);
      const errorResponse: ErrorResponse = {
        error: "Missing or invalid Authorization header",
        statusCode: 401,
        timestamp: new Date().toISOString(),
      };
      return c.json(errorResponse, 401);
    }

    const idToken = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log(`[DEBUG] firebaseAuthMiddleware - Token extracted: ${idToken ? 'Present' : 'Missing'}`);

    if (!idToken) {
      console.log(`[DEBUG] firebaseAuthMiddleware - No token after extraction`);
      const errorResponse: ErrorResponse = {
        error: "ID token is required",
        statusCode: 401,
        timestamp: new Date().toISOString(),
      };
      return c.json(errorResponse, 401);
    }

    // Use shell layer for authentication logic
    console.log(`[DEBUG] firebaseAuthMiddleware - Calling shell.verifyTokenAndGetUser`);
    const result = await shell.verifyTokenAndGetUser(sql, idToken);
    
    console.log(`[DEBUG] firebaseAuthMiddleware - Shell result:`, {
      success: result.success,
      error: result.success ? 'N/A' : result.error,
      userId: result.success ? result.data?.user_id : 'N/A'
    });

    if (!result.success) {
      console.log(`[DEBUG] firebaseAuthMiddleware - Authentication failed: ${result.error}`);
      const errorResponse: ErrorResponse = {
        error: result.error,
        statusCode: result.statusCode,
        timestamp: new Date().toISOString(),
      };
      return c.json(
        errorResponse,
        result.statusCode as 400 | 401 | 403 | 404 | 409 | 500,
      );
    }

    // Store user_id in context for use in route handlers
    console.log(`[DEBUG] firebaseAuthMiddleware - Setting user_id in context: ${result.data.user_id}`);
    c.set("user_id", result.data.user_id);

    console.log(`[DEBUG] firebaseAuthMiddleware - Authentication successful, calling next()`);
    await next();
  } catch (error) {
    console.error("Firebase auth middleware error:", error);

    const errorResponse: ErrorResponse = {
      error: "Authentication failed",
      statusCode: 500,
      timestamp: new Date().toISOString(),
    };

    return c.json(errorResponse, 500);
  }
};

/**
 * Optional authentication middleware - doesn't fail if no token provided
 * API Layer - handles optional authentication
 */
export const optionalAuthMiddleware = async (c: AuthContext, next: Next) => {
  try {
    const authHeader = c.req.header("Authorization");

    // If no auth header, continue without setting user_id
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      await next();
      return;
    }

    const idToken = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!idToken) {
      await next();
      return;
    }

    // Use shell layer for authentication logic
    const result = await shell.verifyTokenAndGetUser(sql, idToken);

    if (result.success) {
      // Store user_id in context if authentication successful
      c.set("user_id", result.data.user_id);
    }
    // Continue regardless of authentication result

    await next();
  } catch (error) {
    console.error("Optional auth middleware error:", error);
    // Continue even if authentication fails
    await next();
  }
};

/**
 * Role-based authorization middleware
 * API Layer - handles authorization checks
 */
export const requireRole = (requiredRole: string) => {
  return async (c: AuthContext, next: Next) => {
    try {
      const userId = c.get("user_id");
      
      console.log(`[DEBUG] requireRole middleware - userId: ${userId}, requiredRole: ${requiredRole}`);

      if (!userId) {
        console.log(`[DEBUG] requireRole middleware - No userId found in context`);
        const errorResponse: ErrorResponse = {
          error: "Authentication required",
          statusCode: 401,
          timestamp: new Date().toISOString(),
        };
        return c.json(errorResponse, 401);
      }

      // Get user data to check role
      const result = await shell.getUserById(sql, userId, userId);
      
      console.log(`[DEBUG] requireRole middleware - getUserById result:`, {
        success: result.success,
        error: result.success ? 'N/A' : result.error,
        userRole: result.success ? result.data?.role : 'N/A'
      });

      if (!result.success) {
        const errorResponse: ErrorResponse = {
          error: "User verification failed",
          statusCode: 403,
          timestamp: new Date().toISOString(),
        };
        return c.json(errorResponse, 403);
      }

      // Check if user has the required role
      if (result.data.role !== requiredRole) {
        console.log(`[DEBUG] requireRole middleware - Role mismatch. Expected: ${requiredRole}, Got: ${result.data.role}`);
        const errorResponse: ErrorResponse = {
          error: `${requiredRole} access required`,
          statusCode: 403,
          timestamp: new Date().toISOString(),
        };
        return c.json(errorResponse, 403);
      }

      console.log(`[DEBUG] requireRole middleware - Authorization successful for user ${userId} with role ${result.data.role}`);
      await next();
    } catch (error) {
      console.error("Role authorization middleware error:", error);

      const errorResponse: ErrorResponse = {
        error: "Authorization failed",
        statusCode: 500,
        timestamp: new Date().toISOString(),
      };

      return c.json(errorResponse, 500);
    }
  };
};

/**
 * Admin authorization middleware
 * API Layer - handles admin authorization checks
 */
export const requireAdmin = async (c: AuthContext, next: Next) => {
  console.log(`[DEBUG] requireAdmin middleware - Starting admin check`);
  
  // First, authenticate the user
  await firebaseAuthMiddleware(c, async () => {
    // Then check if they have admin role
    await requireRole('admin')(c, next);
  });
};
