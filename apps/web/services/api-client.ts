// Unified Reports API Service
// Consolidates functionality from services/api.ts and lib/api-client.ts

import {
  CreateReportInput,
  ReportResponse,
  ReportWithUser,
  PaginatedReports,
  ErrorResponse,
} from "../lib/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Base API request function with consistent error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({
      error: {
        code: "UNKNOWN_ERROR",
        message: `HTTP ${response.status}: ${response.statusText}`,
        timestamp: new Date().toISOString(),
      },
    }));
    throw new Error(errorData.error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Authenticated API request function
async function authenticatedApiRequest<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  return apiRequest<T>(endpoint, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}

// Reports API Service - Function-based approach
export const reportsService = {
  // Get reports with pagination and filters
  getReports: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    user_id?: string;
  }): Promise<PaginatedReports> => {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.category) searchParams.append("category", params.category);
    if (params?.search) searchParams.append("search", params.search);
    if (params?.user_id) searchParams.append("user_id", params.user_id);

    const endpoint = `/api/reports${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    return apiRequest<PaginatedReports>(endpoint);
  },

  // Get enriched reports with user information
  getEnrichedReports: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    user_id?: string;
  }): Promise<PaginatedReports> => {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.category) searchParams.append("category", params.category);
    if (params?.search) searchParams.append("search", params.search);
    if (params?.user_id) searchParams.append("user_id", params.user_id);

    const endpoint = `/api/reports/enriched${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    return apiRequest<PaginatedReports>(endpoint);
  },

  // Get admin reports with authentication and filtering
  getAdminReports: async (
    token: string,
    params?: {
      page?: number;
      limit?: number;
      status?: string;
      category?: string;
      search?: string;
    },
  ): Promise<{
    items: Array<{
      id: string;
      user_id: string;
      image_url: string;
      category: string;
      street_name: string;
      location_text: string;
      lat: number | null;
      lon: number | null;
      status: "pending" | "verified" | "rejected" | "deleted";
      verified_at: string | null;
      verified_by: string | null;
      rejection_reason: string | null;
      deleted_at: string | null;
      created_at: string;
      user?: {
        id: string;
        name: string;
        email: string;
      };
    }>;
    total: number;
    page: number;
    limit: number;
  }> => {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.status) searchParams.append("status", params.status);
    if (params?.category) searchParams.append("category", params.category);
    if (params?.search) searchParams.append("search", params.search);

    const endpoint = `/api/admin/reports${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    return authenticatedApiRequest(endpoint, token);
  },

  // Get individual report by ID
  getReportById: async (id: string): Promise<ReportWithUser> => {
    return apiRequest<ReportWithUser>(`/api/reports/${id}`);
  },

  // Create new report (authenticated)
  createReport: async (
    data: CreateReportInput,
    token: string,
  ): Promise<{ id: string; message: string; success: boolean }> => {
    return authenticatedApiRequest<{
      id: string;
      message: string;
      success: boolean;
    }>("/api/reports", token, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Get user's reports (authenticated)
  getUserReports: async (
    token: string,
    params?: {
      page?: number;
      limit?: number;
      category?: string;
    },
  ): Promise<PaginatedReports> => {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.category) searchParams.append("category", params.category);

    const endpoint = `/api/reports/me${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    return authenticatedApiRequest<PaginatedReports>(endpoint, token);
  },

  // Update existing report (authenticated)
  updateReport: async (
    id: string,
    data: Partial<CreateReportInput>,
    token: string,
  ): Promise<ReportResponse> => {
    return authenticatedApiRequest<ReportResponse>(
      `/api/reports/${id}`,
      token,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
    );
  },

  // Delete report (authenticated)
  deleteReport: async (
    id: string,
    token: string,
  ): Promise<{ success: boolean }> => {
    return authenticatedApiRequest<{ success: boolean }>(
      `/api/reports/${id}`,
      token,
      {
        method: "DELETE",
      },
    );
  },

  // Validate report ownership (authenticated)
  validateOwnership: async (
    id: string,
    token: string,
  ): Promise<{ canEdit: boolean; report: ReportResponse }> => {
    return authenticatedApiRequest<{
      canEdit: boolean;
      report: ReportResponse;
    }>(`/api/reports/${id}/ownership`, token);
  },

  // Get reports statistics
  getReportsStats: async (): Promise<{
    total: number;
    byCategory: Record<string, number>;
    recent: number;
  }> => {
    // This endpoint might not exist yet, so we'll implement it when needed
    // For now, we can calculate stats from the reports data
    const reports = await reportsService.getReports({ limit: 1000 });

    const byCategory = reports.items.reduce(
      (acc, report) => {
        acc[report.category] = (acc[report.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const recent = reports.items.filter((report) => {
      const reportDate = new Date(report.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return reportDate > weekAgo;
    }).length;

    return {
      total: reports.total,
      byCategory,
      recent,
    };
  },
};

// Export individual functions for backward compatibility
export const {
  getReports,
  getEnrichedReports,
  getAdminReports,
  getReportById,
  createReport,
  getUserReports,
  updateReport,
  deleteReport,
  validateOwnership,
  getReportsStats,
} = reportsService;

// Add interfaces from lib/api-client.ts for backward compatibility
export interface ReportFilters {
  page?: number;
  limit?: number;
  category?: "berlubang" | "retak" | "lainnya";
  search?: string;
}

export interface Report {
  id: string;
  category: "berlubang" | "retak" | "lainnya";
  street_name: string;
  location_text: string;
  image_url: string;
  created_at: string;
  user_id: string;
  lat: number | null;
  lon: number | null;
  user_name?: string | null;
  user_avatar?: string | null;
}

export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    timestamp: string;
  };
}

// Add ApiClient class for backward compatibility
class ApiClient {
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

  async getReportById(id: string): Promise<Report> {
    return reportsService.getReportById(id);
  }

  async post<T>(
    endpoint: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any,
    options?: RequestInit,
  ): Promise<{ data: T }> {
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

// Re-export types for convenience
export type {
  CreateReportInput,
  ReportResponse,
  ReportWithUser,
  PaginatedReports,
};
