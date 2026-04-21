import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "../../contexts/AuthContext";
import { toast } from "sonner";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  role: "user" | "admin";
  report_count: number;
  created_at: string;
}

interface PaginatedUsersResponse {
  items: AdminUser[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface UseAdminUsersOptions {
  page?: number;
  limit?: number;
  search?: string;
  role?: "user" | "admin" | "";
}

export const useAdminUsersQuery = (options: UseAdminUsersOptions = {}) => {
  const { getToken, isAuthenticated, backendUser } = useAuthContext();
  const { page = 1, limit = 20, search, role } = options;

  return useQuery({
    queryKey: ["adminUsers", page, limit, search, role],
    queryFn: async (): Promise<PaginatedUsersResponse> => {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (search) params.set("search", search);
      if (role) params.set("role", role);

      const response = await fetch(
        `${API_BASE_URL}/api/admin/users?${params.toString()}`,
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
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useChangeUserRoleMutation = () => {
  const { getToken } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: "user" | "admin";
    }) => {
      const token = await getToken();
      if (!token) throw new Error("Authentication required");

      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

      const response = await fetch(
        `${API_BASE_URL}/api/admin/users/${userId}/role`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast.success("Role pengguna berhasil diubah");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal mengubah role pengguna");
    },
  });
};
