import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { CreateReportInput } from "../../../lib/types/api";
import { extractGPSFromImage, getExifErrorMessage } from "../../../lib/utils/exif-extraction";
import { reverseGeocodeWithNominatimData } from "../../../lib/services/geocoding";
import { processNominatimAddressWithAPI } from "../../../lib/utils/enhanced-geocoding-handler";
import { toast } from "sonner";

interface UseReportImageProps {
  form: UseFormReturn<CreateReportInput>;
  applyAdministrativeSearchResults: (result: any) => Promise<void>;
}

export const useReportImage = ({ form, applyAdministrativeSearchResults }: UseReportImageProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | undefined>(undefined);
  const [imageUploadFailed, setImageUploadFailed] = useState(false);
  const [isExtractingExif, setIsExtractingExif] = useState(false);
  const [exifError, setExifError] = useState<string | undefined>(undefined);
  const [hasExifWarning, setHasExifWarning] = useState(false);
  const [hasExifData, setHasExifData] = useState(false);

  const handleImageSelect = async (file: File, originalFile?: File) => {
    setSelectedImage(file);
    setImageUploadFailed(false);
    const dummyUrl = "https://picsum.photos/800/600?random=1";
    form.setValue("image_url", dummyUrl);
    setUploadError(undefined);
    setExifError(undefined);
    setHasExifWarning(false);

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

  const handleImageRemove = (clearSync: () => void) => {
    setSelectedImage(null);
    setImageUploadFailed(false);
    form.setValue("image_url", "");
    setUploadError(undefined);
    setHasExifData(false);
    // Clear administrative sync state when image is removed
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
    handleImageSelect,
    handleImageRemove,
    handleImageUploadError,
    handleImageUploadSuccess,
  };
};
