// Custom hook for creating reports

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreateReportInput } from "../lib/types/api";
import { useAuthContext } from "../contexts/AuthContext";

interface UseCreateReportOptions {
  onSuccess?: (reportId: string) => void;
  onError?: (error: string) => void;
}

export function useCreateReport(options?: UseCreateReportOptions) {
  const router = useRouter();
  const { backendUser, apiCall } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitReport = async (data: CreateReportInput, imageFile?: File) => {
    if (!backendUser) {
      const errorMessage = "Anda harus login terlebih dahulu";
      setError(errorMessage);
      options?.onError?.(errorMessage);
      throw new Error(errorMessage);
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create report using the auth context's apiCall method
      // Image upload is handled separately in the form component
      const reportData: CreateReportInput = {
        ...data,
      };

      const response = await apiCall(`/api/reports`, {
        method: "POST",
        body: JSON.stringify(reportData),
      });

      const rawPayload = await response.json();

      if (!response.ok || !rawPayload?.success) {
        const apiMessage =
          rawPayload?.error?.message ?? "Failed to create report";
        throw new Error(apiMessage);
      }

      const result: { id: string; message: string; success: boolean } =
        rawPayload;

      if (options?.onSuccess) {
        options.onSuccess(result.id);
      } else {
        router.push(`/dashboard?success=true&reportId=${result.id}`);
      }

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat membuat laporan";
      setError(errorMessage);
      options?.onError?.(errorMessage);
      throw err instanceof Error ? err : new Error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    submitReport,
    isSubmitting,
    isUploading,
    error,
    clearError,
    isLoading: isSubmitting || isUploading,
  };
}
