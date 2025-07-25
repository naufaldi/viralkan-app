import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "../../contexts/AuthContext";

// Types for admin actions
interface AdminActionResponse {
  success: boolean;
  message: string;
  report: {
    id: string;
    status: string;
    verified_at: string | null;
    verified_by: string | null;
    rejection_reason: string | null;
    deleted_at: string | null;
  };
}

interface RejectReportData {
  reason: string;
}

// Get API base URL from the same configuration as api-client.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Helper function for authenticated API requests
async function authenticatedApiRequest<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      error: {
        code: "UNKNOWN_ERROR",
        message: `HTTP ${response.status}: ${response.statusText}`,
        timestamp: new Date().toISOString(),
      },
    }));
    throw new Error(errorData.error?.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Custom hook for verifying reports
export const useVerifyReport = () => {
  const { getToken } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reportId: string) => {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      return authenticatedApiRequest<AdminActionResponse>(
        `/api/admin/reports/${reportId}/verify`,
        token,
        {
          method: "POST",
        },
      );
    },
    onMutate: async (reportId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["adminReports"] });

      // Snapshot the previous value
      const previousReports = queryClient.getQueryData(["adminReports"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["adminReports"], (old: any) => {
        if (!old?.items) return old;

        return {
          ...old,
          items: old.items.map((report: any) =>
            report.id === reportId
              ? {
                  ...report,
                  status: "verified",
                  verified_at: new Date().toISOString(),
                }
              : report,
          ),
        };
      });

      return { previousReports };
    },
    onError: (err, reportId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousReports) {
        queryClient.setQueryData(["adminReports"], context.previousReports);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["adminReports"] });
    },
  });
};

// Custom hook for rejecting reports
export const useRejectReport = () => {
  const { getToken } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reportId,
      reason,
    }: {
      reportId: string;
      reason: string;
    }) => {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      return authenticatedApiRequest<AdminActionResponse>(
        `/api/admin/reports/${reportId}/reject`,
        token,
        {
          method: "POST",
          body: JSON.stringify({ reason }),
        },
      );
    },
    onMutate: async ({ reportId }) => {
      await queryClient.cancelQueries({ queryKey: ["adminReports"] });

      const previousReports = queryClient.getQueryData(["adminReports"]);

      queryClient.setQueryData(["adminReports"], (old: any) => {
        if (!old?.items) return old;

        return {
          ...old,
          items: old.items.map((report: any) =>
            report.id === reportId
              ? {
                  ...report,
                  status: "rejected",
                  rejection_reason: "Pending...",
                }
              : report,
          ),
        };
      });

      return { previousReports };
    },
    onError: (err, variables, context) => {
      if (context?.previousReports) {
        queryClient.setQueryData(["adminReports"], context.previousReports);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["adminReports"] });
    },
  });
};

// Custom hook for deleting reports
export const useDeleteReport = () => {
  const { getToken } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reportId: string) => {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      return authenticatedApiRequest<AdminActionResponse>(
        `/api/admin/reports/${reportId}/delete`,
        token,
        {
          method: "POST",
        },
      );
    },
    onMutate: async (reportId) => {
      await queryClient.cancelQueries({ queryKey: ["adminReports"] });

      const previousReports = queryClient.getQueryData(["adminReports"]);

      queryClient.setQueryData(["adminReports"], (old: any) => {
        if (!old?.items) return old;

        return {
          ...old,
          items: old.items.map((report: any) =>
            report.id === reportId
              ? {
                  ...report,
                  status: "deleted",
                  deleted_at: new Date().toISOString(),
                }
              : report,
          ),
        };
      });

      return { previousReports };
    },
    onError: (err, reportId, context) => {
      if (context?.previousReports) {
        queryClient.setQueryData(["adminReports"], context.previousReports);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["adminReports"] });
    },
  });
};
