import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateReportInput, CreateReportSchema } from "../../lib/types/api";
import { useAuthContext } from "../../contexts/AuthContext";
import { uploadImage } from "../../services/upload";
import type { ReportWithUser } from "../../lib/types/api";

interface UseEditReportFormOptions {
  report: ReportWithUser | undefined;
  onSuccess?: (reportId: string) => void;
}

export function useEditReportForm({ report, onSuccess }: UseEditReportFormOptions) {
  const router = useRouter();
  const { backendUser, apiCall, getToken } = useAuthContext();

  const form = useForm<CreateReportInput>({
    resolver: zodResolver(CreateReportSchema),
    defaultValues: {
      category: "berlubang",
      street_name: "",
      location_text: "",
      image_url: "",
      lat: undefined,
      lon: undefined,
    },
  });

  // Pre-populate form when report data is available
  useEffect(() => {
    if (report) {
      form.reset({
        category: report.category,
        street_name: report.street_name,
        location_text: report.location_text,
        image_url: report.image_url,
        lat: report.lat || undefined,
        lon: report.lon || undefined,
      });
    }
  }, [report, form]);

  const onSubmit = async (data: CreateReportInput) => {
    if (!backendUser || !report) {
      return;
    }

    try {
      // If there's a new image file, upload it first
      let finalImageUrl = data.image_url;
      if (data.image_url && data.image_url.startsWith('blob:')) {
        // This is a new image file, upload it
        const response = await fetch(data.image_url);
        const blob = await response.blob();
        const file = new File([blob], 'report-image.jpg', { type: 'image/jpeg' });
        
        const token = await getToken();
        if (!token) {
          throw new Error('Authentication token not available');
        }
        const uploadResult = await uploadImage(file, token);
        if (!uploadResult.success || !uploadResult.data) {
          throw new Error(uploadResult.error?.message || 'Failed to upload image');
        }
        finalImageUrl = uploadResult.data.imageUrl;
      }

      // Update the report
      const updateData = {
        ...data,
        image_url: finalImageUrl,
      };

      const response = await apiCall(`/api/reports/${report.id}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to update report");
      }

      const result = await response.json();

      // Success callback
      if (onSuccess) {
        onSuccess(result.id);
      } else {
        // Default success behavior - redirect to report detail
        router.push(`/laporan/${report.id}?updated=true`);
      }
    } catch (error) {
      console.error("Failed to update report:", error);
      throw error;
    }
  };

  return {
    form,
    onSubmit,
    isLoading: form.formState.isSubmitting,
  };
} 