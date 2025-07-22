// API Client for Hono backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface ReportFilters {
  page?: number;
  limit?: number;
  category?: "berlubang" | "retak" | "lainnya";
  search?: string;
}

export interface Report {
  id: number;
  category: "berlubang" | "retak" | "lainnya";
  street_name: string;
  location_text: string;
  image_url: string;
  created_at: string;
  updated_at: string;
  user_id: number;
  user_name?: string;
  user_avatar?: string;
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
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message ||
          `HTTP ${response.status}: ${response.statusText}`,
      );
    }

    return response.json();
  }

  async getReports(filters: ReportFilters = {}): Promise<PaginatedReports> {
    const params = new URLSearchParams();

    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.category) params.append("category", filters.category);
    if (filters.search) params.append("search", filters.search);

    const queryString = params.toString();
    const endpoint = `/api/reports${queryString ? `?${queryString}` : ""}`;

    return this.request<PaginatedReports>(endpoint);
  }

  async getEnrichedReports(
    filters: ReportFilters = {},
  ): Promise<PaginatedReports> {
    const params = new URLSearchParams();

    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.category) params.append("category", filters.category);
    if (filters.search) params.append("search", filters.search);

    const queryString = params.toString();
    const endpoint = `/api/reports/enriched${queryString ? `?${queryString}` : ""}`;

    return this.request<PaginatedReports>(endpoint);
  }

  async getReportById(id: number): Promise<Report> {
    return this.request<Report>(`/api/reports/${id}`);
  }

  async post<T>(
    endpoint: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any,
    options?: RequestInit,
  ): Promise<{ data: T }> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
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
