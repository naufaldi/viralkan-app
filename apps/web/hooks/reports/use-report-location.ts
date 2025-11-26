import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { CreateReportInput } from "../../lib/types/api";
import { useGeocoding } from "../use-geocoding";
import { useAdministrativeSync } from "./use-administrative-sync";
import { useAdministrative } from "./use-administrative";
import { administrativeService } from "../../services/administrative";
import {
  reverseGeocodeWithNominatimData,
  type LocationData,
} from "../../lib/services/geocoding";
import {
  processNominatimAddressWithAPI,
  type EnhancedGeocodingResponse,
} from "../../lib/utils/enhanced-geocoding-handler";
import {
  getLocationErrorMessage,
  geolocationOptions,
} from "../../utils/report-form-utils";
import { toast } from "sonner";

interface UseReportLocationProps {
  form: UseFormReturn<CreateReportInput>;
}

export const useReportLocation = ({ form }: UseReportLocationProps) => {
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const { addDynamicOption } = useAdministrative();

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
      form.setValue("street_name", addressData.street_name, {
        shouldValidate: true,
      });
      form.setValue("district", addressData.district, { shouldValidate: true });
      form.setValue("city", addressData.city, { shouldValidate: true });
      form.setValue("province", addressData.province, { shouldValidate: true });
    },
    onCoordinatesFilled: (coordData) => {
      form.setValue("lat", coordData.lat, { shouldValidate: true });
      form.setValue("lon", coordData.lon, { shouldValidate: true });
    },
  });

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

  const applyAdministrativeSearchResults = async (
    enhancedResult: EnhancedGeocodingResponse,
  ) => {
    try {
      if (
        enhancedResult.administrative.province.code &&
        enhancedResult.administrative.province.name
      ) {
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

      if (
        enhancedResult.administrative.regency.code &&
        enhancedResult.administrative.regency.name
      ) {
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

      if (
        enhancedResult.administrative.district.code &&
        enhancedResult.administrative.district.name
      ) {
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

      await form.trigger();
    } catch (error) {
      console.error("Error applying administrative search results:", error);
    }
  };

  const applyGeocodingAdministrativeFallbacks = (
    geocodingData: LocationData,
    enhancedResult?: EnhancedGeocodingResponse,
  ) => {
    const provinceName =
      enhancedResult?.administrative.province.name ||
      geocodingData.province ||
      "";
    const regencyName =
      enhancedResult?.administrative.regency.name || geocodingData.city || "";
    const districtName =
      enhancedResult?.administrative.district.name ||
      geocodingData.district ||
      "";

    const provinceCode = enhancedResult?.administrative.province.code || "";
    const regencyCode = enhancedResult?.administrative.regency.code || "";
    const districtCode = enhancedResult?.administrative.district.code || "";

    form.setValue("province", provinceName, { shouldValidate: true });
    form.setValue("province_code", provinceCode, { shouldValidate: true });
    form.setValue("city", regencyName, { shouldValidate: true });
    form.setValue("regency_code", regencyCode, { shouldValidate: true });
    form.setValue("district", districtName, { shouldValidate: true });
    form.setValue("district_code", districtCode, { shouldValidate: true });
  };

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);

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

        try {
          const geocodingResult = await reverseGeocodeWithNominatimData(
            lat,
            lon,
          );

          if (geocodingResult.success && geocodingResult.data) {
            const enhancedResult = await processNominatimAddressWithAPI(
              geocodingResult.data,
            );

            await applyAdministrativeSearchResults(enhancedResult);
            applyGeocodingAdministrativeFallbacks(
              geocodingResult.data,
              enhancedResult,
            );

            if (geocodingResult.data.street_name) {
              form.setValue("street_name", geocodingResult.data.street_name, {
                shouldValidate: true,
              });
            }

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
        const enhancedResult = await processNominatimAddressWithAPI(
          geocodingResult.data,
        );

        applyGeocodingAdministrativeFallbacks(
          geocodingResult.data,
          enhancedResult,
        );
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

        if (geocodingResult.data.street_name) {
          form.setValue("street_name", geocodingResult.data.street_name, {
            shouldValidate: true,
          });
        }

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

  return {
    isGettingLocation,
    isGeocodingFromCoords,
    isGeocodingFromAddress,
    lastGeocodingSource,
    geocodingError,
    syncStatus,
    hasValidMatch,
    confidenceLevel,
    canAutoSelect,
    isProcessingAdminSync,
    clearGeocodingError,
    clearSync,
    getCurrentLocation,
    handleGetAddressFromCoordinates,
    handleGetCoordinatesFromAddress,
    applyAdministrativeSearchResults,
  };
};
