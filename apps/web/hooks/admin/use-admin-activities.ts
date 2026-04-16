import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "../../contexts/AuthContext";

export interface AdminActivityItem {
  id: string;
  admin_user_id: string;
  admin_user_name: string;
  action_type: string;
  target_type: string;
  target_id: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

interface PaginatedActivitiesResponse {
  items: AdminActivityItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface UseAdminActivitiesOptions {
  page?: number;
  limit?: number;
  action_type?: string;
  date_from?: string;
  date_to?: string;
}

export const useAdminActivitiesQuery = (
  options: UseAdminActivitiesOptions = {},
) => {
  const { getToken, isAuthenticated, backendUser } = useAuthContext();
  const { page = 1, limit = 20, action_type, date_from, date_to } = options;

  return useQuery({
    queryKey: ["adminActivities", page, limit, action_type, date_from, date_to],
    queryFn: async (): Promise<PaginatedActivitiesResponse> => {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (action_type) params.set("action_type", action_type);
      if (date_from) params.set("date_from", date_from);
      if (date_to) params.set("date_to", date_to);

      const response = await fetch(
        `${API_BASE_URL}/api/admin/activities?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }

      return response.json();
    },
    enabled: isAuthenticated && !!backendUser,
    staleTime: 2 * 60 * 1000, // 2 minutes (activities change more often)
    gcTime: 5 * 60 * 1000,
  });
};
