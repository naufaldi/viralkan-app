import { useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "../../contexts/AuthContext";

/**
 * Hook for invalidating dashboard data after mutations
 * Use this to trigger fresh data fetches after creating/updating reports
 */
export const useInvalidateDashboard = () => {
  const queryClient = useQueryClient();
  const { backendUser } = useAuthContext();

  const invalidateAll = () => {
    if (!backendUser) return;

    // Invalidate dashboard reports
    queryClient.invalidateQueries({
      queryKey: ["dashboard-reports", backendUser.id],
    });

    // Invalidate dashboard stats
    queryClient.invalidateQueries({
      queryKey: ["dashboard-stats", backendUser.id],
    });

    // Also invalidate any general user reports
    queryClient.invalidateQueries({
      queryKey: ["user-reports"],
    });
  };

  const invalidateReports = () => {
    if (!backendUser) return;

    queryClient.invalidateQueries({
      queryKey: ["dashboard-reports", backendUser.id],
    });
  };

  const invalidateStats = () => {
    if (!backendUser) return;

    queryClient.invalidateQueries({
      queryKey: ["dashboard-stats", backendUser.id],
    });
  };

  return {
    invalidateAll,
    invalidateReports,
    invalidateStats,
  };
};
