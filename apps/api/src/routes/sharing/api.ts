import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { cors } from "hono/cors";

import { firebaseAuthMiddleware, requireAdmin } from "../auth";
import {
  TrackShareSchema,
  GenerateCaptionSchema,
  GenerateAICaptionSchema,
  ShareAnalyticsQuerySchema,
  SharingReportParamsSchema,
  ShareTrackingResponseSchema,
  CaptionResponseSchema,
  AICaptionResponseSchema,
  ShareAnalyticsResponseSchema,
  ReportShareDetailsResponseSchema,
  ShareValidationResponseSchema,
  MostSharedReportsResponseSchema,
  SharingErrorResponseSchema,
} from "@/schema/sharing";
import * as shell from "./shell";
import { AVAILABLE_TONES } from "./types";

type Env = {
  Variables: {
    user_id: string;
  };
};

// Create router for sharing functionality
export const sharingRouter = new OpenAPIHono<Env>();

// Global middleware for all routes
sharingRouter.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "https://viral.faldi.xyz"],
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

// --- Route Definitions ---

// Track share event
const trackShareRoute = createRoute({
  method: "post",
  path: "/{id}/share",
  request: {
    params: SharingReportParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: TrackShareSchema,
        },
      },
    },
  },
  summary: "Track report share",
  description: "Increment share count for a report and record the share event",
  tags: ["Sharing"],
  responses: {
    200: {
      description: "Share tracked successfully",
      content: {
        "application/json": { schema: ShareTrackingResponseSchema },
      },
    },
    400: {
      description: "Invalid request data",
      content: { "application/json": { schema: SharingErrorResponseSchema } },
    },
    404: {
      description: "Report not found or not eligible for sharing",
      content: { "application/json": { schema: SharingErrorResponseSchema } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: SharingErrorResponseSchema } },
    },
  },
});

// Generate caption for sharing (template-based) - DEPRECATED: Use AI caption generation instead
const generateCaptionRoute = createRoute({
  method: "post",
  path: "/{id}/generate-caption",
  request: {
    params: SharingReportParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: GenerateCaptionSchema,
        },
      },
    },
  },
  summary: "Generate sharing caption (template-based) - DEPRECATED",
  description:
    "DEPRECATED: Use /{id}/generate-ai-caption instead. This endpoint is kept for backward compatibility.",
  tags: ["Sharing", "Deprecated"],
  responses: {
    200: {
      description: "Caption generated successfully",
      content: {
        "application/json": { schema: CaptionResponseSchema },
      },
    },
    400: {
      description: "Invalid request data",
      content: { "application/json": { schema: SharingErrorResponseSchema } },
    },
    404: {
      description: "Report not found or not eligible for sharing",
      content: { "application/json": { schema: SharingErrorResponseSchema } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: SharingErrorResponseSchema } },
    },
  },
});

// Generate AI-powered caption for sharing
const generateAICaptionRoute = createRoute({
  method: "post",
  path: "/{id}/generate-ai-caption",
  request: {
    params: SharingReportParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: GenerateAICaptionSchema,
        },
      },
    },
  },
  summary: "Generate AI-powered sharing caption",
  description:
    "Generate a context-aware caption using AI for social media sharing",
  tags: ["Sharing", "AI"],
  responses: {
    200: {
      description: "AI caption generated successfully",
      content: {
        "application/json": { schema: AICaptionResponseSchema },
      },
    },
    400: {
      description: "Invalid request data",
      content: { "application/json": { schema: SharingErrorResponseSchema } },
    },
    404: {
      description: "Report not found or not eligible for sharing",
      content: { "application/json": { schema: SharingErrorResponseSchema } },
    },
    500: {
      description: "Internal server error or AI service unavailable",
      content: { "application/json": { schema: SharingErrorResponseSchema } },
    },
  },
});

// Get share analytics (admin only)
const getShareAnalyticsRoute = createRoute({
  method: "get",
  path: "/analytics",
  request: {
    query: ShareAnalyticsQuerySchema,
  },
  middleware: [requireAdmin],
  summary: "Get sharing analytics",
  description: "Retrieve sharing statistics and analytics (admin only)",
  tags: ["Sharing", "Analytics"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Analytics retrieved successfully",
      content: {
        "application/json": { schema: ShareAnalyticsResponseSchema },
      },
    },
    400: {
      description: "Invalid query parameters",
      content: { "application/json": { schema: SharingErrorResponseSchema } },
    },
    401: {
      description: "User not authenticated",
      content: { "application/json": { schema: SharingErrorResponseSchema } },
    },
    403: {
      description: "Insufficient permissions (admin required)",
      content: { "application/json": { schema: SharingErrorResponseSchema } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: SharingErrorResponseSchema } },
    },
  },
});

// Get report share details
const getReportShareDetailsRoute = createRoute({
  method: "get",
  path: "/{id}/details",
  request: {
    params: SharingReportParamsSchema,
  },
  summary: "Get report share details",
  description: "Get detailed sharing information for a specific report",
  tags: ["Sharing"],
  responses: {
    200: {
      description: "Share details retrieved successfully",
      content: {
        "application/json": { schema: ReportShareDetailsResponseSchema },
      },
    },
    404: {
      description: "Report not found",
      content: { "application/json": { schema: SharingErrorResponseSchema } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: SharingErrorResponseSchema } },
    },
  },
});

// Validate report for sharing
const validateReportSharingRoute = createRoute({
  method: "get",
  path: "/{id}/validate",
  request: {
    params: SharingReportParamsSchema,
  },
  summary: "Validate report for sharing",
  description: "Check if a report is eligible for sharing",
  tags: ["Sharing"],
  responses: {
    200: {
      description: "Validation completed",
      content: {
        "application/json": { schema: ShareValidationResponseSchema },
      },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: SharingErrorResponseSchema } },
    },
  },
});

// Get available tones
const getAvailableTonesRoute = createRoute({
  method: "get",
  path: "/tones",
  summary: "Get available caption tones",
  description: "Retrieve all available caption tones with their metadata",
  tags: ["Sharing", "Configuration"],
  responses: {
    200: {
      description: "Available tones retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            tones: z.array(
              z.object({
                value: z.string(),
                label: z.string(),
                description: z.string(),
                icon: z.string(),
              }),
            ),
          }),
        },
      },
    },
  },
});

// Get most shared reports
const getMostSharedReportsRoute = createRoute({
  method: "get",
  path: "/most-shared",
  request: {
    query: z.object({
      limit: z
        .string()
        .optional()
        .default("10")
        .transform((val) => Math.min(100, Math.max(1, parseInt(val) || 10)))
        .openapi({
          example: "10",
          description: "Number of reports to return (max 100)",
        }),
      startDate: z.string().datetime().optional().openapi({
        example: "2024-01-01T00:00:00Z",
        description: "Start date for timeframe filter (ISO 8601 format)",
      }),
      endDate: z.string().datetime().optional().openapi({
        example: "2024-01-31T23:59:59Z",
        description: "End date for timeframe filter (ISO 8601 format)",
      }),
    }),
  },
  summary: "Get most shared reports",
  description:
    "Retrieve the most shared reports, optionally filtered by timeframe",
  tags: ["Sharing"],
  responses: {
    200: {
      description: "Most shared reports retrieved successfully",
      content: {
        "application/json": { schema: MostSharedReportsResponseSchema },
      },
    },
    400: {
      description: "Invalid query parameters",
      content: { "application/json": { schema: SharingErrorResponseSchema } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: SharingErrorResponseSchema } },
    },
  },
});

// --- Route Handlers ---

// Track share handler
sharingRouter.openapi(trackShareRoute, async (c) => {
  try {
    const { id } = c.req.valid("param");
    const shareRequest = c.req.valid("json");

    // Get optional user context (if authenticated)
    const userId = c.get("user_id");

    // Get client information for analytics
    const ipAddress =
      c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for");
    const userAgent = c.req.header("user-agent");

    const result = await shell.trackReportShare(
      id,
      shareRequest,
      userId,
      ipAddress,
      userAgent,
    );

    if (result.success) {
      return c.json(result.data, 200);
    }

    // Map status codes to expected OpenAPI responses
    const statusCode =
      result.statusCode === 404 ? 404 : result.statusCode === 400 ? 400 : 500;

    return c.json(
      {
        error: {
          code: "SHARE_TRACKING_FAILED",
          message: result.error,
          timestamp: new Date().toISOString(),
        },
      },
      statusCode,
    );
  } catch (error) {
    console.error("Error in track share handler:", error);
    return c.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to track share",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  }
});

// Generate caption handler (template-based)
sharingRouter.openapi(generateCaptionRoute, async (c) => {
  try {
    const { id } = c.req.valid("param");
    const captionRequest = c.req.valid("json");

    const result = await shell.generateReportCaption(id, captionRequest);

    if (result.success) {
      return c.json(result.data, 200);
    }

    // Map status codes to expected OpenAPI responses
    const statusCode =
      result.statusCode === 404 ? 404 : result.statusCode === 400 ? 400 : 500;

    return c.json(
      {
        error: {
          code: "CAPTION_GENERATION_FAILED",
          message: result.error,
          timestamp: new Date().toISOString(),
        },
      },
      statusCode,
    );
  } catch (error) {
    console.error("Error in generate caption handler:", error);
    return c.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to generate caption",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  }
});

// Generate AI caption handler
sharingRouter.openapi(generateAICaptionRoute, async (c) => {
  try {
    const { id } = c.req.valid("param");
    const captionRequest = c.req.valid("json");

    const result = await shell.generateAIReportCaption(id, captionRequest);

    if (result.success) {
      return c.json(result.data, 200);
    }

    // Map status codes to expected OpenAPI responses
    const statusCode =
      result.statusCode === 404 ? 404 : result.statusCode === 400 ? 400 : 500;

    return c.json(
      {
        error: {
          code: "AI_CAPTION_GENERATION_FAILED",
          message: result.error,
          timestamp: new Date().toISOString(),
        },
      },
      statusCode,
    );
  } catch (error) {
    console.error("Error in AI caption generation handler:", error);
    return c.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to generate AI caption",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  }
});

// Share analytics handler (admin only)
sharingRouter.openapi(getShareAnalyticsRoute, async (c) => {
  try {
    const query = c.req.valid("query");

    const filters = {
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      platform: query.platform,
    };

    const result = await shell.getShareAnalytics(filters);

    if (result.success) {
      return c.json(result.data, 200);
    }

    // Map status codes to expected OpenAPI responses
    const statusCode =
      result.statusCode === 403
        ? 403
        : result.statusCode === 401
          ? 401
          : result.statusCode === 400
            ? 400
            : 500;

    return c.json(
      {
        error: {
          code: "ANALYTICS_FAILED",
          message: result.error,
          timestamp: new Date().toISOString(),
        },
      },
      statusCode,
    );
  } catch (error) {
    console.error("Error in share analytics handler:", error);
    return c.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch analytics",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  }
});

// Report share details handler
sharingRouter.openapi(getReportShareDetailsRoute, async (c) => {
  try {
    const { id } = c.req.valid("param");

    const result = await shell.getReportShareDetails(id);

    if (result.success) {
      return c.json(result.data, 200);
    }

    // Map status codes to expected OpenAPI responses
    const statusCode = result.statusCode === 404 ? 404 : 500;

    return c.json(
      {
        error: {
          code: "SHARE_DETAILS_FAILED",
          message: result.error,
          timestamp: new Date().toISOString(),
        },
      },
      statusCode,
    );
  } catch (error) {
    console.error("Error in share details handler:", error);
    return c.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch share details",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  }
});

// Validate report sharing handler
sharingRouter.openapi(validateReportSharingRoute, async (c) => {
  try {
    const { id } = c.req.valid("param");

    const result = await shell.validateReportForSharing(id);

    if (result.success) {
      return c.json(result.data, 200);
    }

    return c.json(
      {
        error: {
          code: "VALIDATION_FAILED",
          message: result.error,
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  } catch (error) {
    console.error("Error in validate sharing handler:", error);
    return c.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to validate report",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  }
});

// Most shared reports handler
sharingRouter.openapi(getMostSharedReportsRoute, async (c) => {
  try {
    const query = c.req.valid("query");

    const timeframe =
      query.startDate && query.endDate
        ? {
            start: new Date(query.startDate),
            end: new Date(query.endDate),
          }
        : undefined;

    const result = await shell.getMostSharedReports(query.limit, timeframe);

    if (result.success) {
      return c.json(result.data, 200);
    }

    // Map status codes to expected OpenAPI responses
    const statusCode = result.statusCode === 400 ? 400 : 500;

    return c.json(
      {
        error: {
          code: "MOST_SHARED_FAILED",
          message: result.error,
          timestamp: new Date().toISOString(),
        },
      },
      statusCode,
    );
  } catch (error) {
    console.error("Error in most shared reports handler:", error);
    return c.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch most shared reports",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  }
});

// Available tones handler
sharingRouter.openapi(getAvailableTonesRoute, async (c) => {
  return c.json({ tones: AVAILABLE_TONES }, 200);
});
