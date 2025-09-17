import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
// Icons removed - not used in this file
import { useCreateReport } from "../../../hooks/use-create-report";
import { useGeocoding } from "../../../hooks/use-geocoding";
import { useAdministrativeSync } from "../../../hooks/reports/use-administrative-sync";
import { useAdministrative } from "../../../hooks/reports/use-administrative";
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
import {
  reverseGeocode,
  reverseGeocodeWithNominatimData,
} from "../../../lib/services/geocoding";
import { processNominatimAddressWithAPI } from "../../../lib/utils/enhanced-geocoding-handler";
import { administrativeService } from "../../../services/api-client";
import { CreateReportSchema, CreateReportInput } from "../../../lib/types/api";

interface UseReportFormProps {
  onSuccess?: (reportId: string) => void;
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
  const [hasExifData, setHasExifData] = useState(false);

  const { getToken, isAuthenticated } = useAuth();
  const { invalidateAll } = useInvalidateDashboard();
  const router = useRouter();

  // Administrative data hook for adding dynamic options
  const { addDynamicOption } = useAdministrative();

  // Geocoding hook for manual address/coordinates filling
  const {
    isGeocodingFromCoords,
    isGeocodingFromAddress,
    lastGeocodingSource,
    geocodingError,
    geocodeFromAddress,
    clearError: clearGeocodingError,
    isValidCoordinates,
    isValidAddress,
  } = useGeocoding({
    onAddressFilled: (addressData) => {
      // Auto-fill address fields when coordinates are geocoded
      form.setValue("street_name", addressData.street_name, {
        shouldValidate: true,
      });
      form.setValue("district", addressData.district, { shouldValidate: true });
      form.setValue("city", addressData.city, { shouldValidate: true });
      form.setValue("province", addressData.province, { shouldValidate: true });
    },
    onCoordinatesFilled: (coordData) => {
      // Auto-fill coordinates when address is geocoded
      form.setValue("lat", coordData.lat, { shouldValidate: true });
      form.setValue("lon", coordData.lon, { shouldValidate: true });
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

  // Administrative synchronization hook for enhanced geocoding processing
  const {
    syncStatus,
    hasValidMatch,
    confidenceLevel,
    canAutoSelect,
    isProcessing: isProcessingAdminSync,
    clearSync,
  } = useAdministrativeSync({
    form,
    autoApply: true,
    confidenceThreshold: 0.7,
    enableValidation: true,
  });

  // Helper function to apply search results and ensure data loading
  const applyAdministrativeSearchResults = async (enhancedResult: {
    administrative: {
      province: { code: string | null; name: string | null };
      regency: { code: string | null; name: string | null };
      district: { code: string | null; name: string | null };
    };
  }) => {
    try {
      // Apply province first
      if (
        enhancedResult.administrative.province.code &&
        enhancedResult.administrative.province.name
      ) {
        // Add to dynamic options so ComboboxField can find it
        addDynamicOption("province", {
          code: enhancedResult.administrative.province.code,
          name: enhancedResult.administrative.province.name,
        });

        form.setValue(
          "province_code",
          enhancedResult.administrative.province.code,
          { shouldValidate: true },
        );
        form.setValue("province", enhancedResult.administrative.province.name, {
          shouldValidate: true,
        });

        // Ensure regency data is loaded for this province
        if (enhancedResult.administrative.regency.code) {
          try {
            await administrativeService.getRegencies(
              enhancedResult.administrative.province.code,
            );
          } catch (error) {
            console.warn("Failed to preload regency data:", error);
          }
        }
      }

      // Apply regency
      if (
        enhancedResult.administrative.regency.code &&
        enhancedResult.administrative.regency.name
      ) {
        // Add to dynamic options so ComboboxField can find it
        addDynamicOption("regency", {
          code: enhancedResult.administrative.regency.code,
          name: enhancedResult.administrative.regency.name,
        });

        form.setValue(
          "regency_code",
          enhancedResult.administrative.regency.code,
          { shouldValidate: true },
        );
        form.setValue("city", enhancedResult.administrative.regency.name, {
          shouldValidate: true,
        });

        // Ensure district data is loaded for this regency
        if (enhancedResult.administrative.district.code) {
          try {
            await administrativeService.getDistricts(
              enhancedResult.administrative.regency.code,
            );
          } catch (error) {
            console.warn("Failed to preload district data:", error);
          }
        }
      }

      // Apply district
      if (
        enhancedResult.administrative.district.code &&
        enhancedResult.administrative.district.name
      ) {
        // Add to dynamic options so ComboboxField can find it
        addDynamicOption("district", {
          code: enhancedResult.administrative.district.code,
          name: enhancedResult.administrative.district.name,
        });

        form.setValue(
          "district_code",
          enhancedResult.administrative.district.code,
          { shouldValidate: true },
        );
        form.setValue("district", enhancedResult.administrative.district.name, {
          shouldValidate: true,
        });
      }

      // Force form to re-render by triggering validation
      await form.trigger();
    } catch (error) {
      console.error("Error applying administrative search results:", error);
    }
  };

  // Clear form errors when user starts typing
  const watchedValues = form.watch();
  useEffect(() => {
    if (formError) {
      setFormError(undefined);
    }
  }, [watchedValues, formError]);

  const handleImageSelect = async (file: File, originalFile?: File) => {
    setSelectedImage(file);
    setImageUploadFailed(false);
    const dummyUrl = "https://picsum.photos/800/600?random=1";
    form.setValue("image_url", dummyUrl);
    setUploadError(undefined);
    setFormError(undefined);
    setExifError(undefined);
    setHasExifWarning(false);
    clearError();

    // Extract EXIF GPS data from the original file (before compression) if available
    const fileForExif = originalFile || file;
    console.log("EXIF extraction started:", {
      compressedFile: file.name,
      originalFile: originalFile?.name,
      usingFile: fileForExif.name,
      fileSize: fileForExif.size,
      fileType: fileForExif.type,
    });
    setIsExtractingExif(true);

    try {
      const exifResult = await extractGPSFromImage(fileForExif);

      if (exifResult.success && exifResult.gpsData) {
        // Auto-fill coordinates from EXIF data
        form.setValue("lat", exifResult.gpsData.lat, { shouldValidate: true });
        form.setValue("lon", exifResult.gpsData.lon, { shouldValidate: true });
        setHasExifData(true);

        // Perform enhanced reverse geocoding with API-based administrative matching
        try {
          const geocodingResult = await reverseGeocodeWithNominatimData(
            exifResult.gpsData.lat,
            exifResult.gpsData.lon,
          );

          if (geocodingResult.success && geocodingResult.data) {
            // Process with new API-based progressive population
            const enhancedResult = await processNominatimAddressWithAPI(
              geocodingResult.data,
            );

            // Apply the enhanced result to the form with proper data loading
            await applyAdministrativeSearchResults(enhancedResult);

            // Set basic address fields
            if (geocodingResult.data.street_name) {
              form.setValue("street_name", geocodingResult.data.street_name, {
                shouldValidate: true,
              });
            }

            // Show success message based on overall confidence
            if (enhancedResult.overallConfidence >= 0.9) {
              toast.success("Lokasi dan alamat berhasil diekstrak dengan AI", {
                description:
                  "Data administratif telah divalidasi dengan akurasi tinggi",
                duration: 5000,
              });
            } else if (enhancedResult.overallConfidence >= 0.7) {
              toast.success("Lokasi berhasil diekstrak dari foto", {
                description: "Silakan periksa keakuratan data administratif",
                duration: 5000,
              });
            } else if (enhancedResult.overallConfidence > 0) {
              toast.success(
                "Koordinat dan sebagian alamat berhasil diekstrak",
                {
                  description:
                    "Beberapa data administratif ditemukan - silakan verifikasi",
                  duration: 5000,
                },
              );
            } else {
              toast.success("Koordinat berhasil diekstrak dari foto", {
                description: `${geocodingResult.data.district || ""}, ${geocodingResult.data.city || ""} - Silakan verifikasi data administratif`,
                duration: 5000,
              });
            }
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
        setHasExifData(false);

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
      setHasExifData(false);

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
    setHasExifData(false);
    // Clear administrative sync state when image is removed
    clearSync();
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

    // Check if we're in the browser environment
    if (typeof window === "undefined") {
      toast.error("Geolokasi tidak tersedia di server", {
        duration: 3000,
      });
      setIsGettingLocation(false);
      return;
    }

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

        form.setValue("lat", lat, { shouldValidate: true });
        form.setValue("lon", lon, { shouldValidate: true });

        toast.loading("Mencari alamat dengan AI...", {
          id: "location",
        });

        // Use enhanced geocoding with API-based administrative matching
        try {
          const geocodingResult = await reverseGeocodeWithNominatimData(
            lat,
            lon,
          );

          if (geocodingResult.success && geocodingResult.data) {
            // Process with new API-based progressive population
            const enhancedResult = await processNominatimAddressWithAPI(
              geocodingResult.data,
            );

            // Apply the enhanced result to the form with proper data loading
            await applyAdministrativeSearchResults(enhancedResult);

            // Set basic address fields
            if (geocodingResult.data.street_name) {
              form.setValue("street_name", geocodingResult.data.street_name, {
                shouldValidate: true,
              });
            }

            // Show success message based on overall confidence
            if (enhancedResult.overallConfidence >= 0.9) {
              toast.success("Lokasi dan alamat berhasil ditemukan dengan AI", {
                id: "location",
                description:
                  "Data administratif telah divalidasi dengan akurasi tinggi",
                duration: 5000,
              });
            } else if (enhancedResult.overallConfidence >= 0.7) {
              toast.success("Lokasi berhasil diperoleh", {
                id: "location",
                description: "Silakan periksa keakuratan data administratif",
                duration: 5000,
              });
            } else if (enhancedResult.overallConfidence > 0) {
              toast.success(
                "Lokasi diperoleh dengan sebagian data administratif",
                {
                  id: "location",
                  description:
                    "Beberapa data administratif ditemukan - silakan verifikasi",
                  duration: 5000,
                },
              );
            } else {
              toast.success("Lokasi berhasil diperoleh", {
                id: "location",
                description: `${geocodingResult.data.district || ""}, ${geocodingResult.data.city || ""} - Silakan verifikasi data administratif`,
                duration: 3000,
              });
            }
          } else {
            toast.success("Lokasi berhasil diperoleh", {
              id: "location",
              description: `Lat: ${lat.toFixed(6)}, Lon: ${lon.toFixed(6)}. Silakan isi alamat secara manual.`,
              duration: 3000,
            });
          }
        } catch (error) {
          console.error("Enhanced geocoding error:", error);
          toast.success("Lokasi berhasil diperoleh", {
            id: "location",
            description: `Lat: ${lat.toFixed(6)}, Lon: ${lon.toFixed(6)}. Silakan isi alamat secara manual.`,
            duration: 3000,
          });
        }

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

  // Manual geocoding from coordinates with API-based administrative matching
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

    toast.loading("Mencari alamat dengan AI...", {
      id: "manual-geocode",
    });

    try {
      const geocodingResult = await reverseGeocodeWithNominatimData(lat, lon);

      if (geocodingResult.success && geocodingResult.data) {
        // Process with new API-based progressive population
        const enhancedResult = await processNominatimAddressWithAPI(
          geocodingResult.data,
        );

        // Apply the enhanced result to the form
        if (enhancedResult.administrative.province.code) {
          form.setValue(
            "province_code",
            enhancedResult.administrative.province.code,
            { shouldValidate: true },
          );
          form.setValue(
            "province",
            enhancedResult.administrative.province.name || "",
            { shouldValidate: true },
          );
        }

        if (enhancedResult.administrative.regency.code) {
          form.setValue(
            "regency_code",
            enhancedResult.administrative.regency.code,
            { shouldValidate: true },
          );
          form.setValue(
            "city",
            enhancedResult.administrative.regency.name || "",
            { shouldValidate: true },
          );
        }

        if (enhancedResult.administrative.district.code) {
          form.setValue(
            "district_code",
            enhancedResult.administrative.district.code,
            { shouldValidate: true },
          );
          form.setValue(
            "district",
            enhancedResult.administrative.district.name || "",
            { shouldValidate: true },
          );
        }

        // Set basic address fields
        if (geocodingResult.data.street_name) {
          form.setValue("street_name", geocodingResult.data.street_name, {
            shouldValidate: true,
          });
        }

        // Show success message based on overall confidence
        if (enhancedResult.overallConfidence >= 0.7) {
          toast.success("Alamat berhasil ditemukan dengan AI", {
            id: "manual-geocode",
            description: "Data administratif telah divalidasi",
            duration: 4000,
          });
        } else if (enhancedResult.overallConfidence > 0) {
          toast.success("Sebagian alamat berhasil ditemukan", {
            id: "manual-geocode",
            description:
              "Beberapa data administratif ditemukan - silakan verifikasi",
            duration: 4000,
          });
        } else {
          toast.success("Alamat dasar berhasil ditemukan", {
            id: "manual-geocode",
            description: "Silakan verifikasi dan lengkapi data administratif",
            duration: 4000,
          });
        }
      } else {
        toast.error("Alamat tidak ditemukan", {
          id: "manual-geocode",
          description: "Tidak dapat menemukan alamat untuk koordinat tersebut",
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("Manual geocoding error:", error);
      toast.error("Gagal mencari alamat", {
        id: "manual-geocode",
        description: "Terjadi kesalahan saat mencari alamat",
        duration: 4000,
      });
    }
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
    isGeocodingFromAddress ||
    isProcessingAdminSync;

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
    hasExifData,
    submitError,
    // Geocoding states
    isGeocodingFromCoords,
    isGeocodingFromAddress,
    lastGeocodingSource,
    geocodingError,
    // Administrative sync states
    syncStatus,
    hasValidMatch,
    confidenceLevel,
    canAutoSelect,
    isProcessingAdminSync,
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
