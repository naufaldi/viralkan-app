import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
// Icons removed - not used in this file
import { useCreateReport } from "../../../hooks/use-create-report";
import { useGeocoding } from "../../../hooks/use-geocoding";
import { uploadImage } from "../../../services/upload";
import { useAuth } from "../../../hooks/useAuth";
import { useInvalidateDashboard } from "../../../hooks/dashboard";
import {
  cleanFormData,
  getLocationErrorMessage,
  geolocationOptions,
} from "../../../utils/report-form-utils";
import {
  extractGPSFromImage,
  getExifErrorMessage,
} from "../../../lib/utils/exif-extraction";
import { reverseGeocode } from "../../../lib/services/geocoding";
import { CreateReportSchema, CreateReportInput } from "../../../lib/types/api";

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
  const router = useRouter();

  // Geocoding hook for manual address/coordinates filling
  const {
    isGeocodingFromCoords,
    isGeocodingFromAddress,
    lastGeocodingSource,
    geocodingError,
    geocodeFromCoordinatesManual,
    geocodeFromAddress,
    clearError: clearGeocodingError,
    isValidCoordinates,
    isValidAddress,
  } = useGeocoding({
    onAddressFilled: (addressData) => {
      // Auto-fill address fields when coordinates are geocoded
      form.setValue("street_name", addressData.street_name);
      form.setValue("district", addressData.district);
      form.setValue("city", addressData.city);
      form.setValue("province", addressData.province);
    },
    onCoordinatesFilled: (coordData) => {
      // Auto-fill coordinates when address is geocoded
      form.setValue("lat", coordData.lat);
      form.setValue("lon", coordData.lon);
    },
  });

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
      // Redirect to dashboard after successful report creation
      router.push(`/dashboard?success=true&reportId=${reportId}`);
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
      lat: 0,
      lon: 0,
      district: "",
      city: "",
      province: "",
      // Administrative codes (optional - for backend validation)
      province_code: "",
      regency_code: "",
      district_code: "",
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

        // Perform reverse geocoding to auto-fill administrative boundaries
        try {
          const geocodingResult = await reverseGeocode(
            exifResult.gpsData.lat,
            exifResult.gpsData.lon,
          );

          if (geocodingResult.success && geocodingResult.data) {
            // Auto-fill administrative boundary fields
            if (geocodingResult.data.street_name) {
              form.setValue("street_name", geocodingResult.data.street_name);
            }
            if (geocodingResult.data.district) {
              form.setValue("district", geocodingResult.data.district);
            }
            if (geocodingResult.data.city) {
              form.setValue("city", geocodingResult.data.city);
            }
            if (geocodingResult.data.province) {
              form.setValue("province", geocodingResult.data.province);
            }

            // Show success message with all auto-filled data
            toast.success("Lokasi dan alamat berhasil diekstrak dari foto", {
              description: `${geocodingResult.data.district || ""}, ${geocodingResult.data.city || ""}, ${geocodingResult.data.province || ""}`,
              duration: 5000,
            });
          } else {
            // Only coordinates extracted, show partial success
            toast.success("Koordinat berhasil diekstrak dari foto", {
              description: `Lat: ${exifResult.gpsData.lat.toFixed(6)}, Lon: ${exifResult.gpsData.lon.toFixed(6)}. Silakan isi alamat secara manual.`,
              duration: 4000,
            });
          }
        } catch (geocodingError) {
          console.error("Geocoding error:", geocodingError);
          // Show coordinates only on geocoding failure
          toast.success("Koordinat berhasil diekstrak dari foto", {
            description: `Lat: ${exifResult.gpsData.lat.toFixed(6)}, Lon: ${exifResult.gpsData.lon.toFixed(6)}. Silakan isi alamat secara manual.`,
            duration: 4000,
          });
        }
      } else {
        // Show warning for missing GPS data
        const errorMessage = getExifErrorMessage(exifResult);
        setExifError(errorMessage);
        setHasExifWarning(true);

        // Don't show toast error immediately, let user see the warning in the form
        console.log("EXIF extraction failed:", errorMessage);
      }
    } catch (error) {
      console.warn("EXIF extraction error:", error);

      // Set a user-friendly warning message instead of breaking
      setExifError(
        "Gambar tidak memiliki data lokasi GPS. Silakan gunakan tombol lokasi atau isi koordinat secara manual.",
      );
      setHasExifWarning(true);

      // Don't throw or break the flow - this is expected for many images
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

  const getCurrentLocation = async () => {
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
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        form.setValue("lat", lat);
        form.setValue("lon", lon);

        // The geocoding will be handled automatically by the useGeocoding hook
        toast.success("Lokasi berhasil diperoleh", {
          id: "location",
          description: `Lat: ${lat.toFixed(6)}, Lon: ${lon.toFixed(6)}. Mencari alamat...`,
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

  // Manual geocoding from coordinates
  const handleGetAddressFromCoordinates = async () => {
    const lat = form.getValues("lat");
    const lon = form.getValues("lon");

    if (!isValidCoordinates(lat, lon)) {
      toast.error("Koordinat tidak valid", {
        description: "Silakan masukkan koordinat yang valid",
        duration: 4000,
      });
      return;
    }

    await geocodeFromCoordinatesManual(lat, lon);
  };

  // Manual geocoding from address
  const handleGetCoordinatesFromAddress = async () => {
    const street = form.getValues("street_name");
    const district = form.getValues("district");
    const city = form.getValues("city");
    const province = form.getValues("province");

    if (!isValidAddress(street, city)) {
      toast.error("Alamat tidak lengkap", {
        description: "Silakan isi nama jalan dan kota terlebih dahulu",
        duration: 4000,
      });
      return;
    }

    await geocodeFromAddress(street, district, city, province);
  };

  const onSubmit = async (data: CreateReportInput) => {
    setFormError(undefined);
    setUploadError(undefined);

    if (!selectedImage) {
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

  const isLoading =
    isSubmitting ||
    isUploading ||
    isUploadingImage ||
    isGettingLocation ||
    isExtractingExif ||
    isGeocodingFromCoords ||
    isGeocodingFromAddress;

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
    // Geocoding states
    isGeocodingFromCoords,
    isGeocodingFromAddress,
    lastGeocodingSource,
    geocodingError,
    // Handlers
    handleImageSelect,
    handleImageRemove,
    handleImageUploadError,
    handleImageUploadSuccess,
    getCurrentLocation,
    handleGetAddressFromCoordinates,
    handleGetCoordinatesFromAddress,
    clearGeocodingError,
    onSubmit,
  };
};
