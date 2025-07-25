import { useQuery } from "@tanstack/react-query";
import { reportsService } from "../../services/api-client";

export interface ReportQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  user_id?: string;
}

/**
 * Hook for fetching reports with pagination and filters
 */
export const useReports = (params: ReportQueryParams = {}) => {
  return useQuery({
    queryKey: ["reports", params],
    queryFn: () => reportsService.getReports(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error instanceof Error && error.message.includes("HTTP 4")) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

/**
 * Hook for fetching enriched reports with user information
 */
export const useEnrichedReports = (params: ReportQueryParams = {}) => {
  return useQuery({
    queryKey: ["reports-enriched", params],
    queryFn: () => reportsService.getEnrichedReports(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("HTTP 4")) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

/**
 * Hook for fetching a single report by ID
 */
export const useReport = (id: string | undefined) => {
  return useQuery({
    queryKey: ["report", id],
    queryFn: () => reportsService.getReportById(id!),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("HTTP 4")) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

/**
 * Hook for fetching user's reports (authenticated)
 */
export const useUserReports = (
  token: string | undefined,
  params: Omit<ReportQueryParams, "user_id"> = {},
) => {
  return useQuery({
    queryKey: ["user-reports", token, params],
    queryFn: () => reportsService.getUserReports(token!, params),
    enabled: !!token,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 8 * 60 * 1000, // 8 minutes
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("HTTP 4")) {
        return false;
      }
      return failureCount < 2;
    },
  });
};
