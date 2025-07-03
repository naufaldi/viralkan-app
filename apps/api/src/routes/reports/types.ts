import { 
  CreateReportSchema, 
  ReportParamsSchema, 
  ReportQuerySchema,
  ReportResponseSchema,
  ReportWithUserResponseSchema,
  PaginatedReportsResponseSchema,
  ErrorResponseSchema
} from "@/schema/reports";
import { z } from "zod";

// Re-export schemas for easy access
export { 
  CreateReportSchema, 
  ReportQuerySchema, 
  ReportParamsSchema,
  ReportResponseSchema,
  ReportWithUserResponseSchema,
  PaginatedReportsResponseSchema,
  ErrorResponseSchema
};

// TypeScript Types (derived from Zod schemas)
export type CreateReportInput = z.infer<typeof CreateReportSchema>;
export type ReportQuery = z.infer<typeof ReportQuerySchema>;
export type ReportParams = z.infer<typeof ReportParamsSchema>;

// Database Entity Types (specific to reports)
export interface Report {
  id: number;
  user_id: number;
  image_url: string;
  category: 'berlubang' | 'retak' | 'lainnya';
  street_name: string;
  location_text: string;
  lat: number | null;
  lon: number | null;
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