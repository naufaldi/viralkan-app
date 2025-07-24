import { z } from "@hono/zod-openapi";

// Zod Schemas for Validation with OpenAPI metadata
export const CreateReportSchema = z.object({
  image_url: z.string().url("Invalid image URL format").openapi({
    example: "https://example.com/image.jpg",
    description: "URL of the uploaded report image",
  }),
  category: z.enum(["berlubang", "retak", "lainnya"]).openapi({
    example: "berlubang",
    description: "Type of road damage reported",
  }),
  street_name: z
    .string()
    .min(1, "Street name is required")
    .max(255, "Street name too long")
    .openapi({
      example: "Jalan Sudirman",
      description: "Name of the street where damage was reported",
    }),
  location_text: z
    .string()
    .min(1, "Location text is required")
    .max(500, "Location text too long")
    .openapi({
      example: "Depan Mall Tunjungan Plaza, sebelah kiri arah Surabaya",
      description: "Detailed description of the damage location",
    }),
  lat: z.number().min(-90).max(90).optional().openapi({
    example: -7.257472,
    description: "Latitude coordinate of the damage location",
  }),
  lon: z.number().min(-180).max(180).optional().openapi({
    example: 112.752088,
    description: "Longitude coordinate of the damage location",
  }),
});

export const ReportQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => Math.max(1, parseInt(val) || 1))
    .openapi({
      example: "1",
      description: "Page number for pagination (starts from 1)",
    }),
  limit: z
    .string()
    .optional()
    .default("20")
    .transform((val) => Math.min(100, Math.max(1, parseInt(val) || 20)))
    .openapi({
      example: "20",
      description: "Number of reports per page (max 100)",
    }),
  category: z.enum(["berlubang", "retak", "lainnya"]).optional().openapi({
    example: "berlubang",
    description: "Filter reports by damage category",
  }),
  user_id: z
    .string()
    .regex(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      "Invalid UUID format",
    )
    .optional()
    .openapi({
      example: "01890dd5-ea3f-7746-b3a5-e8c5e0b0f4a1",
      description: "Filter reports by user ID (UUID)",
    }),
});

// Schema for /me endpoint - doesn't include user_id validation
export const MyReportsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => Math.max(1, parseInt(val) || 1))
    .openapi({
      example: "1",
      description: "Page number for pagination (starts from 1)",
    }),
  limit: z
    .string()
    .optional()
    .default("20")
    .transform((val) => Math.min(100, Math.max(1, parseInt(val) || 20)))
    .openapi({
      example: "20",
      description: "Number of reports per page (max 100)",
    }),
  category: z.enum(["berlubang", "retak", "lainnya"]).optional().openapi({
    example: "berlubang",
    description: "Filter reports by damage category",
  }),
});

export const ReportParamsSchema = z.object({
  id: z
    .string()
    .regex(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      "Invalid UUID format",
    )
    .openapi({
      example: "01890dd5-ea3f-7746-b3a5-e8c5e0b0f4a1",
      description: "Unique identifier of the report (UUID v7)",
    }),
});

// Response Schemas
export const ReportResponseSchema = z.object({
  id: z
    .string()
    .regex(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      "Invalid UUID format",
    )
    .openapi({
      example: "01890dd5-ea3f-7746-b3a5-e8c5e0b0f4a1",
      description: "Report ID (UUID v7)",
    }),
  user_id: z
    .string()
    .regex(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      "Invalid UUID format",
    )
    .openapi({
      example: "01890dd5-1234-7746-b3a5-e8c5e0b0f4a1",
      description: "User ID (UUID v7)",
    }),
  image_url: z
    .string()
    .url()
    .openapi({ example: "https://example.com/image.jpg" }),
  category: z
    .enum(["berlubang", "retak", "lainnya"])
    .openapi({ example: "berlubang" }),
  street_name: z.string().openapi({ example: "Jalan Sudirman" }),
  location_text: z.string().openapi({ example: "Depan Mall Tunjungan Plaza" }),
  lat: z.number().nullable().openapi({ example: -7.257472 }),
  lon: z.number().nullable().openapi({ example: 112.752088 }),
  status: z
    .enum(["pending", "verified", "rejected", "deleted"])
    .openapi({ example: "pending" }),
  verified_at: z
    .string()
    .datetime()
    .nullable()
    .openapi({ example: "2024-01-15T10:30:00Z" }),
  verified_by: z
    .string()
    .regex(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      "Invalid UUID format",
    )
    .nullable()
    .openapi({ example: "01890dd5-1234-7746-b3a5-e8c5e0b0f4a1" }),
  rejection_reason: z.string().nullable().openapi({ example: "Invalid report" }),
  deleted_at: z
    .string()
    .datetime()
    .nullable()
    .openapi({ example: "2024-01-15T10:30:00Z" }),
  created_at: z
    .string()
    .datetime()
    .openapi({ example: "2024-01-15T10:30:00Z" }),
});

export const ReportWithUserResponseSchema = ReportResponseSchema.extend({
  user_name: z.string().nullable().openapi({ example: "John Doe" }),
  user_avatar: z
    .string()
    .nullable()
    .openapi({ example: "https://example.com/avatar.jpg" }),
});

export const PaginatedReportsResponseSchema = z.object({
  items: z.array(ReportWithUserResponseSchema),
  total: z.number().openapi({ example: 150 }),
  page: z.number().openapi({ example: 1 }),
  limit: z.number().openapi({ example: 20 }),
  pages: z.number().openapi({ example: 8 }),
});

export const ReportsErrorResponseSchema = z.object({
  error: z.object({
    code: z.string().openapi({ example: "VALIDATION_ERROR" }),
    message: z.string().openapi({ example: "Invalid request data" }),
    details: z.any().optional(),
    timestamp: z
      .string()
      .datetime()
      .openapi({ example: "2024-01-15T10:30:00Z" }),
  }),
});
