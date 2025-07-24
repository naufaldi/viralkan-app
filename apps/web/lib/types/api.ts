// Shared API types and schemas for the frontend
import { z } from "zod";

// Re-export API schemas from the backend
// Note: In a real-world scenario, these would be imported from a shared package
// For now, we'll recreate them to ensure consistency

export const CreateReportSchema = z.object({
  image_url: z.string().url("Invalid image URL format"),
  category: z.enum(["berlubang", "retak", "lainnya"], {
    message: "Category must be berlubang, retak, or lainnya",
  }),
  street_name: z
    .string()
    .min(1, "Street name is required")
    .max(255, "Street name too long"),
  location_text: z
    .string()
    .min(1, "Location text is required")
    .max(500, "Location text too long"),
  lat: z.number().min(-90).max(90).optional(),
  lon: z.number().min(-180).max(180).optional(),
});

export const ReportResponseSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  image_url: z.string().url(),
  category: z.enum(["berlubang", "retak", "lainnya"]),
  street_name: z.string(),
  location_text: z.string(),
  lat: z.number().nullable(),
  lon: z.number().nullable(),
  status: z.enum(['pending', 'verified', 'rejected', 'deleted']),
  verified_at: z.string().datetime().nullable(),
  verified_by: z.string().nullable(),
  rejection_reason: z.string().nullable(),
  deleted_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
});

export const ReportWithUserResponseSchema = ReportResponseSchema.extend({
  user_name: z.string().nullable(),
  user_avatar: z.string().nullable(),
});

export const PaginatedReportsResponseSchema = z.object({
  items: z.array(ReportWithUserResponseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  pages: z.number(),
});

export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
    timestamp: z.string().datetime(),
  }),
});

// TypeScript types
export type CreateReportInput = z.infer<typeof CreateReportSchema>;
export type ReportResponse = z.infer<typeof ReportResponseSchema>;
export type ReportWithUser = z.infer<typeof ReportWithUserResponseSchema>;
export type PaginatedReports = z.infer<typeof PaginatedReportsResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// Category options with Indonesian labels
export const REPORT_CATEGORIES = [
  {
    value: "berlubang",
    label: "Berlubang",
    description: "Jalan yang berlubang atau bergelombang",
  },
  {
    value: "retak",
    label: "Retak",
    description: "Jalan yang retak atau pecah",
  },
  {
    value: "lainnya",
    label: "Lainnya",
    description: "Kerusakan jalan lainnya",
  },
] as const;

export type ReportCategory = (typeof REPORT_CATEGORIES)[number]["value"];
