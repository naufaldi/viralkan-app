import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { cors } from "hono/cors";

import { firebaseAuthMiddleware } from "../../middleware/auth";
import {
  CreateReportSchema,
  ReportQuerySchema,
  MyReportsQuerySchema,
  ReportParamsSchema,
  ReportResponseSchema,
  ReportWithUserResponseSchema,
  PaginatedReportsResponseSchema,
  PaginatedMyReportsResponseSchema,
  ReportsErrorResponseSchema,
} from "@/schema/reports";
import * as shell from "./shell";

type Env = {
  Variables: {
    user_id: string; // Changed from number to string (UUID v7)
  };
};

// Create router for reports
export const reportsRouter = new OpenAPIHono<Env>();

// Global middleware for all routes
reportsRouter.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "https://viral.faldi.xyz"],
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

// --- Route Definitions ---

// Simple test endpoint to check authentication
const testAuthRoute = createRoute({
  method: "get",
  path: "/test-auth",
  summary: "Test authentication",
  description: "Simple endpoint to test if authentication is working",
  tags: ["Reports"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Authentication successful",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            user_id: z.string(),
          }),
        },
      },
    },
    401: {
      description: "User not authenticated",
      content: { "application/json": { schema: ReportsErrorResponseSchema } },
    },
  },
});

// Simple test endpoint without authentication
const testNoAuthRoute = createRoute({
  method: "get",
  path: "/test-no-auth",
  summary: "Test without authentication",
  description: "Simple endpoint to test basic functionality",
  tags: ["Reports"],
  responses: {
    200: {
      description: "Test successful",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            timestamp: z.string(),
          }),
        },
      },
    },
  },
});

const getReportsRoute = createRoute({
  method: "get",
  path: "/",
  request: {
    query: ReportQuerySchema,
  },
  summary: "List all road damage reports",
  description: "Get all reports with pagination and filtering",
  tags: ["Reports"],
  responses: {
    200: {
      description: "Successfully retrieved paginated reports",
      content: {
        "application/json": { schema: PaginatedReportsResponseSchema },
      },
    },
    400: {
      description: "Invalid query parameters",
      content: { "application/json": { schema: ReportsErrorResponseSchema } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: ReportsErrorResponseSchema } },
    },
  },
});

const getEnrichedReportsRoute = createRoute({
  method: "get",
  path: "/enriched",
  request: {
    query: ReportQuerySchema,
  },
  summary: "List reports with additional user information",
  description: "Get reports with enriched user data",
  tags: ["Reports"],
  responses: {
    200: {
      description: "Successfully retrieved enriched reports",
      content: {
        "application/json": { schema: PaginatedReportsResponseSchema },
      },
    },
    400: {
      description: "Invalid query parameters",
      content: { "application/json": { schema: ReportsErrorResponseSchema } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: ReportsErrorResponseSchema } },
    },
  },
});

const getMyReportsRoute = createRoute({
  method: "get",
  path: "/me",
  request: {
    query: MyReportsQuerySchema,
  },
  summary: "Get my reports",
  description: "Get reports created by the authenticated user",
  tags: ["Reports"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Successfully retrieved user reports",
      content: {
        "application/json": { schema: PaginatedMyReportsResponseSchema },
      },
    },
    400: {
      description: "Invalid query parameters",
      content: { "application/json": { schema: ReportsErrorResponseSchema } },
    },
    401: {
      description: "User not authenticated",
      content: { "application/json": { schema: ReportsErrorResponseSchema } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: ReportsErrorResponseSchema } },
    },
  },
});

const getReportByIdRoute = createRoute({
  method: "get",
  path: "/{id}",
  request: {
    params: ReportParamsSchema,
  },
  summary: "Get report details",
  description: "Get a specific report by its ID",
  tags: ["Reports"],
  responses: {
    200: {
      description: "Successfully retrieved report",
      content: { "application/json": { schema: ReportWithUserResponseSchema } },
    },
    400: {
      description: "Invalid report ID",
      content: { "application/json": { schema: ReportsErrorResponseSchema } },
    },
    404: {
      description: "Report not found",
      content: { "application/json": { schema: ReportsErrorResponseSchema } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: ReportsErrorResponseSchema } },
    },
  },
});

const createReportRoute = createRoute({
  method: "post",
  path: "/",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateReportSchema,
        },
      },
    },
  },
  summary: "Create new report",
  description: "Create a new road damage report",
  tags: ["Reports"],
  security: [{ bearerAuth: [] }],
  responses: {
    201: {
      description: "Report created successfully",
      content: {
        "application/json": {
          schema: z.object({
            id: z.string(), // Changed from z.number() to z.string() (UUID v7)
            message: z.string(),
            success: z.boolean(),
          }),
        },
      },
    },
    400: {
      description: "Invalid request data",
      content: { "application/json": { schema: ReportsErrorResponseSchema } },
    },
    401: {
      description: "User not authenticated",
      content: { "application/json": { schema: ReportsErrorResponseSchema } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: ReportsErrorResponseSchema } },
    },
  },
});

const updateReportRoute = createRoute({
  method: "put",
  path: "/{id}",
  request: {
    params: ReportParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: CreateReportSchema.partial(),
        },
      },
    },
  },
  summary: "Update report",
  description: "Update an existing report (requires ownership)",
  tags: ["Reports"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Report updated successfully",
      content: { "application/json": { schema: ReportResponseSchema } },
    },
    400: {
      description: "Invalid request data",
      content: { "application/json": { schema: ReportsErrorResponseSchema } },
    },
    401: {
      description: "User not authenticated",
      content: { "application/json": { schema: ReportsErrorResponseSchema } },
    },
    403: {
      description: "Access forbidden - not the owner",
      content: { "application/json": { schema: ReportsErrorResponseSchema } },
    },
    404: {
      description: "Report not found",
      content: { "application/json": { schema: ReportsErrorResponseSchema } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: ReportsErrorResponseSchema } },
    },
  },
});

const deleteReportRoute = createRoute({
  method: "delete",
  path: "/{id}",
  request: {
    params: ReportParamsSchema,
  },
  summary: "Delete report",
  description: "Delete a report (requires ownership)",
  tags: ["Reports"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Report deleted successfully",
      content: {
        "application/json": { schema: z.object({ success: z.boolean() }) },
      },
    },
    400: {
      description: "Invalid report ID",
      content: { "application/json": { schema: ReportsErrorResponseSchema } },
    },
    401: {
      description: "User not authenticated",
      content: { "application/json": { schema: ReportsErrorResponseSchema } },
    },
    403: {
      description: "Access forbidden - not the owner",
      content: { "application/json": { schema: ReportsErrorResponseSchema } },
    },
    404: {
      description: "Report not found",
      content: { "application/json": { schema: ReportsErrorResponseSchema } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: ReportsErrorResponseSchema } },
    },
  },
});

const validateOwnershipRoute = createRoute({
  method: "get",
  path: "/{id}/ownership",
  request: {
    params: ReportParamsSchema,
  },
  summary: "Validate report ownership",
  description: "Check if the authenticated user owns the specified report",
  tags: ["Reports"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Ownership validation successful",
      content: {
        "application/json": {
          schema: z.object({
            canEdit: z.boolean(),
            report: ReportResponseSchema,
          }),
        },
      },
    },
    400: {
      description: "Invalid report ID",
      content: { "application/json": { schema: ReportsErrorResponseSchema } },
    },
    401: {
      description: "User not authenticated",
      content: { "application/json": { schema: ReportsErrorResponseSchema } },
    },
    403: {
      description: "Access forbidden - not the owner",
      content: { "application/json": { schema: ReportsErrorResponseSchema } },
    },
    404: {
      description: "Report not found",
      content: { "application/json": { schema: ReportsErrorResponseSchema } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: ReportsErrorResponseSchema } },
    },
  },
});

// --- Route Handlers ---

reportsRouter.openapi(testAuthRoute, firebaseAuthMiddleware, async (c) => {
  try {
    const userId = c.get("user_id");
    return c.json(
      { message: "Authentication successful", user_id: userId },
      200,
    );
  } catch (error) {
    console.error("Error in testAuthRoute:", error);
    return c.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to test authentication",
          timestamp: new Date().toISOString(),
        },
      },
      401,
    );
  }
});

reportsRouter.openapi(testNoAuthRoute, async (c) => {
  return c.json(
    { message: "Test successful", timestamp: new Date().toISOString() },
    200,
  );
});

reportsRouter.openapi(getReportsRoute, async (c) => {
  try {
    const queryData = c.req.valid("query");
    const result = await shell.getReportsWithPagination(queryData);

    if (result.success) {
      return c.json(result.data, 200);
    }

    return c.json(
      {
        error: {
          code: "FETCH_ERROR",
          message: result.error,
          timestamp: new Date().toISOString(),
        },
      },
      result.statusCode as 400 | 500,
    );
  } catch (error) {
    console.error("Error fetching reports:", error);
    return c.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch reports",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  }
});

reportsRouter.openapi(getEnrichedReportsRoute, async (c) => {
  try {
    const queryData = c.req.valid("query");
    const result = await shell.getReportsWithEnrichedData(queryData);

    if (result.success) {
      return c.json(result.data, 200);
    }

    return c.json(
      {
        error: {
          code: "FETCH_ERROR",
          message: result.error,
          timestamp: new Date().toISOString(),
        },
      },
      result.statusCode as 400 | 500,
    );
  } catch (error) {
    console.error("Error fetching enriched reports:", error);
    return c.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch enriched reports",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  }
});

reportsRouter.openapi(getMyReportsRoute, firebaseAuthMiddleware, async (c) => {
  try {
    const userId = c.get("user_id");

    if (!userId) {
      return c.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "User not authenticated",
            timestamp: new Date().toISOString(),
          },
        },
        401,
      );
    }

    const queryData = c.req.valid("query");
    const result = await shell.getUserReports(userId, queryData);

    if (result.success) {
      return c.json(result.data, 200);
    }

    return c.json(
      {
        error: {
          code: "FETCH_ERROR",
          message: result.error,
          timestamp: new Date().toISOString(),
        },
      },
      result.statusCode as 400 | 401 | 500,
    );
  } catch (error) {
    console.error("Error fetching user reports:", error);
    return c.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch user reports",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  }
});

reportsRouter.openapi(getReportByIdRoute, async (c) => {
  try {
    const paramData = c.req.valid("param");
    const result = await shell.getReportById(paramData);

    if (result.success) {
      return c.json(result.data, 200);
    }

    return c.json(
      {
        error: {
          code: result.statusCode === 404 ? "NOT_FOUND" : "FETCH_ERROR",
          message: result.error,
          timestamp: new Date().toISOString(),
        },
      },
      result.statusCode as 400 | 404 | 500,
    );
  } catch (error) {
    console.error("Error fetching report:", error);
    return c.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch report",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  }
});

reportsRouter.openapi(createReportRoute, firebaseAuthMiddleware, async (c) => {
  try {
    const userId = c.get("user_id");

    if (!userId) {
      return c.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "User not authenticated",
            timestamp: new Date().toISOString(),
          },
        },
        401,
      );
    }

    const reportData = c.req.valid("json");
    const result = await shell.createNewReport(userId, reportData);

    if (result.success) {
      return c.json(
        {
          id: result.data.id,
          message:
            "Laporan berhasil dibuat! Terima kasih telah melaporkan kerusakan jalan.",
          success: true,
        },
        201,
      );
    }

    return c.json(
      {
        error: {
          code: "CREATE_ERROR",
          message: result.error,
          timestamp: new Date().toISOString(),
        },
      },
      result.statusCode as 400 | 500,
    );
  } catch (error) {
    console.error("Error creating report:", error);
    return c.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create report",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  }
});

reportsRouter.openapi(updateReportRoute, firebaseAuthMiddleware, async (c) => {
  try {
    const userId = c.get("user_id");

    if (!userId) {
      return c.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "User not authenticated",
            timestamp: new Date().toISOString(),
          },
        },
        401,
      );
    }

    const paramData = c.req.valid("param");
    const updateData = c.req.valid("json");
    const result = await shell.updateExistingReport(
      paramData.id,
      userId,
      updateData,
    );

    if (result.success) {
      return c.json(result.data, 200);
    }

    return c.json(
      {
        error: {
          code:
            result.statusCode === 403
              ? "FORBIDDEN"
              : result.statusCode === 404
                ? "NOT_FOUND"
                : "UPDATE_ERROR",
          message: result.error,
          timestamp: new Date().toISOString(),
        },
      },
      result.statusCode as 400 | 401 | 403 | 404 | 500,
    );
  } catch (error) {
    console.error("Error updating report:", error);
    return c.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to update report",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  }
});

reportsRouter.openapi(deleteReportRoute, firebaseAuthMiddleware, async (c) => {
  try {
    const userId = c.get("user_id");

    if (!userId) {
      return c.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "User not authenticated",
            timestamp: new Date().toISOString(),
          },
        },
        401,
      );
    }

    const paramData = c.req.valid("param");
    const result = await shell.deleteExistingReport(paramData.id, userId);

    if (result.success) {
      return c.json({ success: true }, 200);
    }

    return c.json(
      {
        error: {
          code:
            result.statusCode === 403
              ? "FORBIDDEN"
              : result.statusCode === 404
                ? "NOT_FOUND"
                : "DELETE_ERROR",
          message: result.error,
          timestamp: new Date().toISOString(),
        },
      },
      result.statusCode as 400 | 401 | 403 | 404 | 500,
    );
  } catch (error) {
    console.error("Error deleting report:", error);
    return c.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to delete report",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  }
});

reportsRouter.openapi(validateOwnershipRoute, firebaseAuthMiddleware, async (c) => {
  try {
    const userId = c.get("user_id");

    if (!userId) {
      return c.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "User not authenticated",
            timestamp: new Date().toISOString(),
          },
        },
        401,
      );
    }

    const paramData = c.req.valid("param");
    const result = await shell.validateReportOwnership(paramData.id, userId);

    if (result.success) {
      return c.json({ canEdit: true, report: result.data }, 200);
    }

    return c.json(
      {
        error: {
          code:
            result.statusCode === 403
              ? "FORBIDDEN"
              : result.statusCode === 404
                ? "NOT_FOUND"
                : "VALIDATION_ERROR",
          message: result.error,
          timestamp: new Date().toISOString(),
        },
      },
      result.statusCode as 400 | 401 | 403 | 404 | 500,
    );
  } catch (error) {
    console.error("Error validating report ownership:", error);
    return c.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to validate report ownership",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  }
});
