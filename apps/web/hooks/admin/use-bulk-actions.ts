import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthContext } from "../../contexts/AuthContext";

interface BulkActionResponse {
  success_count: number;
  failed_count: number;
  errors: string[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

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
        message: `HTTP ${response.status}: ${response.statusText}`,
      },
    }));
    throw new Error(errorData.error?.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const useBulkVerifyMutation = () => {
  const { getToken } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reportIds: string[]) => {
      const token = await getToken();
      if (!token) throw new Error("Authentication required");

      return authenticatedApiRequest<BulkActionResponse>(
        "/api/admin/reports/bulk-verify",
        token,
        {
          method: "POST",
          body: JSON.stringify({ report_ids: reportIds }),
        },
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["adminReports"] });
      if (data.failed_count > 0) {
        toast.warning(
          `${data.success_count} laporan diverifikasi, ${data.failed_count} gagal.`,
        );
      } else {
        toast.success(`${data.success_count} laporan berhasil diverifikasi.`);
      }
    },
    onError: (error: Error) => {
      toast.error(`Gagal memverifikasi laporan: ${error.message}`);
    },
  });
};

export const useBulkRejectMutation = () => {
  const { getToken } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reportIds,
      reason,
    }: {
      reportIds: string[];
      reason: string;
    }) => {
      const token = await getToken();
      if (!token) throw new Error("Authentication required");

      return authenticatedApiRequest<BulkActionResponse>(
        "/api/admin/reports/bulk-reject",
        token,
        {
          method: "POST",
          body: JSON.stringify({ report_ids: reportIds, reason }),
        },
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["adminReports"] });
      if (data.failed_count > 0) {
        toast.warning(
          `${data.success_count} laporan ditolak, ${data.failed_count} gagal.`,
        );
      } else {
        toast.success(`${data.success_count} laporan berhasil ditolak.`);
      }
    },
    onError: (error: Error) => {
      toast.error(`Gagal menolak laporan: ${error.message}`);
    },
  });
};

export const useBulkDeleteMutation = () => {
  const { getToken } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reportIds: string[]) => {
      const token = await getToken();
      if (!token) throw new Error("Authentication required");

      return authenticatedApiRequest<BulkActionResponse>(
        "/api/admin/reports/bulk-delete",
        token,
        {
          method: "POST",
          body: JSON.stringify({ report_ids: reportIds }),
        },
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["adminReports"] });
      if (data.failed_count > 0) {
        toast.warning(
          `${data.success_count} laporan dihapus, ${data.failed_count} gagal.`,
        );
      } else {
        toast.success(`${data.success_count} laporan berhasil dihapus.`);
      }
    },
    onError: (error: Error) => {
      toast.error(`Gagal menghapus laporan: ${error.message}`);
    },
  });
};
