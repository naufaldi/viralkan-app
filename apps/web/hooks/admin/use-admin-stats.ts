import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "../../contexts/AuthContext";

// Admin statistics interface
interface AdminStats {
  totalReports: number;
  pendingReports: number;
  verifiedReports: number;
  rejectedReports: number;
  deletedReports: number;
  totalUsers: number;
  adminUsers: number;
  verificationRate: number;
  averageResponseTime: string;
  todayActivity: {
    verified: number;
    rejected: number;
    submitted: number;
  };
}

// Custom hook for fetching admin statistics
export const useAdminStatsQuery = () => {
  const { getToken, isAuthenticated, backendUser } = useAuthContext();

  return useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      // Call the real admin stats API
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }

      const apiResponse = await response.json();

      // Map API response to frontend interface
      return {
        totalReports: apiResponse.totalReports,
        pendingReports: apiResponse.pendingCount,
        verifiedReports: apiResponse.verifiedCount,
        rejectedReports: apiResponse.rejectedCount,
        deletedReports: apiResponse.deletedCount,
        totalUsers: apiResponse.totalUsers,
        adminUsers: apiResponse.adminUsers,
        verificationRate: apiResponse.verificationRate,
        averageResponseTime: `${apiResponse.averageVerificationTime} jam`,
        todayActivity: {
          verified: 0,
          rejected: 0,
          submitted: 0,
        },
      } as AdminStats;
    },
    enabled: isAuthenticated && !!backendUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
