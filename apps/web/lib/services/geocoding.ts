import { z } from "zod";

// Nominatim rate limiting configuration
const NOMINATIM_CONFIG = {
  BASE_URL: "https://nominatim.openstreetmap.org",
  RATE_LIMIT_MS: 1000, // 1 request per second as per Nominatim usage policy
  USER_AGENT: "Viralkan/1.0 (Road Damage Reporting App)",
  TIMEOUT_MS: 5000,
};

// Cache configuration
const CACHE_CONFIG = {
  TTL_SUCCESS: 24 * 60 * 60 * 1000, // 24 hours for successful results
  TTL_ERROR: 5 * 60 * 1000, // 5 minutes for error results
};

// Validation schemas
const CoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
});

const AddressSchema = z.string().min(3).max(500);

// Types
export interface LocationData {
  lat?: number;
  lon?: number;
  street_name?: string;
  district?: string;
  city?: string;
  province?: string;
  country?: string;
  geocoded_at?: string;
  geocoding_source?: "exif" | "nominatim" | "manual";
}

export interface GeocodingResult {
  success: boolean;
  data?: LocationData;
  error?: {
    code: string;
    message: string;
  };
}

interface NominatimResponse {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    road?: string;
    suburb?: string;
    village?: string;
    city_district?: string;
    neighbourhood?: string;
    city?: string;
    regency?: string;
    county?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

// Rate limiting with simple in-memory queue
class RateLimiter {
  private lastRequestTime = 0;
  private queue: Array<() => void> = [];
  private processing = false;

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      if (!this.processing) {
        void this.processQueue();
      }
    });
  }

  get queueSize(): number {
    return this.queue.length;
  }

  private async processQueue() {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    this.processing = true;
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < NOMINATIM_CONFIG.RATE_LIMIT_MS) {
      const delay = NOMINATIM_CONFIG.RATE_LIMIT_MS - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    const task = this.queue.shift();
    if (task) {
      this.lastRequestTime = Date.now();
      await task();
    }

    // Continue processing remaining tasks
    setTimeout(() => this.processQueue(), 0);
  }
}

// Simple in-memory cache (replace with Redis in production)
class GeocodingCache {
  private cache = new Map<string, { data: LocationData; expires: number }>();

  set(key: string, data: LocationData, ttl: number): void {
    const expires = Date.now() + ttl;
    this.cache.set(key, { data, expires });
  }

  get(key: string): LocationData | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expires) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

// Global instances
const rateLimiter = new RateLimiter();
const cache = new GeocodingCache();

/**
 * Make rate-limited request to Nominatim API
 */
async function makeNominatimRequest(
  url: string,
): Promise<NominatimResponse | null> {
  return rateLimiter.execute(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      NOMINATIM_CONFIG.TIMEOUT_MS,
    );

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": NOMINATIM_CONFIG.USER_AGENT,
          "Accept-Language": "id,en",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Nominatim API error: ${response.status}`);
      }

      const data = await response.json();

      // Nominatim returns array, we want the first result
      if (Array.isArray(data) && data.length > 0) {
        return data[0] as NominatimResponse;
      }

      return data as NominatimResponse;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Geocoding request timed out");
      }
      throw error;
    }
  });
}

/**
 * Parse Nominatim address components to administrative boundaries
 */
function parseNominatimAddress(
  address: NominatimResponse["address"],
): Partial<LocationData> {
  // Map Nominatim address components to administrative structure
  const result: Partial<LocationData> = {
    country: address.country || "Indonesia",
  };

  // Street name
  if (address.road) {
    result.street_name = address.road;
  }

  // District (sub-district) - Indonesian OSM administrative mapping
  if (address.suburb) {
    result.district = address.suburb;
  } else if (address.village) {
    result.district = address.village;
  } else if (address.city_district) {
    result.district = address.city_district;
  } else if (address.neighbourhood) {
    result.district = address.neighbourhood;
  }

  // City (city/regency) - Indonesian OSM uses 'regency' field
  if (address.city) {
    result.city = address.city;
  } else if (address.regency) {
    result.city = address.regency;
  } else if (address.county) {
    result.city = address.county;
  }

  // Province (province/state)
  if (address.state) {
    result.province = address.state;
  }

  return result;
}

/**
 * Reverse geocoding: Convert coordinates to address
 */
export async function reverseGeocode(
  lat: number,
  lon: number,
): Promise<GeocodingResult> {
  try {
    // Validate coordinates
    const validation = CoordinatesSchema.safeParse({ lat, lon });
    if (!validation.success) {
      return {
        success: false,
        error: {
          code: "INVALID_COORDINATES",
          message: "Invalid latitude or longitude values",
        },
      };
    }

    // Check cache
    const cacheKey = `reverse:${lat.toFixed(6)}:${lon.toFixed(6)}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return {
        success: true,
        data: {
          ...cached,
          geocoded_at: new Date().toISOString(),
          geocoding_source: "nominatim" as const,
        },
      };
    }

    // Make API request
    const url = new URL("/reverse", NOMINATIM_CONFIG.BASE_URL);
    url.searchParams.set("lat", lat.toString());
    url.searchParams.set("lon", lon.toString());
    url.searchParams.set("format", "json");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("zoom", "18"); // High detail level

    const response = await makeNominatimRequest(url.toString());

    if (!response) {
      return {
        success: false,
        error: {
          code: "LOCATION_NOT_FOUND",
          message: "No address found for these coordinates",
        },
      };
    }

    // Parse response
    const locationData = parseNominatimAddress(response.address);
    const result: LocationData = {
      lat,
      lon,
      ...locationData,
      geocoded_at: new Date().toISOString(),
      geocoding_source: "nominatim",
    };

    // Cache successful result
    cache.set(cacheKey, result, CACHE_CONFIG.TTL_SUCCESS);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return {
      success: false,
      error: {
        code: "GEOCODING_ERROR",
        message:
          error instanceof Error ? error.message : "Unknown geocoding error",
      },
    };
  }
}

/**
 * Forward geocoding: Convert address to coordinates
 */
export async function forwardGeocode(
  address: string,
): Promise<GeocodingResult> {
  try {
    // Validate address
    const validation = AddressSchema.safeParse(address);
    if (!validation.success) {
      return {
        success: false,
        error: {
          code: "INVALID_ADDRESS",
          message: "Address must be between 3 and 500 characters",
        },
      };
    }

    // Check cache
    const cacheKey = `forward:${Buffer.from(address.toLowerCase().trim()).toString("base64")}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return {
        success: true,
        data: {
          ...cached,
          geocoded_at: new Date().toISOString(),
          geocoding_source: "nominatim" as const,
        },
      };
    }

    // Make API request
    const url = new URL("/search", NOMINATIM_CONFIG.BASE_URL);
    url.searchParams.set("q", address);
    url.searchParams.set("format", "json");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("limit", "1");
    url.searchParams.set("countrycodes", "id"); // Limit to Indonesia

    const response = await makeNominatimRequest(url.toString());

    if (!response) {
      return {
        success: false,
        error: {
          code: "ADDRESS_NOT_FOUND",
          message: "Address not found",
        },
      };
    }

    // Parse response
    const lat = parseFloat(response.lat);
    const lon = parseFloat(response.lon);

    if (isNaN(lat) || isNaN(lon)) {
      return {
        success: false,
        error: {
          code: "INVALID_RESPONSE",
          message: "Invalid coordinates in geocoding response",
        },
      };
    }

    const locationData = parseNominatimAddress(response.address);
    const result: LocationData = {
      lat,
      lon,
      ...locationData,
      geocoded_at: new Date().toISOString(),
      geocoding_source: "nominatim",
    };

    // Cache successful result
    cache.set(cacheKey, result, CACHE_CONFIG.TTL_SUCCESS);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Forward geocoding error:", error);
    return {
      success: false,
      error: {
        code: "GEOCODING_ERROR",
        message:
          error instanceof Error ? error.message : "Unknown geocoding error",
      },
    };
  }
}

/**
 * Clear geocoding cache (useful for testing or manual cache invalidation)
 */
export function clearGeocodingCache(): void {
  cache.clear();
}

/**
 * Get cache statistics for monitoring
 */
export function getCacheStats() {
  return {
    size: cache.size,
    rateLimiterQueueSize: rateLimiter.queueSize,
  };
}

/**
 * Enhanced reverse geocoding with detailed Nominatim response
 * Returns both parsed LocationData and raw Nominatim address structure
 */
export async function reverseGeocodeWithNominatimData(
  lat: number,
  lon: number,
): Promise<GeocodingResult & { nominatimAddress?: NominatimResponse["address"] }> {
  try {
    // Validate coordinates
    const validation = CoordinatesSchema.safeParse({ lat, lon });
    if (!validation.success) {
      return {
        success: false,
        error: {
          code: "INVALID_COORDINATES",
          message: "Invalid latitude or longitude values",
        },
      };
    }

    // Check cache first
    const cacheKey = `reverse:${lat.toFixed(6)}:${lon.toFixed(6)}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return {
        success: true,
        data: {
          ...cached,
          geocoded_at: new Date().toISOString(),
          geocoding_source: "nominatim" as const,
        },
      };
    }

    // Make API request
    const url = new URL("/reverse", NOMINATIM_CONFIG.BASE_URL);
    url.searchParams.set("lat", lat.toString());
    url.searchParams.set("lon", lon.toString());
    url.searchParams.set("format", "json");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("zoom", "18"); // High detail level

    const response = await makeNominatimRequest(url.toString());

    if (!response) {
      return {
        success: false,
        error: {
          code: "LOCATION_NOT_FOUND",
          message: "No address found for these coordinates",
        },
      };
    }

    // Parse response
    const locationData = parseNominatimAddress(response.address);
    const result: LocationData = {
      lat,
      lon,
      ...locationData,
      geocoded_at: new Date().toISOString(),
      geocoding_source: "nominatim",
    };

    // Cache successful result
    cache.set(cacheKey, result, CACHE_CONFIG.TTL_SUCCESS);

    return {
      success: true,
      data: result,
      nominatimAddress: response.address,
    };
  } catch (error) {
    console.error("Enhanced reverse geocoding error:", error);
    return {
      success: false,
      error: {
        code: "GEOCODING_ERROR",
        message:
          error instanceof Error ? error.message : "Unknown geocoding error",
      },
    };
  }
}
