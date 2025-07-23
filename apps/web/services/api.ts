// DEPRECATED: API service functions - Use services/reports.ts instead
// This file is kept for backward compatibility but will be removed in future versions

import {
  CreateReportInput,
  ReportResponse,
  PaginatedReports,
  ErrorResponse,
} from "../lib/types/api";

// Import the new unified service
import { reportsService } from "./reports";

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

// Reports API functions - DEPRECATED: Use reportsService from ./reports instead
export async function createReport(
  data: CreateReportInput,
  token: string,
): Promise<{ id: number }> {
  console.warn('DEPRECATED: Use reportsService.createReport() instead');
  return reportsService.createReport(data, token);
}

export async function getReports(params?: {
  page?: number;
  limit?: number;
  category?: string;
  user_id?: string;
}): Promise<PaginatedReports> {
  console.warn('DEPRECATED: Use reportsService.getReports() instead');
  return reportsService.getReports(params);
}

export async function getReport(id: number): Promise<ReportResponse> {
  console.warn('DEPRECATED: Use reportsService.getReportById() instead');
  return reportsService.getReportById(id);
}

export async function getUserReports(
  token: string,
  params?: {
    page?: number;
    limit?: number;
  },
): Promise<PaginatedReports> {
  console.warn('DEPRECATED: Use reportsService.getUserReports() instead');
  return reportsService.getUserReports(token, params);
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
