import { createError, createSuccess } from "@/types";
import type { AppResult } from "@/types";
import type {
  ForwardGeocodeRequest,
  GeocodingResult,
  ReverseGeocodeRequest,
} from "./types";

type NominatimAddress = {
  road?: string;
  pedestrian?: string;
  neighbourhood?: string;
  suburb?: string;
  village?: string;
  town?: string;
  city?: string;
  city_district?: string;
  county?: string;
  state_district?: string;
  state?: string;
  postcode?: string;
};

type NominatimResponse = {
  lat: string;
  lon: string;
  address?: NominatimAddress;
};

const NOMINATIM_BASE_URL =
  process.env.NOMINATIM_BASE_URL ?? "https://nominatim.openstreetmap.org";
const NOMINATIM_USER_AGENT =
  process.env.NOMINATIM_USER_AGENT ?? "viralkan-api/1.0 (contact@viralkan)";
const NOMINATIM_EMAIL = process.env.NOMINATIM_EMAIL;
const NOMINATIM_RATE_LIMIT_MS = Number(
  process.env.NOMINATIM_RATE_LIMIT_MS ?? "1000",
);
const NOMINATIM_RETRY_MS = Number(
  process.env.NOMINATIM_RETRY_MS ?? NOMINATIM_RATE_LIMIT_MS,
);
const NOMINATIM_MAX_RETRIES = Number(process.env.NOMINATIM_MAX_RETRIES ?? "2");

let lastRequestAt = 0;

const sleep = async (ms: number) => {
  if (ms <= 0) return;
  if (typeof Bun !== "undefined") {
    await Bun.sleep(ms);
    return;
  }
  await new Promise((resolve) => setTimeout(resolve, ms));
};

const enforceRateLimit = async () => {
  const now = Date.now();
  const elapsed = now - lastRequestAt;
  if (elapsed < NOMINATIM_RATE_LIMIT_MS) {
    await sleep(NOMINATIM_RATE_LIMIT_MS - elapsed);
  }
  lastRequestAt = Date.now();
};

const fetchNominatim = async (url: URL, attempt: number = 1) => {
  await enforceRateLimit();

  const response = await fetch(url.toString(), {
    headers: nominatimHeaders(),
    method: "GET",
  });

  if (response.status === 429 && attempt < NOMINATIM_MAX_RETRIES) {
    await sleep(NOMINATIM_RETRY_MS);
    return fetchNominatim(url, attempt + 1);
  }

  return response;
};

const parseAddress = (
  address?: NominatimAddress,
): Pick<GeocodingResult, "street_name" | "district" | "city" | "province"> => {
  if (!address) {
    return {};
  }

  const street_name =
    address.road ??
    address.pedestrian ??
    address.neighbourhood ??
    address.suburb;

  const district =
    address.city_district ??
    address.state_district ??
    address.suburb ??
    address.county;

  const city =
    address.city ??
    address.town ??
    address.village ??
    address.county ??
    address.state_district;

  const province = address.state;

  return {
    street_name,
    district,
    city,
    province,
  };
};

const nominatimHeaders = () => {
  const headers: Record<string, string> = {
    "User-Agent": NOMINATIM_USER_AGENT,
    "Accept-Language": "id,en;q=0.8",
  };

  if (NOMINATIM_EMAIL) {
    headers["Accept"] = "application/json";
    headers["From"] = NOMINATIM_EMAIL;
  }

  return headers;
};

export const reverseGeocode = async (
  payload: ReverseGeocodeRequest,
): Promise<AppResult<GeocodingResult>> => {
  try {
    const url = new URL("/reverse", NOMINATIM_BASE_URL);
    url.searchParams.set("format", "json");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("lat", payload.lat.toString());
    url.searchParams.set("lon", payload.lon.toString());

    const response = await fetchNominatim(url);

    if (!response.ok) {
      return createError("Failed to reverse geocode location", 502);
    }

    const data = (await response.json()) as NominatimResponse;
    const parsed = parseAddress(data.address);

    return createSuccess({
      ...parsed,
      lat: Number(data.lat),
      lon: Number(data.lon),
      geocoding_source: "nominatim",
      geocoded_at: new Date(),
    });
  } catch (error) {
    console.error("Error in reverseGeocode:", error);
    return createError("Reverse geocoding failed", 500);
  }
};

export const forwardGeocode = async (
  payload: ForwardGeocodeRequest,
): Promise<AppResult<GeocodingResult>> => {
  try {
    const queryParts = [
      payload.street_name,
      payload.district,
      payload.city,
      payload.province,
    ].filter(Boolean);

    const url = new URL("/search", NOMINATIM_BASE_URL);
    url.searchParams.set("format", "json");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("limit", "1");
    url.searchParams.set("q", queryParts.join(", "));

    const response = await fetchNominatim(url);

    if (!response.ok) {
      return createError("Failed to forward geocode address", 502);
    }

    const data = (await response.json()) as
      | NominatimResponse[]
      | NominatimResponse;
    const firstResult = Array.isArray(data) ? data[0] : data;

    if (!firstResult) {
      return createError("No geocoding result found", 404);
    }

    const parsed = parseAddress(firstResult.address);

    return createSuccess({
      ...parsed,
      lat: Number(firstResult.lat),
      lon: Number(firstResult.lon),
      geocoding_source: "nominatim",
      geocoded_at: new Date(),
    });
  } catch (error) {
    console.error("Error in forwardGeocode:", error);
    return createError("Forward geocoding failed", 500);
  }
};
