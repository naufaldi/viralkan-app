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
import {
  ForwardGeocodePayload,
  GeocodingResponse,
  reportsService,
} from "../../services/api-client";
import {
  cleanFormData,
  geolocationOptions,
} from "../../utils/report-form-utils";

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

  const hasValidCoordinates = (
    lat?: number | null,
    lon?: number | null,
  ): boolean => {
    return (
      typeof lat === "number" &&
      Number.isFinite(lat) &&
      typeof lon === "number" &&
      Number.isFinite(lon)
    );
  };

  const mergeForwardGeocoding = (
    payload: CreateReportInput,
    geocoding: GeocodingResponse,
  ): CreateReportInput => {
    const geocodedLat =
      typeof geocoding.lat === "number" && Number.isFinite(geocoding.lat)
        ? geocoding.lat
        : null;
    const geocodedLon =
      typeof geocoding.lon === "number" && Number.isFinite(geocoding.lon)
        ? geocoding.lon
        : null;

    return {
      ...payload,
      lat: geocodedLat ?? payload.lat ?? null,
      lon: geocodedLon ?? payload.lon ?? null,
      street_name: payload.street_name || geocoding.street_name || "",
      district: payload.district || geocoding.district || "",
      city: payload.city || geocoding.city || "",
      province: payload.province || geocoding.province || "",
      province_code: payload.province_code || geocoding.province_code || "",
      regency_code: payload.regency_code || geocoding.regency_code || "",
      district_code: payload.district_code || geocoding.district_code || "",
    };
  };

  const tryGetDeviceLocation = async (): Promise<{
    lat: number;
    lon: number;
  } | null> => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      return null;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        () => resolve(null),
        geolocationOptions,
      );
    });
  };

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

    if (!selectedImage && !initialData?.image_url) {
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

      let payload = cleanFormData({
        ...data,
        image_url: imageUrl,
      });

      if (!hasValidCoordinates(payload.lat, payload.lon)) {
        const forwardPayload: ForwardGeocodePayload = {
          street_name: payload.street_name,
          district: payload.district,
          city: payload.city,
          province: payload.province,
          province_code: payload.province_code || undefined,
          regency_code: payload.regency_code || undefined,
          district_code: payload.district_code || undefined,
        };

        try {
          const geocodingResult = await reportsService.forwardGeocode(
            forwardPayload,
            token,
          );
          payload = mergeForwardGeocoding(payload, geocodingResult);
        } catch (geocodeError) {
          if (process.env.NODE_ENV !== "production") {
            console.warn(
              "[ReportSubmit] Forward geocoding failed; proceeding without coords",
              geocodeError,
            );
          }
        }

        if (!hasValidCoordinates(payload.lat, payload.lon)) {
          const deviceCoords = await tryGetDeviceLocation();
          if (deviceCoords) {
            payload = {
              ...payload,
              lat: deviceCoords.lat,
              lon: deviceCoords.lon,
            };
          } else {
            toast.warning(
              "Koordinat belum diperoleh. Laporan tetap dikirim tanpa titik peta.",
              {
                description:
                  "Aktifkan lokasi perangkat atau pastikan alamat lebih spesifik untuk membantu pemetaan.",
              },
            );
          }
        }
      }

      if (isEditing && initialData) {
        toast.success("Memperbarui laporan...", {
          description: "Mohon tunggu sebentar",
        });
        await updateReport(initialData.id, payload);
        toast.success("Laporan berhasil diperbarui!", {
          description: "Perubahan Anda telah disimpan",
          duration: 5000,
        });
      } else {
        toast.success("Foto berhasil diunggah", {
          description: "Sedang membuat laporan...",
        });
        await submitReport(payload, selectedImage || undefined);
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
