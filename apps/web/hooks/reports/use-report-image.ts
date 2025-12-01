import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { CreateReportInput } from "../../lib/types/api";
import {
  extractGPSFromImage,
  getExifErrorMessage,
} from "../../lib/utils/exif-extraction";
import { reverseGeocodeWithNominatimData } from "../../lib/services/geocoding";
import { processNominatimAddressWithAPI } from "../../lib/utils/enhanced-geocoding-handler";
import { toast } from "sonner";

interface UseReportImageProps {
  form: UseFormReturn<CreateReportInput>;
  applyAdministrativeSearchResults: (result: any) => Promise<void>;
  isEditing?: boolean;
}

export const useReportImage = ({
  form,
  applyAdministrativeSearchResults,
}: UseReportImageProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | undefined>(undefined);
  const [imageUploadFailed, setImageUploadFailed] = useState(false);
  const [isExtractingExif, setIsExtractingExif] = useState(false);
  const [exifError, setExifError] = useState<string | undefined>(undefined);
  const [hasExifWarning, setHasExifWarning] = useState(false);
  const [hasExifData, setHasExifData] = useState(false);
  const [geocodingFromExifSucceeded, setGeocodingFromExifSucceeded] =
    useState(false);

  const handleImageSelect = async (file: File, originalFile?: File) => {
    setSelectedImage(file);
    setImageUploadFailed(false);
    const dummyUrl = "https://picsum.photos/800/600?random=1";
    form.setValue("image_url", dummyUrl);
    setUploadError(undefined);
    setExifError(undefined);
    setHasExifWarning(false);
    setGeocodingFromExifSucceeded(false);

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
        form.setValue("lat", exifResult.gpsData.lat, { shouldValidate: true });
        form.setValue("lon", exifResult.gpsData.lon, { shouldValidate: true });
        setHasExifData(true);

        try {
          const geocodingResult = await reverseGeocodeWithNominatimData(
            exifResult.gpsData.lat,
            exifResult.gpsData.lon,
          );

          if (geocodingResult.success && geocodingResult.data) {
            const enhancedResult = await processNominatimAddressWithAPI(
              geocodingResult.data,
            );

            await applyAdministrativeSearchResults(enhancedResult);

            if (geocodingResult.data.street_name) {
              form.setValue("street_name", geocodingResult.data.street_name, {
                shouldValidate: true,
              });
            }

            // Track geocoding success - address was auto-filled
            // Consider it successful if we have at least some address data
            const hasAddressData =
              enhancedResult.administrative.province.name ||
              geocodingResult.data.city ||
              geocodingResult.data.district;
            setGeocodingFromExifSucceeded(!!hasAddressData);

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
            // Geocoding failed - coordinates extracted but no address
            setGeocodingFromExifSucceeded(false);
            toast.success("Koordinat berhasil diekstrak dari foto", {
              description: `Lat: ${exifResult.gpsData.lat.toFixed(6)}, Lon: ${exifResult.gpsData.lon.toFixed(6)}. Silakan isi alamat secara manual.`,
              duration: 4000,
            });
          }
        } catch (geocodingError) {
          // Geocoding error - coordinates extracted but geocoding failed
          console.error("Geocoding error:", geocodingError);
          setGeocodingFromExifSucceeded(false);
          toast.success("Koordinat berhasil diekstrak dari foto", {
            description: `Lat: ${exifResult.gpsData.lat.toFixed(6)}, Lon: ${exifResult.gpsData.lon.toFixed(6)}. Silakan isi alamat secara manual.`,
            duration: 4000,
          });
        }
      } else {
        const errorMessage = getExifErrorMessage(exifResult);
        setExifError(errorMessage);
        setHasExifWarning(true);
        setHasExifData(false);

        console.log("EXIF extraction failed:", errorMessage);
      }
    } catch (error) {
      console.warn("EXIF extraction error:", error);

      setExifError(
        "Gambar tidak memiliki data lokasi GPS. Silakan gunakan tombol lokasi atau isi koordinat secara manual.",
      );
      setHasExifWarning(true);
      setHasExifData(false);
    } finally {
      setIsExtractingExif(false);
    }
  };

  const handleImageRemove = (
    clearSync: () => void,
    isEditing: boolean = false,
  ) => {
    setSelectedImage(null);
    setImageUploadFailed(false);

    // In edit mode, clear the image_url from form to require new image
    if (isEditing) {
      form.setValue("image_url", "");
    }

    setUploadError(undefined);
    setHasExifData(false);
    setGeocodingFromExifSucceeded(false);
    clearSync();
  };

  const handleImageUploadError = (error: string) => {
    setUploadError(error);
    setImageUploadFailed(true);
  };

  const handleImageUploadSuccess = () => {
    setUploadError(undefined);
    setImageUploadFailed(false);
  };

  return {
    selectedImage,
    uploadError,
    setUploadError,
    imageUploadFailed,
    isExtractingExif,
    exifError,
    hasExifWarning,
    hasExifData,
    geocodingFromExifSucceeded,
    handleImageSelect,
    handleImageRemove,
    handleImageUploadError,
    handleImageUploadSuccess,
  };
};
