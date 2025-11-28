import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "../../contexts/AuthContext";
import { getAdminReportDetail } from "../../services/api-client";

export const useAdminReportDetail = (reportId: string) => {
  const { getToken, isAuthenticated, backendUser } = useAuthContext();

  return useQuery({
    queryKey: ["adminReport", reportId],
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      return getAdminReportDetail(token, reportId);
    },
    enabled: Boolean(reportId) && isAuthenticated && !!backendUser,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
