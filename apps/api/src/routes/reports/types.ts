import {
  CreateReportSchema,
  ForwardGeocodeRequestSchema,
  ReportParamsSchema,
  ReportQuerySchema,
  ReverseGeocodeRequestSchema,
} from "@/schema/reports";
import { z } from "zod";

// TypeScript Types (derived from Zod schemas)
export type CreateReportInput = z.infer<typeof CreateReportSchema>;
export type ReportQuery = z.infer<typeof ReportQuerySchema>;
export type ReportParams = z.infer<typeof ReportParamsSchema>;
export type ReverseGeocodeRequest = z.infer<typeof ReverseGeocodeRequestSchema>;
export type ForwardGeocodeRequest = z.infer<typeof ForwardGeocodeRequestSchema>;

export type GeocodingSource = "exif" | "nominatim" | "manual";

export interface GeocodingMetadata {
  geocoding_source: GeocodingSource | null;
  geocoded_at: Date | null;
}

export interface GeocodingResult {
  street_name?: string;
  district?: string;
  city?: string;
  province?: string;
  province_code?: string;
  regency_code?: string;
  district_code?: string;
  lat?: number;
  lon?: number;
  geocoding_source: GeocodingSource;
  geocoded_at: Date;
}

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
  // Administrative boundary fields (hybrid approach)
  district: string;
  city: string;
  province: string;
  province_code: string | null;
  regency_code: string | null;
  district_code: string | null;
  geocoding_source: GeocodingSource | null;
  geocoded_at: Date | null;
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
