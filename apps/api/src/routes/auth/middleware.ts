import type { Context, Next } from "hono";
import { sql } from "../../db/connection";
import * as shell from "./shell";
import type { ErrorResponse } from "./types";

interface AuthContext extends Context {
  get: (key: "user_id") => number;
  set: (key: "user_id", value: number) => void;
}

/**
 * Firebase authentication middleware using the 4-layer architecture
 * API Layer - handles HTTP concerns and authentication
 */
export const firebaseAuthMiddleware = async (c: AuthContext, next: Next) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const errorResponse: ErrorResponse = {
        error: "Missing or invalid Authorization header",
        statusCode: 401,
        timestamp: new Date().toISOString(),
      };
      return c.json(errorResponse, 401);
    }

    const idToken = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!idToken) {
      const errorResponse: ErrorResponse = {
        error: "ID token is required",
        statusCode: 401,
        timestamp: new Date().toISOString(),
      };
      return c.json(errorResponse, 401);
    }

    // Use shell layer for authentication logic
    const result = await shell.verifyTokenAndGetUser(sql, idToken);

    if (!result.success) {
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
    c.set("user_id", result.data.user_id);

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

      if (!userId) {
        const errorResponse: ErrorResponse = {
          error: "Authentication required",
          statusCode: 401,
          timestamp: new Date().toISOString(),
        };
        return c.json(errorResponse, 401);
      }

      // Get user data to check role (if roles are implemented in the future)
      const result = await shell.getUserById(sql, userId, userId);

      if (!result.success) {
        const errorResponse: ErrorResponse = {
          error: "User verification failed",
          statusCode: 403,
          timestamp: new Date().toISOString(),
        };
        return c.json(errorResponse, 403);
      }

      // TODO: Implement role checking when user roles are added to the schema
      // For now, all authenticated users have access

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
