import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "../../contexts/AuthContext";
import { getAdminReports } from "../../services/api-client";

interface AdminReportsFilters {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  search?: string;
}

export const useAdminReportsQuery = (filters: AdminReportsFilters = {}) => {
  const { getToken, isAuthenticated, backendUser } = useAuthContext();

  return useQuery({
    queryKey: ["adminReports", filters],
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }
      return getAdminReports(token, filters);
    },
    enabled: isAuthenticated && !!backendUser, // Only run query if user is authenticated and has backend verification
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
