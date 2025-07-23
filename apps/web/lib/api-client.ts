// API Client for Hono backend - Updated to use unified service
// Maintains backward compatibility while using the new unified reports service

import { reportsService } from "../services/api-client";

export interface ReportFilters {
  page?: number;
  limit?: number;
  category?: "berlubang" | "retak" | "lainnya";
  search?: string;
}

// Re-export types from the unified service for backward compatibility
// Updated to match backend schema (no updated_at field)
export interface Report {
  id: number;
  category: "berlubang" | "retak" | "lainnya";
  street_name: string;
  location_text: string;
  image_url: string;
  created_at: string;
  user_id: number;
  lat: number | null;
  lon: number | null;
  user_name?: string | null;
  user_avatar?: string | null;
}

export interface PaginatedReports {
  items: Report[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    timestamp: string;
  };
}

class ApiClient {
  // Use the unified service internally while maintaining the same public API
  async getReports(filters: ReportFilters = {}): Promise<PaginatedReports> {
    return reportsService.getReports({
      page: filters.page,
      limit: filters.limit,
      category: filters.category,
      search: filters.search,
    });
  }

  async getEnrichedReports(
    filters: ReportFilters = {},
  ): Promise<PaginatedReports> {
    return reportsService.getEnrichedReports({
      page: filters.page,
      limit: filters.limit,
      category: filters.category,
      search: filters.search,
    });
  }

  async getReportById(id: number): Promise<Report> {
    return reportsService.getReportById(id);
  }

  async post<T>(
    endpoint: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any,
    options?: RequestInit,
  ): Promise<{ data: T }> {
    // For upload and other POST requests, we still need the original implementation
    // since they might not be part of the reports service
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      ...options,
      headers: {
        ...options?.headers,
      },
      body: data,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        response: {
          data: errorData,
          status: response.status,
        },
      };
    }

    const result = await response.json();
    return { data: result };
  }
}

export const apiClient = new ApiClient();
