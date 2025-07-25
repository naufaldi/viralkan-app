import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { reverseGeocode, forwardGeocode } from "../lib/services/geocoding";

interface UseGeocodingOptions {
  onAddressFilled?: (data: any) => void;
  onCoordinatesFilled?: (data: any) => void;
  autoFillEnabled?: boolean;
}

interface GeocodingState {
  isGeocodingFromCoords: boolean;
  isGeocodingFromAddress: boolean;
  lastGeocodingSource: "coordinates" | "address" | null;
  geocodingError: string | null;
}

export function useGeocoding(options: UseGeocodingOptions = {}) {
  const {
    onAddressFilled,
    onCoordinatesFilled,
    autoFillEnabled = true,
  } = options;

  const [state, setState] = useState<GeocodingState>({
    isGeocodingFromCoords: false,
    isGeocodingFromAddress: false,
    lastGeocodingSource: null,
    geocodingError: null,
  });

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear error when user starts typing
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, geocodingError: null }));
  }, []);

  // Validate coordinates
  const isValidCoordinates = useCallback((lat: number, lon: number): boolean => {
    return !isNaN(lat) && !isNaN(lon) && 
           lat >= -90 && lat <= 90 && 
           lon >= -180 && lon <= 180;
  }, []);

  // Validate address (at least street + city)
  const isValidAddress = useCallback((street: string, city: string): boolean => {
    return street?.trim().length > 0 && city?.trim().length > 0;
  }, []);

  // Reverse geocoding: Coordinates → Address
  const geocodeFromCoordinates = useCallback(async (lat: number, lon: number) => {
    if (!autoFillEnabled) return;

    setState(prev => ({ 
      ...prev, 
      isGeocodingFromCoords: true, 
      geocodingError: null 
    }));

    try {
      const result = await reverseGeocode(lat, lon);

      if (result.success && result.data) {
        // Auto-fill address fields
        const addressData = {
          street_name: result.data.street_name || "",
          district: result.data.district || "",
          city: result.data.city || "",
          province: result.data.province || "",
        };

        onAddressFilled?.(addressData);

        // Show success message
        const location = [
          result.data.district,
          result.data.city,
          result.data.province
        ].filter(Boolean).join(", ");

        toast.success("Alamat berhasil ditemukan", {
          description: location || "Data lokasi berhasil diekstrak",
          duration: 4000,
        });

        setState(prev => ({ 
          ...prev, 
          lastGeocodingSource: "coordinates" 
        }));
      } else {
        const errorMsg = result.error?.message || "Gagal menemukan alamat";
        setState(prev => ({ ...prev, geocodingError: errorMsg }));
        
        toast.error("Gagal menemukan alamat", {
          description: "Silakan isi alamat secara manual",
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      const errorMsg = "Terjadi kesalahan saat mencari alamat";
      setState(prev => ({ ...prev, geocodingError: errorMsg }));
      
      toast.error("Gagal mencari alamat", {
        description: "Silakan coba lagi atau isi secara manual",
        duration: 4000,
      });
    } finally {
      setState(prev => ({ ...prev, isGeocodingFromCoords: false }));
    }
  }, [autoFillEnabled, onAddressFilled]);

  // Forward geocoding: Address → Coordinates
  const geocodeFromAddress = useCallback(async (
    street: string,
    district: string,
    city: string,
    province: string
  ) => {
    setState(prev => ({ 
      ...prev, 
      isGeocodingFromAddress: true, 
      geocodingError: null 
    }));

    try {
      // Build address string
      const addressParts = [street, district, city, province].filter(Boolean);
      const address = addressParts.join(", ");

      if (address.trim().length < 10) {
        throw new Error("Alamat terlalu pendek untuk pencarian");
      }

      const result = await forwardGeocode(address);

      if (result.success && result.data) {
        // Auto-fill coordinates
        const coordData = {
          lat: result.data.lat || 0,
          lon: result.data.lon || 0,
        };

        onCoordinatesFilled?.(coordData);

        // Show success message
        toast.success("Koordinat berhasil ditemukan", {
          description: `Lat: ${coordData.lat.toFixed(6)}, Lon: ${coordData.lon.toFixed(6)}`,
          duration: 4000,
        });

        setState(prev => ({ 
          ...prev, 
          lastGeocodingSource: "address" 
        }));
      } else {
        const errorMsg = result.error?.message || "Gagal menemukan koordinat";
        setState(prev => ({ ...prev, geocodingError: errorMsg }));
        
        toast.error("Gagal menemukan koordinat", {
          description: "Silakan masukkan koordinat secara manual",
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      const errorMsg = error instanceof Error ? error.message : "Terjadi kesalahan saat mencari koordinat";
      setState(prev => ({ ...prev, geocodingError: errorMsg }));
      
      toast.error("Gagal mencari koordinat", {
        description: "Silakan coba lagi atau masukkan secara manual",
        duration: 4000,
      });
    } finally {
      setState(prev => ({ ...prev, isGeocodingFromAddress: false }));
    }
  }, [onCoordinatesFilled]);

  // Manual coordinates geocoding (removed auto-trigger for better UX)
  const geocodeFromCoordinatesManual = useCallback(async (lat: number, lon: number) => {
    if (!isValidCoordinates(lat, lon)) {
      toast.error("Koordinat tidak valid", {
        description: "Silakan masukkan koordinat yang valid",
        duration: 4000,
      });
      return;
    }

    await geocodeFromCoordinates(lat, lon);
  }, [isValidCoordinates, geocodeFromCoordinates]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    isGeocodingFromCoords: state.isGeocodingFromCoords,
    isGeocodingFromAddress: state.isGeocodingFromAddress,
    lastGeocodingSource: state.lastGeocodingSource,
    geocodingError: state.geocodingError,
    
    // Actions
    geocodeFromCoordinatesManual,
    geocodeFromAddress,
    clearError,
    
    // Utilities
    isValidCoordinates,
    isValidAddress,
  };
} 