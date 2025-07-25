import {
  CreateReportSchema,
  ReportParamsSchema,
  ReportQuerySchema,
} from "@/schema/reports";
import { z } from "zod";

// TypeScript Types (derived from Zod schemas)
export type CreateReportInput = z.infer<typeof CreateReportSchema>;
export type ReportQuery = z.infer<typeof ReportQuerySchema>;
export type ReportParams = z.infer<typeof ReportParamsSchema>;

// Database Entity Types (specific to reports)
export interface Report {
  id: string; // Changed from number to string (UUID v7)
  user_id: string; // Changed from number to string (UUID v7)
  image_url: string;
  category: "berlubang" | "retak" | "lainnya";
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
}

export interface ReportWithUser extends Report {
  user_name: string | null;
  user_avatar: string | null;
}

// Result Types (specific to reports)
export interface PaginatedReports {
  items: ReportWithUser[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
