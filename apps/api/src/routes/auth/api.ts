import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { sql } from "../../db/connection";
import * as shell from "./shell";
import {
  AuthVerificationResponseSchema,
  ErrorResponseSchema,
  LogoutResponseSchema,
  UserResponseSchema,
  UserStatsResponseSchema,
} from "@/schema/auth";
import { firebaseAuthMiddleware } from "./middleware";

type Env = {
  Variables: {
    user_id: string; // Changed from number to string (UUID v7)
  };
};

export const authRouter = new OpenAPIHono<Env>();

type AuthErrorStatus = 401 | 404 | 500;

const authErrorResponse = (c: any, status: AuthErrorStatus, message: string) =>
  c.json(
    {
      error: message,
      statusCode: status,
      timestamp: new Date().toISOString(),
    },
    status,
  );

// --- Route Definitions ---

const healthRoute = createRoute({
  method: "get",
  path: "/health",
  summary: "Health check",
  description: "Check if the authentication service is running",
  tags: ["Auth"],
  responses: {
    200: {
      description: "Service is healthy",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            timestamp: z.string(),
            status: z.string(),
          }),
        },
      },
    },
    500: {
      description: "Service is unhealthy",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

const verifyRoute = createRoute({
  method: "post",
  path: "/verify",
  summary: "Verify Firebase token",
  description: "Verify Firebase ID token and authenticate user",
  tags: ["Auth"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Token verified successfully",
      content: {
        "application/json": { schema: AuthVerificationResponseSchema },
      },
    },
    401: {
      description: "Invalid or expired token",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    500: {
      description: "Authentication service error",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

const getMeRoute = createRoute({
  method: "get",
  path: "/me",
  summary: "Get user profile",
  description: "Get current authenticated user profile",
  tags: ["Auth"],
  security: [{ bearerAuth: [] }],
  middleware: [firebaseAuthMiddleware],
  responses: {
    200: {
      description: "User profile retrieved successfully",
      content: { "application/json": { schema: UserResponseSchema } },
    },
    401: {
      description: "User not authenticated",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    404: {
      description: "User profile not found",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

const getUserStatsRoute = createRoute({
  method: "get",
  path: "/me/stats",
  summary: "Get user statistics",
  description: "Get current user statistics and activity summary",
  tags: ["Auth"],
  security: [{ bearerAuth: [] }],
  middleware: [firebaseAuthMiddleware],
  responses: {
    200: {
      description: "User statistics retrieved successfully",
      content: { "application/json": { schema: UserStatsResponseSchema } },
    },
    401: {
      description: "User not authenticated",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    404: {
      description: "User not found",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

const logoutRoute = createRoute({
  method: "post",
  path: "/logout",
  summary: "Logout user",
  description: "Logout current user (client-side token cleanup required)",
  tags: ["Auth"],
  security: [{ bearerAuth: [] }],
  middleware: [firebaseAuthMiddleware],
  responses: {
    200: {
      description: "Logout processed successfully",
      content: { "application/json": { schema: LogoutResponseSchema } },
    },
    401: {
      description: "User not authenticated",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

// --- Route Handlers ---

authRouter.openapi(healthRoute, async (c) => {
  try {
    return c.json(
      {
        message: "Auth service is running",
        timestamp: new Date().toISOString(),
        status: "healthy",
      },
      200,
    );
  } catch (error) {
    console.error("Health check error:", error);
    return authErrorResponse(c, 500, "Health check failed");
  }
});

authRouter.openapi(verifyRoute, async (c) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return authErrorResponse(
        c,
        401,
        "Missing or invalid Authorization header",
      );
    }

    const idToken = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!idToken) {
      return authErrorResponse(c, 401, "ID token is required");
    }

    // Use shell layer for business logic orchestration
    const result = await shell.verifyTokenAndGetUser(sql, idToken);

    if (result.success) {
      return c.json(result.data, 200);
    } else {
      const status = (result.statusCode ?? 500) as AuthErrorStatus;
      return authErrorResponse(c, status, result.error);
    }
  } catch (error) {
    console.error("Token verification endpoint error:", error);
    return authErrorResponse(c, 500, "Authentication failed");
  }
});

authRouter.openapi(getMeRoute, async (c) => {
  try {
    const userId = c.get("user_id");

    if (!userId) {
      return authErrorResponse(c, 401, "Authentication required");
    }

    // Use shell layer for business logic
    const result = await shell.getUserById(sql, userId, userId);

    if (result.success) {
      return c.json(result.data, 200);
    } else {
      const status = (result.statusCode ?? 500) as AuthErrorStatus;
      return authErrorResponse(c, status, result.error);
    }
  } catch (error) {
    console.error("Get user profile endpoint error:", error);
    return authErrorResponse(c, 500, "Failed to get user profile");
  }
});

authRouter.openapi(getUserStatsRoute, async (c) => {
  try {
    const userId = c.get("user_id");

    if (!userId) {
      return authErrorResponse(c, 401, "Authentication required");
    }

    // Use shell layer for business logic
    const result = await shell.getUserStats(sql, userId, userId);

    if (result.success) {
      return c.json(result.data, 200);
    } else {
      const status = (result.statusCode ?? 500) as AuthErrorStatus;
      return authErrorResponse(c, status, result.error);
    }
  } catch (error) {
    console.error("Get user stats endpoint error:", error);
    return authErrorResponse(c, 500, "Failed to get user statistics");
  }
});

authRouter.openapi(logoutRoute, async (c) => {
  try {
    const userId = c.get("user_id");

    if (!userId) {
      return authErrorResponse(c, 401, "Authentication required");
    }

    // Use shell layer for business logic
    const result = await shell.handleUserLogout(sql, userId);

    if (result.success) {
      return c.json(result.data, 200);
    } else {
      const status = (result.statusCode ?? 500) as AuthErrorStatus;
      return authErrorResponse(c, status, result.error);
    }
  } catch (error) {
    console.error("Logout endpoint error:", error);
    return authErrorResponse(c, 500, "Failed to process logout");
  }
});
