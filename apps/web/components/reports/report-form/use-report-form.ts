import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCircle, MapPin, AlertTriangle } from "lucide-react";
import { useCreateReport } from "../../../hooks/use-create-report";
import { uploadImage } from "../../../services/upload";
import { useAuth } from "../../../hooks/useAuth";
import { useInvalidateDashboard } from "../../../hooks/dashboard";
import { cleanFormData, getLocationErrorMessage, geolocationOptions } from "../../../utils/report-form-utils";
import { extractGPSFromImage, getExifErrorMessage, getExifSuccessMessage } from "../../../lib/utils/exif-extraction";
import {
  CreateReportSchema,
  CreateReportInput,
} from "../../../lib/types/api";

interface UseReportFormProps {
  onSuccess?: (reportId: number) => void;
}

export const useReportForm = ({ onSuccess }: UseReportFormProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | undefined>(undefined);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formError, setFormError] = useState<string | undefined>(undefined);
  const [imageUploadFailed, setImageUploadFailed] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isExtractingExif, setIsExtractingExif] = useState(false);
  const [exifError, setExifError] = useState<string | undefined>(undefined);
  const [hasExifWarning, setHasExifWarning] = useState(false);

  const { getToken, isAuthenticated } = useAuth();
  const { invalidateAll } = useInvalidateDashboard();

  const {
    submitReport,
    isSubmitting,
    isUploading,
    error: submitError,
    clearError,
  } = useCreateReport({
    onSuccess: (reportId) => {
      invalidateAll();
      onSuccess?.(reportId);
    },
  });

  const form = useForm<CreateReportInput>({
    resolver: zodResolver(CreateReportSchema),
    mode: "onChange",
    defaultValues: {
      street_name: "",
      category: undefined,
      location_text: "",
      image_url: "",
      lat: undefined,
      lon: undefined,
    },
  });

  // Clear form errors when user starts typing
  const watchedValues = form.watch();
  useEffect(() => {
    if (formError) {
      setFormError(undefined);
    }
  }, [watchedValues, formError]);

  const handleImageSelect = async (file: File) => {
    setSelectedImage(file);
    setImageUploadFailed(false);
    const dummyUrl = "https://picsum.photos/800/600?random=1";
    form.setValue("image_url", dummyUrl);
    setUploadError(undefined);
    setFormError(undefined);
    setExifError(undefined);
    setHasExifWarning(false);
    clearError();

    // Extract EXIF GPS data from the image
    setIsExtractingExif(true);
    
    try {
      const exifResult = await extractGPSFromImage(file);
      
      if (exifResult.success && exifResult.gpsData) {
        // Auto-fill coordinates from EXIF data
        form.setValue("lat", exifResult.gpsData.lat);
        form.setValue("lon", exifResult.gpsData.lon);
        
        // Show success message with coordinates
        toast.success("Lokasi berhasil diekstrak dari foto", {
          description: `Lat: ${exifResult.gpsData.lat.toFixed(6)}, Lon: ${exifResult.gpsData.lon.toFixed(6)}`,
          duration: 4000,
        });
      } else {
        // Show warning for missing GPS data
        const errorMessage = getExifErrorMessage(exifResult);
        setExifError(errorMessage);
        setHasExifWarning(true);
        
        // Don't show toast error immediately, let user see the warning in the form
        console.log("EXIF extraction failed:", errorMessage);
      }
    } catch (error) {
      console.error("EXIF extraction error:", error);
      setExifError("Gagal membaca metadata foto. Silakan tambahkan lokasi secara manual.");
      setHasExifWarning(true);
    } finally {
      setIsExtractingExif(false);
    }
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    setImageUploadFailed(false);
    form.setValue("image_url", "");
    setUploadError(undefined);
    setFormError(undefined);
  };

  const handleImageUploadError = (error: string) => {
    setUploadError(error);
    setImageUploadFailed(true);
    setFormError(undefined);
    clearError();
  };

  const handleImageUploadSuccess = () => {
    setUploadError(undefined);
    setImageUploadFailed(false);
    setFormError(undefined);
    clearError();
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);

    if (!navigator.geolocation) {
      toast.error("Browser Anda tidak mendukung geolokasi", {
        duration: 3000,
      });
      setIsGettingLocation(false);
      return;
    }

    toast.loading("Mendapatkan lokasi...", {
      id: "location",
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        form.setValue("lat", lat);
        form.setValue("lon", lon);

        toast.success("Lokasi berhasil diperoleh", {
          id: "location",
          description: `Lat: ${lat.toFixed(6)}, Lon: ${lon.toFixed(6)}`,
          duration: 3000,
        });
        setIsGettingLocation(false);
      },
      (error) => {
        const errorMessage = getLocationErrorMessage(error);
        toast.error(errorMessage, {
          id: "location",
          duration: 5000,
        });
        setIsGettingLocation(false);
      },
      geolocationOptions,
    );
  };

  const onSubmit = async (data: CreateReportInput) => {
    setFormError(undefined);
    setUploadError(undefined);

    if (!selectedImage) {
      setFormError("Silakan pilih foto jalan rusak terlebih dahulu");
      return;
    }

    if (imageUploadFailed) {
      setFormError("Gagal mengunggah foto. Silakan coba lagi atau pilih foto lain.");
      return;
    }

    if (!isAuthenticated) {
      setFormError("Silakan login terlebih dahulu");
      return;
    }

    try {
      setIsUploadingImage(true);
      clearError();

      const token = await getToken();
      if (!token) {
        setFormError("Gagal mendapatkan token autentikasi");
        return;
      }

      const uploadResult = await uploadImage(selectedImage, token);

      if (!uploadResult.success || !uploadResult.data) {
        setFormError(uploadResult.error?.message || "Gagal mengunggah foto");
        return;
      }

      toast.success("Foto berhasil diunggah", {
        description: "Sedang membuat laporan...",
      });

      const cleanedData = cleanFormData({
        ...data,
        image_url: uploadResult.data.imageUrl,
      });

      await submitReport(cleanedData, selectedImage);

      toast.success("Laporan berhasil dibuat!", {
        description: "Terima kasih telah melaporkan kerusakan jalan",
        duration: 5000,
      });
    } catch (error) {
      console.error("Submit error:", error);
      setFormError("Terjadi kesalahan saat membuat laporan");

      toast.error("Gagal membuat laporan", {
        description: "Silakan coba lagi beberapa saat",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const isLoading = isSubmitting || isUploading || isUploadingImage || isGettingLocation || isExtractingExif;

  return {
    form,
    selectedImage,
    uploadError,
    formError,
    imageUploadFailed,
    isLoading,
    isGettingLocation,
    isUploadingImage,
    isExtractingExif,
    exifError,
    hasExifWarning,
    submitError,
    handleImageSelect,
    handleImageRemove,
    handleImageUploadError,
    handleImageUploadSuccess,
    getCurrentLocation,
    onSubmit,
  };
}; 