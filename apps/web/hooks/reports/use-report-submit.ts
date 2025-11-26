import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CreateReportInput, ReportResponse } from "../../lib/types/api";
import { useCreateReport } from "../use-create-report";
import { useUpdateReport } from "../use-update-report";
import { useInvalidateDashboard } from "../dashboard";
import { useAuth } from "../useAuth";
import { uploadImage } from "../../services/upload";
import { cleanFormData } from "../../utils/report-form-utils";

interface UseReportSubmitProps {
  form: UseFormReturn<CreateReportInput>;
  selectedImage: File | null;
  imageUploadFailed: boolean;
  isEditing: boolean;
  initialData?: ReportResponse;
  onSuccess?: (reportId: string) => void;
  setFormError: (error: string | undefined) => void;
  setUploadError: (error: string | undefined) => void;
}

export const useReportSubmit = ({
  form,
  selectedImage,
  imageUploadFailed,
  isEditing,
  initialData,
  onSuccess,
  setFormError,
  setUploadError,
}: UseReportSubmitProps) => {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const { getToken, isAuthenticated } = useAuth();
  const { invalidateAll } = useInvalidateDashboard();
  const router = useRouter();

  const {
    submitReport,
    isSubmitting,
    isUploading,
    error: createError,
    clearError: clearCreateError,
  } = useCreateReport({
    onSuccess: (reportId) => {
      invalidateAll();
      onSuccess?.(reportId);
      router.push(`/dashboard?success=true&reportId=${reportId}`);
    },
  });

  const {
    updateReport,
    isUpdating,
    error: updateError,
    clearError: clearUpdateError,
  } = useUpdateReport({
    onSuccess: (report) => {
      invalidateAll();
      onSuccess?.(report.id);
      router.push(`/laporan/${report.id}?success=updated`);
    },
  });

  const onSubmit = async (data: CreateReportInput) => {
    setFormError(undefined);
    setUploadError(undefined);

    if (!selectedImage && !isEditing) {
      setFormError("Silakan pilih foto jalan rusak terlebih dahulu");
      return;
    }

    if (imageUploadFailed) {
      setFormError(
        "Gagal mengunggah foto. Silakan coba lagi atau pilih foto lain.",
      );
      return;
    }

    if (!isAuthenticated) {
      setFormError("Silakan login terlebih dahulu");
      return;
    }

    try {
      setIsUploadingImage(true);
      clearCreateError();
      clearUpdateError();

      const token = await getToken();
      if (!token) {
        setFormError("Gagal mendapatkan token autentikasi");
        return;
      }

      let imageUrl = data.image_url;

      if (selectedImage) {
        const uploadResult = await uploadImage(selectedImage, token);

        if (!uploadResult.success || !uploadResult.data) {
          setFormError(uploadResult.error?.message || "Gagal mengunggah foto");
          return;
        }
        imageUrl = uploadResult.data.imageUrl;
      }

      const cleanedData = cleanFormData({
        ...data,
        image_url: imageUrl,
      });

      if (isEditing && initialData) {
        toast.success("Memperbarui laporan...", {
          description: "Mohon tunggu sebentar",
        });
        await updateReport(initialData.id, cleanedData);
        toast.success("Laporan berhasil diperbarui!", {
          description: "Perubahan Anda telah disimpan",
          duration: 5000,
        });
      } else {
        toast.success("Foto berhasil diunggah", {
          description: "Sedang membuat laporan...",
        });
        await submitReport(cleanedData, selectedImage || undefined);
        toast.success("Laporan berhasil dibuat!", {
          description: "Terima kasih telah melaporkan kerusakan jalan",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Submit error:", error);
      setFormError("Terjadi kesalahan saat menyimpan laporan");

      toast.error("Gagal menyimpan laporan", {
        description: "Silakan coba lagi beberapa saat",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  return {
    onSubmit,
    isSubmitting,
    isUpdating,
    isUploading,
    isUploadingImage,
    submitError: createError || updateError,
  };
};
