import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { cors } from "hono/cors";

import { firebaseAuthMiddleware, requireAdmin } from "../auth";
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
  ReverseGeocodeRequestSchema,
  ForwardGeocodeRequestSchema,
} from "@/schema/reports";
import * as shell from "./shell";

type Env = {
  Variables: {
    user_id: string; // Changed from number to string (UUID v7)
  };
};

// Create router for reports
export const reportsRouter = new OpenAPIHono<Env>();

const getUserIdFromContext = (c: { get?: (key: string) => unknown }) =>
  typeof c.get === "function"
    ? (c.get("user_id") as string | undefined)
    : undefined;

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
  middleware: [firebaseAuthMiddleware],
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

const geocodingResponseSchema = z.object({
  street_name: z.string().nullable(),
  district: z.string().nullable(),
  city: z.string().nullable(),
  province: z.string().nullable(),
  province_code: z.string().nullable(),
  regency_code: z.string().nullable(),
  district_code: z.string().nullable(),
  lat: z.number().nullable(),
  lon: z.number().nullable(),
  geocoding_source: z.enum(["exif", "nominatim", "manual"]),
  geocoded_at: z.string().datetime(),
});

const reverseGeocodeRoute = createRoute({
  method: "post",
  path: "/geocode/reverse",
  request: {
    body: {
      content: {
        "application/json": {
          schema: ReverseGeocodeRequestSchema,
        },
      },
    },
  },
  summary: "Reverse geocode coordinates",
  description:
    "Convert coordinates into structured address fields using Nominatim",
  tags: ["Reports"],
  security: [{ bearerAuth: [] }],
  middleware: [firebaseAuthMiddleware],
  responses: {
    200: {
      description: "Reverse geocoding successful",
      content: { "application/json": { schema: geocodingResponseSchema } },
    },
    400: {
      description: "Invalid coordinates",
      content: { "application/json": { schema: ReportsErrorResponseSchema } },
    },
    404: {
      description: "No geocoding result found",
      content: { "application/json": { schema: ReportsErrorResponseSchema } },
    },
    502: {
      description: "Upstream geocoding failed",
      content: { "application/json": { schema: ReportsErrorResponseSchema } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: ReportsErrorResponseSchema } },
    },
  },
});

const forwardGeocodeRoute = createRoute({
  method: "post",
  path: "/geocode/forward",
  request: {
    body: {
      content: {
        "application/json": {
          schema: ForwardGeocodeRequestSchema,
        },
      },
    },
  },
  summary: "Forward geocode address",
  description:
    "Convert human-readable address into coordinates using Nominatim",
  tags: ["Reports"],
  security: [{ bearerAuth: [] }],
  middleware: [firebaseAuthMiddleware],
  responses: {
    200: {
      description: "Forward geocoding successful",
      content: { "application/json": { schema: geocodingResponseSchema } },
    },
    400: {
      description: "Invalid address",
      content: { "application/json": { schema: ReportsErrorResponseSchema } },
    },
    404: {
      description: "No geocoding result found",
      content: { "application/json": { schema: ReportsErrorResponseSchema } },
    },
    502: {
      description: "Upstream geocoding failed",
      content: { "application/json": { schema: ReportsErrorResponseSchema } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: ReportsErrorResponseSchema } },
    },
  },
});

const adminUpdateLocationSchema = CreateReportSchema.pick({
  street_name: true,
  location_text: true,
  district: true,
  city: true,
  province: true,
  province_code: true,
  regency_code: true,
  district_code: true,
  lat: true,
  lon: true,
}).partial();

const adminUpdateLocationRoute = createRoute({
  method: "put",
  path: "/{id}/admin/location",
  request: {
    params: ReportParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: adminUpdateLocationSchema,
        },
      },
    },
  },
  summary: "Admin update report location",
  description:
    "Admin-only endpoint to correct coordinates and address metadata",
  tags: ["Reports"],
  security: [{ bearerAuth: [] }],
  middleware: [firebaseAuthMiddleware, requireAdmin],
  responses: {
    200: {
      description: "Location updated successfully",
      content: {
        "application/json": { schema: z.object({ success: z.boolean() }) },
      },
    },
    400: {
      description: "Invalid data",
      content: { "application/json": { schema: ReportsErrorResponseSchema } },
    },
    401: {
      description: "User not authenticated",
      content: { "application/json": { schema: ReportsErrorResponseSchema } },
    },
    403: {
      description: "Not authorized",
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
  middleware: [firebaseAuthMiddleware],
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
  middleware: [firebaseAuthMiddleware],
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
  middleware: [firebaseAuthMiddleware],
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
  middleware: [firebaseAuthMiddleware],
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
  middleware: [firebaseAuthMiddleware],
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

const toGeocodingResponse = (data: {
  street_name?: string;
  district?: string;
  city?: string;
  province?: string;
  province_code?: string;
  regency_code?: string;
  district_code?: string;
  lat?: number;
  lon?: number;
  geocoding_source: "exif" | "nominatim" | "manual";
  geocoded_at: Date;
}) => ({
  street_name: data.street_name ?? null,
  district: data.district ?? null,
  city: data.city ?? null,
  province: data.province ?? null,
  province_code: data.province_code ?? null,
  regency_code: data.regency_code ?? null,
  district_code: data.district_code ?? null,
  lat: data.lat ?? null,
  lon: data.lon ?? null,
  geocoding_source: data.geocoding_source,
  geocoded_at: data.geocoded_at.toISOString(),
});

reportsRouter.openapi(testAuthRoute, async (c) => {
  try {
    const userId = getUserIdFromContext(c);

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

reportsRouter.openapi(reverseGeocodeRoute, async (c) => {
  try {
    const payload = c.req.valid("json");
    const result = await shell.reverseGeocodeLocation(payload);

    if (result.success) {
      return c.json(toGeocodingResponse(result.data), 200);
    }

    return c.json(
      {
        error: {
          code: "GEOCODING_ERROR",
          message: result.error,
          timestamp: new Date().toISOString(),
        },
      },
      (result.statusCode as 400 | 404 | 500 | 502 | undefined) ?? 500,
    );
  } catch (error) {
    console.error("Error in reverseGeocodeRoute:", error);
    return c.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to reverse geocode location",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  }
});

reportsRouter.openapi(forwardGeocodeRoute, async (c) => {
  try {
    const payload = c.req.valid("json");
    const result = await shell.forwardGeocodeLocation(payload);

    if (result.success) {
      return c.json(toGeocodingResponse(result.data), 200);
    }

    return c.json(
      {
        error: {
          code: result.statusCode === 404 ? "NOT_FOUND" : "GEOCODING_ERROR",
          message: result.error,
          timestamp: new Date().toISOString(),
        },
      },
      (result.statusCode as 400 | 404 | 500 | 502 | undefined) ?? 500,
    );
  } catch (error) {
    console.error("Error in forwardGeocodeRoute:", error);
    return c.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to forward geocode address",
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

reportsRouter.openapi(getMyReportsRoute, async (c) => {
  try {
    const userId = getUserIdFromContext(c);

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

reportsRouter.openapi(createReportRoute, async (c) => {
  try {
    const userId = getUserIdFromContext(c);

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

reportsRouter.openapi(updateReportRoute, async (c) => {
  try {
    const userId = getUserIdFromContext(c);

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

reportsRouter.openapi(adminUpdateLocationRoute, async (c) => {
  try {
    const userId = getUserIdFromContext(c);

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
    const result = await shell.adminUpdateReportLocation(
      paramData.id,
      updateData,
    );

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
                : "UPDATE_ERROR",
          message: result.error,
          timestamp: new Date().toISOString(),
        },
      },
      (result.statusCode as 400 | 401 | 403 | 404 | 500 | undefined) ?? 500,
    );
  } catch (error) {
    console.error("Error in adminUpdateLocationRoute:", error);
    return c.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to update report location",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  }
});

reportsRouter.openapi(deleteReportRoute, async (c) => {
  try {
    const userId = getUserIdFromContext(c);

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

reportsRouter.openapi(validateOwnershipRoute, async (c) => {
  try {
    const userId = getUserIdFromContext(c);

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
