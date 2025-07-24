/**
 * Admin API Layer
 * 
 * HTTP endpoints for admin functionality including:
 * - Admin statistics
 * - Report management (verify, reject, toggle, delete, restore)
 * - Reports listing with filters
 */

import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { requireAdmin } from "../auth/middleware";
import * as adminShell from "./shell";
import {
  AdminStatsResponseSchema,
  AdminReportsResponseSchema,
  AdminReportActionRequestSchema,
  AdminReportActionResponseSchema,
  AdminActionLogSchema,
} from "./types";

type Env = {
  Variables: {
    user_id: string;
  };
};

// Create admin router
export const adminRouter = new OpenAPIHono<Env>();

// Global middleware for all routes
adminRouter.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "https://viralkan.com"],
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

// --- Route Definitions ---

const getAdminStatsRoute = createRoute({
  method: "get",
  path: "/stats",
  middleware: [requireAdmin],
  summary: "Get admin statistics",
  description: "Get comprehensive dashboard statistics for admin",
  tags: ["Admin"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Successfully retrieved admin statistics",
      content: {
        "application/json": { schema: AdminStatsResponseSchema },
      },
    },
    401: {
      description: "User not authenticated",
      content: {
        "application/json": {
          schema: z.object({
            error: z.object({
              code: z.string(),
              message: z.string(),
              timestamp: z.string(),
            }),
          }),
        },
      },
    },
    403: {
      description: "Admin access required",
      content: {
        "application/json": {
          schema: z.object({
            error: z.object({
              code: z.string(),
              message: z.string(),
              timestamp: z.string(),
            }),
          }),
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: z.object({
            error: z.object({
              code: z.string(),
              message: z.string(),
              timestamp: z.string(),
            }),
          }),
        },
      },
    },
  },
});

const getAdminReportsRoute = createRoute({
  method: "get",
  path: "/reports",
  middleware: [requireAdmin],
  request: {
    query: z.object({
      page: z.string().optional().transform(val => parseInt(val || "1")),
      limit: z.string().optional().transform(val => parseInt(val || "20")),
      status: z.string().optional(),
      category: z.string().optional(),
      search: z.string().optional(),
    }),
  },
  summary: "Get admin reports list",
  description: "Get reports for admin management with filters and pagination",
  tags: ["Admin"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Successfully retrieved admin reports",
      content: {
        "application/json": { schema: AdminReportsResponseSchema },
      },
    },
    401: {
      description: "User not authenticated",
      content: {
        "application/json": {
          schema: z.object({
            error: z.object({
              code: z.string(),
              message: z.string(),
              timestamp: z.string(),
            }),
          }),
        },
      },
    },
    403: {
      description: "Admin access required",
      content: {
        "application/json": {
          schema: z.object({
            error: z.object({
              code: z.string(),
              message: z.string(),
              timestamp: z.string(),
            }),
          }),
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: z.object({
            error: z.object({
              code: z.string(),
              message: z.string(),
              timestamp: z.string(),
            }),
          }),
        },
      },
    },
  },
});

const verifyReportRoute = createRoute({
  method: "post",
  path: "/reports/{id}/verify",
  middleware: [requireAdmin],
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  summary: "Verify a report",
  description: "Verify a pending report as an admin",
  tags: ["Admin"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Report verified successfully",
      content: {
        "application/json": { schema: AdminReportActionResponseSchema },
      },
    },
    401: {
      description: "User not authenticated",
      content: {
        "application/json": {
          schema: z.object({
            error: z.object({
              code: z.string(),
              message: z.string(),
              timestamp: z.string(),
            }),
          }),
        },
      },
    },
    403: {
      description: "Admin access required",
      content: {
        "application/json": {
          schema: z.object({
            error: z.object({
              code: z.string(),
              message: z.string(),
              timestamp: z.string(),
            }),
          }),
        },
      },
    },
    404: {
      description: "Report not found",
      content: {
        "application/json": {
          schema: z.object({
            error: z.object({
              code: z.string(),
              message: z.string(),
              timestamp: z.string(),
            }),
          }),
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: z.object({
            error: z.object({
              code: z.string(),
              message: z.string(),
              timestamp: z.string(),
            }),
          }),
        },
      },
    },
  },
});

const rejectReportRoute = createRoute({
  method: "post",
  path: "/reports/{id}/reject",
  middleware: [requireAdmin],
  request: {
    params: z.object({
      id: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            reason: z.string().min(1, "Rejection reason is required"),
          }),
        },
      },
    },
  },
  summary: "Reject a report",
  description: "Reject a report with a reason",
  tags: ["Admin"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Report rejected successfully",
      content: {
        "application/json": { schema: AdminReportActionResponseSchema },
      },
    },
    400: {
      description: "Invalid request data",
      content: {
        "application/json": {
          schema: z.object({
            error: z.object({
              code: z.string(),
              message: z.string(),
              timestamp: z.string(),
            }),
          }),
        },
      },
    },
    401: {
      description: "User not authenticated",
      content: {
        "application/json": {
          schema: z.object({
            error: z.object({
              code: z.string(),
              message: z.string(),
              timestamp: z.string(),
            }),
          }),
        },
      },
    },
    403: {
      description: "Admin access required",
      content: {
        "application/json": {
          schema: z.object({
            error: z.object({
              code: z.string(),
              message: z.string(),
              timestamp: z.string(),
            }),
          }),
        },
      },
    },
    404: {
      description: "Report not found",
      content: {
        "application/json": {
          schema: z.object({
            error: z.object({
              code: z.string(),
              message: z.string(),
              timestamp: z.string(),
            }),
          }),
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: z.object({
            error: z.object({
              code: z.string(),
              message: z.string(),
              timestamp: z.string(),
            }),
          }),
        },
      },
    },
  },
});

const toggleReportStatusRoute = createRoute({
  method: "post",
  path: "/reports/{id}/toggle-status",
  middleware: [requireAdmin],
  request: {
    params: z.object({
      id: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            status: z.enum(["pending", "verified", "rejected"]),
          }),
        },
      },
    },
  },
  summary: "Toggle report status",
  description: "Change report status between pending, verified, and rejected",
  tags: ["Admin"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Report status changed successfully",
      content: {
        "application/json": { schema: AdminReportActionResponseSchema },
      },
    },
    400: {
      description: "Invalid request data",
      content: {
        "application/json": {
          schema: z.object({
            error: z.object({
              code: z.string(),
              message: z.string(),
              timestamp: z.string(),
            }),
          }),
        },
      },
    },
    401: {
      description: "User not authenticated",
      content: {
        "application/json": {
          schema: z.object({
            error: z.object({
              code: z.string(),
              message: z.string(),
              timestamp: z.string(),
            }),
          }),
        },
      },
    },
    403: {
      description: "Admin access required",
      content: {
        "application/json": {
          schema: z.object({
            error: z.object({
              code: z.string(),
              message: z.string(),
              timestamp: z.string(),
            }),
          }),
        },
      },
    },
    404: {
      description: "Report not found",
      content: {
        "application/json": {
          schema: z.object({
            error: z.object({
              code: z.string(),
              message: z.string(),
              timestamp: z.string(),
            }),
          }),
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: z.object({
            error: z.object({
              code: z.string(),
              message: z.string(),
              timestamp: z.string(),
            }),
          }),
        },
      },
    },
  },
});

const deleteReportRoute = createRoute({
  method: "post",
  path: "/reports/{id}/delete",
  middleware: [requireAdmin],
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  summary: "Soft delete a report",
  description: "Soft delete a report (sets status to deleted)",
  tags: ["Admin"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Report deleted successfully",
      content: {
        "application/json": { schema: AdminReportActionResponseSchema },
      },
    },
    401: {
      description: "User not authenticated",
      content: {
        "application/json": {
          schema: z.object({
            error: z.object({
              code: z.string(),
              message: z.string(),
              timestamp: z.string(),
            }),
          }),
        },
      },
    },
    403: {
      description: "Admin access required",
      content: {
        "application/json": {
          schema: z.object({
            error: z.object({
              code: z.string(),
              message: z.string(),
              timestamp: z.string(),
            }),
          }),
        },
      },
    },
    404: {
      description: "Report not found",
      content: {
        "application/json": {
          schema: z.object({
            error: z.object({
              code: z.string(),
              message: z.string(),
              timestamp: z.string(),
            }),
          }),
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: z.object({
            error: z.object({
              code: z.string(),
              message: z.string(),
              timestamp: z.string(),
            }),
          }),
        },
      },
    },
  },
});

const restoreReportRoute = createRoute({
  method: "post",
  path: "/reports/{id}/restore",
  middleware: [requireAdmin],
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  summary: "Restore a deleted report",
  description: "Restore a soft-deleted report to pending status",
  tags: ["Admin"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Report restored successfully",
      content: {
        "application/json": { schema: AdminReportActionResponseSchema },
      },
    },
    401: {
      description: "User not authenticated",
      content: {
        "application/json": {
          schema: z.object({
            error: z.object({
              code: z.string(),
              message: z.string(),
              timestamp: z.string(),
            }),
          }),
        },
      },
    },
    403: {
      description: "Admin access required",
      content: {
        "application/json": {
          schema: z.object({
            error: z.object({
              code: z.string(),
              message: z.string(),
              timestamp: z.string(),
            }),
          }),
        },
      },
    },
    404: {
      description: "Report not found",
      content: {
        "application/json": {
          schema: z.object({
            error: z.object({
              code: z.string(),
              message: z.string(),
              timestamp: z.string(),
            }),
          }),
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: z.object({
            error: z.object({
              code: z.string(),
              message: z.string(),
              timestamp: z.string(),
            }),
          }),
        },
      },
    },
  },
});

const getReportDetailRoute = createRoute({
  method: "get",
  path: "/reports/{id}",
  middleware: [requireAdmin],
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  summary: "Get report detail (admin view)",
  description: "Get detailed information about a specific report for admin",
  tags: ["Admin"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Successfully retrieved report detail",
      content: {
        "application/json": {
          schema: AdminReportsResponseSchema.shape.items.element,
        },
      },
    },
    401: {
      description: "User not authenticated",
      content: {
        "application/json": {
          schema: z.object({
            error: z.object({
              code: z.string(),
              message: z.string(),
              timestamp: z.string(),
            }),
          }),
        },
      },
    },
    403: {
      description: "Admin access required",
      content: {
        "application/json": {
          schema: z.object({
            error: z.object({
              code: z.string(),
              message: z.string(),
              timestamp: z.string(),
            }),
          }),
        },
      },
    },
    404: {
      description: "Report not found",
      content: {
        "application/json": {
          schema: z.object({
            error: z.object({
              code: z.string(),
              message: z.string(),
              timestamp: z.string(),
            }),
          }),
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: z.object({
            error: z.object({
              code: z.string(),
              message: z.string(),
              timestamp: z.string(),
            }),
          }),
        },
      },
    },
  },
});

const healthCheckRoute = createRoute({
  method: "get",
  path: "/health",
  middleware: [requireAdmin],
  summary: "Admin health check",
  description: "Health check endpoint for admin routes",
  tags: ["Admin"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Admin API is healthy",
      content: {
        "application/json": {
          schema: z.object({
            status: z.string(),
            timestamp: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    401: {
      description: "User not authenticated",
      content: {
        "application/json": {
          schema: z.object({
            error: z.object({
              code: z.string(),
              message: z.string(),
              timestamp: z.string(),
            }),
          }),
        },
      },
    },
    403: {
      description: "Admin access required",
      content: {
        "application/json": {
          schema: z.object({
            error: z.object({
              code: z.string(),
              message: z.string(),
              timestamp: z.string(),
            }),
          }),
        },
      },
    },
  },
});

// --- Route Handlers ---

adminRouter.openapi(getAdminStatsRoute, async (c) => {
  try {
    const result = await adminShell.getAdminStats();
    
    if (result.success) {
      return c.json(result.data, 200);
    }

    return c.json(
      {
        error: {
          code: "FETCH_ERROR",
          message: result.error || "Failed to get admin statistics",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  } catch (error) {
    console.error("Error getting admin stats:", error);
    return c.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to get admin statistics",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  }
});

adminRouter.openapi(getAdminReportsRoute, async (c) => {
  try {
    const queryData = c.req.valid("query");
    const result = await adminShell.getAdminReports(queryData);
    
    if (result.success) {
      return c.json(result.data, 200);
    }

    return c.json(
      {
        error: {
          code: "FETCH_ERROR",
          message: result.error || "Failed to get admin reports",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  } catch (error) {
    console.error("Error getting admin reports:", error);
    return c.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to get admin reports",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  }
});

adminRouter.openapi(verifyReportRoute, async (c) => {
  try {
    const paramData = c.req.valid("param");
    const adminUserId = c.get("user_id");
    
    const result = await adminShell.verifyReport(paramData.id, adminUserId);
    
    if (result.success) {
      return c.json(result.data, 200);
    }

    return c.json(
      {
        error: {
          code: result.statusCode === 404 ? "NOT_FOUND" : "ACTION_ERROR",
          message: result.error || "Failed to verify report",
          timestamp: new Date().toISOString(),
        },
      },
      result.statusCode as 400 | 404 | 500,
    );
  } catch (error) {
    console.error("Error verifying report:", error);
    return c.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to verify report",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  }
});

adminRouter.openapi(rejectReportRoute, async (c) => {
  try {
    const paramData = c.req.valid("param");
    const bodyData = c.req.valid("json");
    const adminUserId = c.get("user_id");
    
    const result = await adminShell.rejectReport(paramData.id, adminUserId, bodyData.reason);
    
    if (result.success) {
      return c.json(result.data, 200);
    }

    return c.json(
      {
        error: {
          code: result.statusCode === 404 ? "NOT_FOUND" : "ACTION_ERROR",
          message: result.error,
          timestamp: new Date().toISOString(),
        },
      },
      result.statusCode as 400 | 404 | 500,
    );
  } catch (error) {
    console.error("Error rejecting report:", error);
    return c.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to reject report",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  }
});

adminRouter.openapi(toggleReportStatusRoute, async (c) => {
  try {
    const paramData = c.req.valid("param");
    const bodyData = c.req.valid("json");
    const adminUserId = c.get("user_id");
    
    const result = await adminShell.toggleReportStatus(paramData.id, adminUserId, bodyData.status);
    
    if (result.success) {
      return c.json(result.data, 200);
    }

    return c.json(
      {
        error: {
          code: result.statusCode === 404 ? "NOT_FOUND" : "ACTION_ERROR",
          message: result.error,
          timestamp: new Date().toISOString(),
        },
      },
      result.statusCode as 400 | 404 | 500,
    );
  } catch (error) {
    console.error("Error toggling report status:", error);
    return c.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to toggle report status",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  }
});

adminRouter.openapi(deleteReportRoute, async (c) => {
  try {
    const paramData = c.req.valid("param");
    const adminUserId = c.get("user_id");
    
    const result = await adminShell.softDeleteReport(paramData.id, adminUserId);
    
    if (result.success) {
      return c.json(result.data, 200);
    }

    return c.json(
      {
        error: {
          code: result.statusCode === 404 ? "NOT_FOUND" : "ACTION_ERROR",
          message: result.error,
          timestamp: new Date().toISOString(),
        },
      },
      result.statusCode as 400 | 404 | 500,
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

adminRouter.openapi(restoreReportRoute, async (c) => {
  try {
    const paramData = c.req.valid("param");
    const adminUserId = c.get("user_id");
    
    const result = await adminShell.restoreReport(paramData.id, adminUserId);
    
    if (result.success) {
      return c.json(result.data, 200);
    }

    return c.json(
      {
        error: {
          code: result.statusCode === 404 ? "NOT_FOUND" : "ACTION_ERROR",
          message: result.error,
          timestamp: new Date().toISOString(),
        },
      },
      result.statusCode as 400 | 404 | 500,
    );
  } catch (error) {
    console.error("Error restoring report:", error);
    return c.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to restore report",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  }
});

adminRouter.openapi(getReportDetailRoute, async (c) => {
  try {
    const paramData = c.req.valid("param");
    
    // Get single report with user information
    const result = await adminShell.getAdminReports({
      page: 1,
      limit: 1,
    });
    
    if (!result.success) {
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
    }
    
    const report = result.data?.items.find(r => r.id === paramData.id);
    
    if (!report) {
      return c.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Report not found",
            timestamp: new Date().toISOString(),
          },
        },
        404,
      );
    }
    
    return c.json(report, 200);
  } catch (error) {
    console.error("Error getting report detail:", error);
    return c.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to get report detail",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  }
});

adminRouter.openapi(healthCheckRoute, async (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    message: "Admin API is operational",
  }, 200);
}); 