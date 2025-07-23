import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "../../contexts/AuthContext";
import type { PaginatedReports } from "../../lib/types/api";

export interface DashboardReportsParams {
  limit?: number;
  category?: string;
}

/**
 * Hook for fetching user's reports for dashboard display
 * Automatically handles authentication and provides real-time updates
 */
export const useDashboardReports = (params: DashboardReportsParams = {}) => {
  const { backendUser, apiCall } = useAuthContext();

  return useQuery({
    queryKey: ["dashboard-reports", backendUser?.id, params],
    queryFn: async (): Promise<PaginatedReports> => {
      const searchParams = new URLSearchParams();

      if (params.limit) searchParams.append("limit", params.limit.toString());
      if (params.category) searchParams.append("category", params.category);

      // Default to 6 for dashboard if no limit specified
      if (!params.limit) searchParams.append("limit", "6");

      const endpoint = `/api/reports/me${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
      const response = await apiCall(endpoint);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch dashboard reports: ${response.status}`,
        );
      }

      return response.json();
    },
    enabled: !!backendUser, // Only fetch when user is authenticated
    staleTime: 30 * 1000, // 30 seconds - shorter for dashboard real-time feel
    gcTime: 2 * 60 * 1000, // 2 minutes cache
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (
        error instanceof Error &&
        (error.message.includes("401") || error.message.includes("403"))
      ) {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: true, // Automatically refetch when user returns to tab
    refetchOnMount: true, // Always refetch on component mount
  });
};
