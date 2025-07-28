import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { cors } from "hono/cors";

import * as shell from "./shell";

// Create router for administrative endpoints
export const administrativeRouter = new OpenAPIHono();

// Global middleware for all routes
administrativeRouter.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "https://viralkan.com"],
    credentials: true,
    allowMethods: ["GET", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

// --- Schema Definitions ---

const ProvinceSchema = z.object({
  code: z.string().openapi({
    example: "32",
    description: "Province code (2 digits)",
  }),
  name: z.string().openapi({
    example: "JAWA BARAT",
    description: "Province name",
  }),
});

const RegencySchema = z.object({
  code: z.string().openapi({
    example: "3273",
    description: "Regency/city code (4 digits)",
  }),
  name: z.string().openapi({
    example: "KOTA BANDUNG",
    description: "Regency/city name",
  }),
  province_code: z.string().openapi({
    example: "32",
    description: "Parent province code",
  }),
});

const DistrictSchema = z.object({
  code: z.string().openapi({
    example: "327301",
    description: "District code (6 digits)",
  }),
  name: z.string().openapi({
    example: "SUKASARI",
    description: "District name",
  }),
  regency_code: z.string().openapi({
    example: "3273",
    description: "Parent regency code",
  }),
});

const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.string().openapi({ example: "NOT_FOUND" }),
    message: z.string().openapi({ example: "Resource not found" }),
    timestamp: z.string().datetime().openapi({ example: "2024-01-15T10:30:00Z" }),
  }),
});

const SyncStatusSchema = z.object({
  provinces: z.number().openapi({ example: 38 }),
  regencies: z.number().openapi({ example: 514 }),
  districts: z.number().openapi({ example: 7024 }),
  lastSync: z.string().datetime().nullable().openapi({ 
    example: "2024-01-15T10:30:00Z",
    description: "Last sync timestamp, null if never synced"
  }),
});

// --- Route Definitions ---

const getProvincesRoute = createRoute({
  method: "get",
  path: "/provinces",
  summary: "Get all Indonesian provinces",
  description: "Returns all 38 provinces in Indonesia with their codes and names",
  tags: ["Administrative"],
  responses: {
    200: {
      description: "Successfully retrieved provinces",
      content: {
        "application/json": {
          schema: z.array(ProvinceSchema),
        },
      },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

const getRegenciesRoute = createRoute({
  method: "get",
  path: "/regencies/{provinceCode}",
  request: {
    params: z.object({
      provinceCode: z.string().length(2).regex(/^\d{2}$/).openapi({
        param: {
          name: "provinceCode",
          in: "path",
          required: true,
        },
        example: "32",
        description: "Province code (2 digits)",
      }),
    }),
  },
  summary: "Get regencies by province",
  description: "Returns all regencies/cities within a specific province",
  tags: ["Administrative"],
  responses: {
    200: {
      description: "Successfully retrieved regencies",
      content: {
        "application/json": {
          schema: z.array(RegencySchema),
        },
      },
    },
    400: {
      description: "Invalid province code",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    404: {
      description: "Province not found",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

const getDistrictsRoute = createRoute({
  method: "get",
  path: "/districts/{regencyCode}",
  request: {
    params: z.object({
      regencyCode: z.string().length(4).regex(/^\d{4}$/).openapi({
        param: {
          name: "regencyCode",
          in: "path",
          required: true,
        },
        example: "3273",
        description: "Regency code (4 digits)",
      }),
    }),
  },
  summary: "Get districts by regency",
  description: "Returns all districts within a specific regency/city",
  tags: ["Administrative"],
  responses: {
    200: {
      description: "Successfully retrieved districts",
      content: {
        "application/json": {
          schema: z.array(DistrictSchema),
        },
      },
    },
    400: {
      description: "Invalid regency code",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    404: {
      description: "Regency not found",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

const getSyncStatusRoute = createRoute({
  method: "get",
  path: "/sync-status",
  summary: "Get administrative data sync status",
  description: "Returns current state of administrative data in the database",
  tags: ["Administrative"],
  responses: {
    200: {
      description: "Successfully retrieved sync status",
      content: {
        "application/json": {
          schema: SyncStatusSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

// --- Route Handlers ---

administrativeRouter.openapi(getProvincesRoute, async (c) => {
  try {
    const result = await shell.getAllProvinces();

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
      result.statusCode as 500,
    );
  } catch (error) {
    console.error("Error fetching provinces:", error);
    return c.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch provinces",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  }
});

administrativeRouter.openapi(getRegenciesRoute, async (c) => {
  try {
    const { provinceCode } = c.req.valid("param");
    const result = await shell.getRegenciesByProvince(provinceCode);

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
    console.error("Error fetching regencies:", error);
    return c.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch regencies",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  }
});

administrativeRouter.openapi(getDistrictsRoute, async (c) => {
  try {
    const { regencyCode } = c.req.valid("param");
    const result = await shell.getDistrictsByRegency(regencyCode);

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
    console.error("Error fetching districts:", error);
    return c.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch districts",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  }
});

administrativeRouter.openapi(getSyncStatusRoute, async (c) => {
  try {
    const result = await shell.getSyncStatus();

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
      result.statusCode as 500,
    );
  } catch (error) {
    console.error("Error fetching sync status:", error);
    return c.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch sync status",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  }
});