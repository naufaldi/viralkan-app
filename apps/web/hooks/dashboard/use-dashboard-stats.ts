import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "../../contexts/AuthContext";

export interface UserStats {
  total_reports: number;
  reports_this_month: number;
  last_report_date: string | null;
}

/**
 * Hook for fetching user's statistics for dashboard display
 * Uses the /api/auth/me/stats endpoint for authenticated user stats
 */
export const useDashboardStats = () => {
  const { backendUser, apiCall } = useAuthContext();

  return useQuery({
    queryKey: ["dashboard-stats", backendUser?.id],
    queryFn: async (): Promise<UserStats> => {
      const response = await apiCall("/api/auth/me/stats");

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }

      return response.json();
    },
    enabled: !!backendUser, // Only fetch when user is authenticated
    staleTime: 60 * 1000, // 1 minute - stats change less frequently
    gcTime: 5 * 60 * 1000, // 5 minutes cache
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
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  });
};
