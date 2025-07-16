// Custom hook for creating reports

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreateReportInput } from "../lib/types/api";
import { uploadImage } from "../services/api";
import { useAuthContext } from "../contexts/AuthContext";

interface UseCreateReportOptions {
  onSuccess?: (reportId: number) => void;
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
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let imageUrl = data.image_url;

      // Upload image if provided
      if (imageFile) {
        setIsUploading(true);
        const uploadResult = await uploadImage(imageFile);
        imageUrl = uploadResult.url;
        setIsUploading(false);
      }

      // Create report using the auth context's apiCall method
      const reportData: CreateReportInput = {
        ...data,
        image_url: imageUrl,
      };

      const response = await apiCall(`/api/reports`, {
        method: "POST",
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to create report");
      }

      const result = await response.json();

      // Success callback
      if (options?.onSuccess) {
        options.onSuccess(result.id);
      } else {
        // Default success behavior - redirect to reports list
        router.push(`/laporan?success=true&reportId=${result.id}`);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat membuat laporan";
      setError(errorMessage);
      options?.onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
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
