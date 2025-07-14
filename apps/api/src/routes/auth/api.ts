import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { cors } from "hono/cors";
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
    user_id: number;
  };
};

export const authRouter = new OpenAPIHono<Env>();

// CORS middleware
authRouter.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "https://viralkan.app"],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  }),
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
    return c.json({
      message: "Auth service is running",
      timestamp: new Date().toISOString(),
      status: "healthy",
    });
  } catch (error) {
    console.error("Health check error:", error);
    return c.json(
      {
        error: "Health check failed",
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
      500,
    );
  }
});

authRouter.openapi(verifyRoute, async (c) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json(
        {
          error: "Missing or invalid Authorization header",
          statusCode: 401,
          timestamp: new Date().toISOString(),
        },
        401,
      );
    }

    const idToken = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!idToken) {
      return c.json(
        {
          error: "ID token is required",
          statusCode: 401,
          timestamp: new Date().toISOString(),
        },
        401,
      );
    }

    // Use shell layer for business logic orchestration
    const result = await shell.verifyTokenAndGetUser(sql, idToken);

    if (result.success) {
      return c.json(result.data, 200);
    } else {
      return c.json(
        {
          error: result.error,
          statusCode: result.statusCode,
          timestamp: new Date().toISOString(),
        },
        result.statusCode as any,
      );
    }
  } catch (error) {
    console.error("Token verification endpoint error:", error);
    return c.json(
      {
        error: "Authentication failed",
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
      500,
    );
  }
});

authRouter.openapi(getMeRoute, async (c) => {
  try {
    const userId = c.get("user_id");

    if (!userId) {
      return c.json(
        {
          error: "Authentication required",
          statusCode: 401,
          timestamp: new Date().toISOString(),
        },
        401,
      );
    }

    // Use shell layer for business logic
    const result = await shell.getUserById(sql, userId, userId);

    if (result.success) {
      return c.json(result.data, 200);
    } else {
      return c.json(
        {
          error: result.error,
          statusCode: result.statusCode,
          timestamp: new Date().toISOString(),
        },
        result.statusCode as any,
      );
    }
  } catch (error) {
    console.error("Get user profile endpoint error:", error);
    return c.json(
      {
        error: "Failed to get user profile",
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
      500,
    );
  }
});

authRouter.openapi(getUserStatsRoute, async (c) => {
  try {
    const userId = c.get("user_id");

    if (!userId) {
      return c.json(
        {
          error: "Authentication required",
          statusCode: 401,
          timestamp: new Date().toISOString(),
        },
        401,
      );
    }

    // Use shell layer for business logic
    const result = await shell.getUserStats(sql, userId, userId);

    if (result.success) {
      return c.json(result.data, 200);
    } else {
      return c.json(
        {
          error: result.error,
          statusCode: result.statusCode,
          timestamp: new Date().toISOString(),
        },
        result.statusCode as any,
      );
    }
  } catch (error) {
    console.error("Get user stats endpoint error:", error);
    return c.json(
      {
        error: "Failed to get user statistics",
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
      500,
    );
  }
});

authRouter.openapi(logoutRoute, async (c) => {
  try {
    const userId = c.get("user_id");

    if (!userId) {
      return c.json(
        {
          error: "Authentication required",
          statusCode: 401,
          timestamp: new Date().toISOString(),
        },
        401,
      );
    }

    // Use shell layer for business logic
    const result = await shell.handleUserLogout(sql, userId);

    if (result.success) {
      return c.json(result.data, 200);
    } else {
      return c.json(
        {
          error: result.error,
          statusCode: result.statusCode,
          timestamp: new Date().toISOString(),
        },
        result.statusCode as any,
      );
    }
  } catch (error) {
    console.error("Logout endpoint error:", error);
    return c.json(
      {
        error: "Failed to process logout",
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
      500,
    );
  }
});
