import exifr from "exifr";

/**
 * Convert GPS coordinates from degrees/minutes/seconds to decimal degrees
 */
function dmsToDecimal(
  degrees: number,
  minutes: number,
  seconds: number,
  direction: string,
): number {
  let decimal = degrees + minutes / 60 + seconds / 3600;
  if (direction === "S" || direction === "W") {
    decimal = -decimal;
  }
  return decimal;
}

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

    // Extract EXIF data using exifr library - try comprehensive extraction first
    let exifData = await exifr.parse(file, {
      gps: true,
      pick: ["GPS", "DateTimeOriginal", "Make", "Model"],
    });

    // If no GPS data found, try broader extraction
    if (!exifData?.GPS) {
      exifData = await exifr.parse(file, {
        gps: true,
        // Try extracting all GPS-related tags
        pick: [
          "GPS",
          "GPSLatitude",
          "GPSLongitude",
          "GPSLatitudeRef",
          "GPSLongitudeRef",
          "DateTimeOriginal",
          "Make",
          "Model",
        ],
      });
    }

    // If still no GPS, try without filtering
    if (!exifData?.GPS) {
      const allExifData = await exifr.parse(file);
      if (allExifData) {
        exifData = allExifData;
      }
    }

    console.log("EXIF extraction debug:", {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      exifData: exifData,
      hasGPS: !!exifData?.GPS,
      gpsData: exifData?.GPS,
      allKeys: exifData ? Object.keys(exifData) : [],
      // Log all GPS-related fields
      gpsFields: exifData
        ? Object.keys(exifData).filter((k) => k.toLowerCase().includes("gps"))
        : [],
    });

    // Check if EXIF data exists
    if (!exifData) {
      return {
        success: false,
        error: "Tidak ada data EXIF ditemukan dalam gambar",
        hasExifData: false,
      };
    }

    // Check if GPS data exists in various formats
    let lat: number | undefined;
    let lon: number | undefined;

    if (exifData.GPS) {
      // Standard GPS format - check if already in decimal
      if (
        typeof exifData.GPS.latitude === "number" &&
        typeof exifData.GPS.longitude === "number"
      ) {
        lat = exifData.GPS.latitude;
        lon = exifData.GPS.longitude;
      }
      // Check for DMS format in GPS object
      else if (exifData.GPS.GPSLatitude && exifData.GPS.GPSLongitude) {
        const latDMS = exifData.GPS.GPSLatitude;
        const lonDMS = exifData.GPS.GPSLongitude;
        const latRef = exifData.GPS.GPSLatitudeRef || "N";
        const lonRef = exifData.GPS.GPSLongitudeRef || "E";

        if (
          Array.isArray(latDMS) &&
          latDMS.length >= 3 &&
          Array.isArray(lonDMS) &&
          lonDMS.length >= 3
        ) {
          lat = dmsToDecimal(latDMS[0], latDMS[1], latDMS[2], latRef);
          lon = dmsToDecimal(lonDMS[0], lonDMS[1], lonDMS[2], lonRef);
        }
      }
    }
    // Alternative GPS format at root level
    else if (exifData.GPSLatitude && exifData.GPSLongitude) {
      const latDMS = exifData.GPSLatitude;
      const lonDMS = exifData.GPSLongitude;
      const latRef = exifData.GPSLatitudeRef || "N";
      const lonRef = exifData.GPSLongitudeRef || "E";

      if (
        Array.isArray(latDMS) &&
        latDMS.length >= 3 &&
        Array.isArray(lonDMS) &&
        lonDMS.length >= 3
      ) {
        lat = dmsToDecimal(latDMS[0], latDMS[1], latDMS[2], latRef);
        lon = dmsToDecimal(lonDMS[0], lonDMS[1], lonDMS[2], lonRef);
      } else if (typeof latDMS === "number" && typeof lonDMS === "number") {
        lat = latDMS;
        lon = lonDMS;
      }
    }

    console.log("GPS coordinate extraction result:", {
      foundLat: lat,
      foundLon: lon,
      latType: typeof lat,
      lonType: typeof lon,
      isLatNumber: typeof lat === "number",
      isLonNumber: typeof lon === "number",
      isLatValid: typeof lat === "number" && !isNaN(lat),
      isLonValid: typeof lon === "number" && !isNaN(lon),
    });

    // Check if we found valid GPS coordinates
    if (
      typeof lat !== "number" ||
      typeof lon !== "number" ||
      isNaN(lat) ||
      isNaN(lon)
    ) {
      return {
        success: false,
        error: "Tidak ada data GPS ditemukan dalam gambar",
        hasExifData: !!exifData,
      };
    }

    // Validate GPS coordinates range

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
      accuracy: exifData.GPS?.GPSDilutionOfPrecision,
      altitude: exifData.GPS?.GPSAltitude,
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
