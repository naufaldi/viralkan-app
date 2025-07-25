import exifr from "exifr";

/**
 * GPS coordinates extracted from EXIF data
 */
export interface ExifGPSData {
  lat: number;
  lon: number;
  accuracy?: number;
  altitude?: number;
  timestamp?: Date;
}

/**
 * Result of EXIF extraction attempt
 */
export interface ExifExtractionResult {
  success: boolean;
  gpsData?: ExifGPSData;
  error?: string;
  hasExifData: boolean;
}

/**
 * Extract GPS coordinates from image EXIF data
 * Follows RFC specification for EXIF extraction service
 */
export async function extractGPSFromImage(
  file: File,
): Promise<ExifExtractionResult> {
  try {
    // Check if file is a valid image
    if (!file.type.startsWith("image/")) {
      return {
        success: false,
        error: "File bukan gambar yang valid",
        hasExifData: false,
      };
    }

    // Extract EXIF data using exifr library
    const exifData = await exifr.parse(file, {
      gps: true,
      pick: ["GPS", "DateTimeOriginal", "Make", "Model"],
    });

    // Check if EXIF data exists
    if (!exifData) {
      return {
        success: false,
        error: "Tidak ada data EXIF ditemukan dalam gambar",
        hasExifData: false,
      };
    }

    // Check if GPS data exists
    if (
      !exifData.GPS ||
      typeof exifData.GPS.latitude !== "number" ||
      typeof exifData.GPS.longitude !== "number"
    ) {
      return {
        success: false,
        error: "Tidak ada data GPS ditemukan dalam gambar",
        hasExifData: true,
      };
    }

    // Validate GPS coordinates range
    const lat = exifData.GPS.latitude;
    const lon = exifData.GPS.longitude;

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return {
        success: false,
        error: "Koordinat GPS tidak valid",
        hasExifData: true,
      };
    }

    // Extract additional GPS metadata if available
    const gpsData: ExifGPSData = {
      lat,
      lon,
      accuracy: exifData.GPS.GPSDilutionOfPrecision,
      altitude: exifData.GPS.GPSAltitude,
      timestamp: exifData.DateTimeOriginal
        ? new Date(exifData.DateTimeOriginal)
        : undefined,
    };

    return {
      success: true,
      gpsData,
      hasExifData: true,
    };
  } catch (error) {
    console.warn("EXIF extraction failed:", error);

    // Handle specific EXIF errors gracefully
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();

      // Common EXIF extraction errors that should be warnings, not breaks
      if (
        errorMessage.includes("unknown file format") ||
        errorMessage.includes("invalid exif") ||
        errorMessage.includes("no exif") ||
        errorMessage.includes("unsupported format") ||
        errorMessage.includes("parsing failed")
      ) {
        return {
          success: false,
          error:
            "Gambar tidak memiliki data lokasi GPS atau format tidak didukung",
          hasExifData: false,
        };
      }
    }

    // For any other unexpected errors, still return gracefully
    return {
      success: false,
      error: "Tidak dapat membaca metadata gambar",
      hasExifData: false,
    };
  }
}

/**
 * Get user-friendly error message for EXIF extraction failures
 */
export function getExifErrorMessage(result: ExifExtractionResult): string {
  if (result.success) return "";

  if (!result.hasExifData) {
    return "Gambar tidak memiliki data lokasi GPS. Ini normal untuk foto yang dikirim melalui media sosial atau aplikasi chat. Gunakan tombol lokasi atau isi koordinat secara manual.";
  }

  return result.error || "Tidak dapat membaca data lokasi dari gambar";
}

/**
 * Get success message for EXIF extraction
 */
export function getExifSuccessMessage(gpsData: ExifGPSData): string {
  return `Lokasi berhasil diekstrak dari gambar (${gpsData.lat.toFixed(6)}, ${gpsData.lon.toFixed(6)})`;
}
