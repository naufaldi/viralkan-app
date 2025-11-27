// Custom hook for updating reports

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreateReportInput, ReportResponse } from "../lib/types/api";
import { useAuthContext } from "../contexts/AuthContext";

interface UseUpdateReportOptions {
  onSuccess?: (report: ReportResponse) => void;
  onError?: (error: string) => void;
}

export function useUpdateReport(options?: UseUpdateReportOptions) {
  const router = useRouter();
  const { backendUser, apiCall } = useAuthContext();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateReport = async (
    reportId: string,
    data: Partial<CreateReportInput>,
  ) => {
    if (!backendUser) {
      const errorMessage = "Anda harus login terlebih dahulu";
      setError(errorMessage);
      options?.onError?.(errorMessage);
      throw new Error(errorMessage);
    }

    setIsUpdating(true);
    setError(null);

    try {
      const response = await apiCall(`/api/reports/${reportId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });

      const rawPayload = await response.json();

      if (!response.ok) {
        const apiMessage =
          rawPayload?.error?.message ?? "Failed to update report";
        throw new Error(apiMessage);
      }

      const result: ReportResponse = rawPayload;

      if (options?.onSuccess) {
        options.onSuccess(result);
      } else {
        router.push(`/laporan/${reportId}?success=updated`);
      }

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memperbarui laporan";
      setError(errorMessage);
      options?.onError?.(errorMessage);
      throw err instanceof Error ? err : new Error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    updateReport,
    isUpdating,
    error,
    clearError,
  };
}
