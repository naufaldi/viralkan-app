import { z } from "zod";

// Admin Statistics Response
export const AdminStatsResponseSchema = z.object({
  totalReports: z.number(),
  pendingCount: z.number(),
  verifiedCount: z.number(),
  rejectedCount: z.number(),
  deletedCount: z.number(),
  totalUsers: z.number(),
  adminUsers: z.number(),
  verificationRate: z.number(), // reports per day
  averageVerificationTime: z.number(), // in hours
  recentActivity: z.array(
    z.object({
      action: z.string(),
      timestamp: z.string(),
      adminUser: z.string(),
    }),
  ),
});

// Admin Reports Response
export const AdminReportsResponseSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      user_id: z.string(),
      image_url: z.string(),
      category: z.string(),
      street_name: z.string(),
      location_text: z.string(),
      lat: z.number().nullable(),
      lon: z.number().nullable(),
      status: z.enum(["pending", "verified", "rejected", "deleted"]),
      verified_at: z.string().nullable(),
      verified_by: z.string().nullable(),
      rejection_reason: z.string().nullable(),
      deleted_at: z.string().nullable(),
      created_at: z.string(),
      user: z
        .object({
          id: z.string(),
          name: z.string(),
          email: z.string(),
        })
        .optional(),
    }),
  ),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

// Admin Report Action Request
export const AdminReportActionRequestSchema = z.object({
  reason: z.string().optional(),
  status: z.enum(["pending", "verified", "rejected", "deleted"]).optional(),
});

// Admin Report Action Response
export const AdminReportActionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  report: z.object({
    id: z.string(),
    status: z.string(),
    verified_at: z.string().nullable(),
    verified_by: z.string().nullable(),
    rejection_reason: z.string().nullable(),
    deleted_at: z.string().nullable(),
  }),
});

// Admin Action Log
export const AdminActionLogSchema = z.object({
  id: z.string(),
  admin_user_id: z.string(),
  action_type: z.string(),
  target_type: z.string(),
  target_id: z.string(),
  details: z.any().nullable(),
  created_at: z.string(),
});

// Admin User Schema
export const AdminUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  avatar_url: z.string().nullable(),
  role: z.enum(["user", "admin"]),
  report_count: z.number(),
  created_at: z.string(),
});

// Paginated Users Response
export const PaginatedUsersResponseSchema = z.object({
  items: z.array(AdminUserSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  pages: z.number(),
});

// Admin Users Query Params
export const AdminUsersQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => parseInt(val || "1")),
  limit: z
    .string()
    .optional()
    .transform((val) => parseInt(val || "20")),
  search: z.string().optional(),
  role: z.enum(["user", "admin"]).optional(),
});

// Change Role Request/Response
export const ChangeRoleSchema = z.object({
  role: z.enum(["user", "admin"]),
});

export const ChangeRoleResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    role: z.enum(["user", "admin"]),
  }),
});

// Admin Activities Query Params
export const AdminActivitiesQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => parseInt(val || "1")),
  limit: z
    .string()
    .optional()
    .transform((val) => parseInt(val || "20")),
  action_type: z.string().optional(),
  admin_user_id: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
});

// Admin Activity Item (with admin name from join)
export const AdminActivityItemSchema = z.object({
  id: z.string(),
  admin_user_id: z.string(),
  admin_user_name: z.string(),
  action_type: z.string(),
  target_type: z.string(),
  target_id: z.string(),
  details: z.any().nullable(),
  created_at: z.string(),
});

// Paginated Activities Response
export const PaginatedActivitiesResponseSchema = z.object({
  items: z.array(AdminActivityItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  pages: z.number(),
});

// TypeScript types from Zod schemas
export type AdminStatsResponse = z.infer<typeof AdminStatsResponseSchema>;
export type AdminReportsResponse = z.infer<typeof AdminReportsResponseSchema>;
export type AdminReportActionRequest = z.infer<
  typeof AdminReportActionRequestSchema
>;
export type AdminReportActionResponse = z.infer<
  typeof AdminReportActionResponseSchema
>;
export type AdminActionLog = z.infer<typeof AdminActionLogSchema>;
export type AdminUser = z.infer<typeof AdminUserSchema>;
export type PaginatedUsersResponse = z.infer<
  typeof PaginatedUsersResponseSchema
>;
export type ChangeRoleResponse = z.infer<typeof ChangeRoleResponseSchema>;
export type AdminActivityItem = z.infer<typeof AdminActivityItemSchema>;
export type PaginatedActivitiesResponse = z.infer<
  typeof PaginatedActivitiesResponseSchema
>;

// Database interfaces
export interface AdminAction {
  id: string;
  admin_user_id: string;
  action_type: string;
  target_type: string;
  target_id: string;
  details: Record<string, any> | null;
  created_at: Date;
}

export interface ReportWithUser {
  id: string;
  user_id: string;
  image_url: string;
  category: string;
  street_name: string;
  location_text: string;
  lat: number | null;
  lon: number | null;
  status: "pending" | "verified" | "rejected" | "deleted";
  verified_at: Date | null;
  verified_by: string | null;
  rejection_reason: string | null;
  deleted_at: Date | null;
  created_at: Date;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}
