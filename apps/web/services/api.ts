// API service functions for making authenticated requests to the backend

import {
  CreateReportInput,
  ReportResponse,
  PaginatedReports,
  ErrorResponse,
} from "../lib/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Base API request function
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
    const errorData: ErrorResponse = await response.json();
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

// Reports API functions
export async function createReport(
  data: CreateReportInput,
  token: string,
): Promise<{ id: number }> {
  return authenticatedApiRequest<{ id: number }>("/api/reports", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getReports(params?: {
  page?: number;
  limit?: number;
  category?: string;
  user_id?: string;
}): Promise<PaginatedReports> {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.category) searchParams.append("category", params.category);
  if (params?.user_id) searchParams.append("user_id", params.user_id);

  const endpoint = `/api/reports${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  return apiRequest<PaginatedReports>(endpoint);
}

export async function getReport(id: number): Promise<ReportResponse> {
  return apiRequest<ReportResponse>(`/api/reports/${id}`);
}

export async function getUserReports(
  token: string,
  params?: {
    page?: number;
    limit?: number;
  },
): Promise<PaginatedReports> {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());

  const endpoint = `/api/me/reports${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  return authenticatedApiRequest<PaginatedReports>(endpoint, token);
}

// Auth API functions
export async function verifyToken(token: string): Promise<{ user: any }> {
  return authenticatedApiRequest<{ user: any }>("/api/auth/verify", token, {
    method: "POST",
  });
}

export async function getProfile(token: string): Promise<{ user: any }> {
  return authenticatedApiRequest<{ user: any }>("/api/auth/me", token);
}

// Re-export upload function from upload service for backward compatibility
export { uploadImage, } from "./upload";
