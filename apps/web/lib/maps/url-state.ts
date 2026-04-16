import { DEFAULT_CENTER, DEFAULT_ZOOM, type ReportCategory } from "./constants";

const ALL_CATEGORIES: ReportCategory[] = ["berlubang", "retak", "lainnya"];

export interface MapUrlState {
  categories: ReportCategory[];
  dateFrom: string;
  dateTo: string;
  lat: number;
  lng: number;
  zoom: number;
}

/**
 * Parse URL search params into a typed MapUrlState, falling back to defaults
 * for missing or invalid values.
 */
export const parseMapStateFromParams = (
  searchParams: URLSearchParams,
): MapUrlState => {
  const categoriesRaw = searchParams.get("categories");
  const categories = categoriesRaw
    ? (categoriesRaw
        .split(",")
        .filter((c) =>
          ALL_CATEGORIES.includes(c as ReportCategory),
        ) as ReportCategory[])
    : ALL_CATEGORIES;

  const lat = clampNumber(searchParams.get("lat"), -90, 90, DEFAULT_CENTER[0]);
  const lng = clampNumber(
    searchParams.get("lng"),
    -180,
    180,
    DEFAULT_CENTER[1],
  );
  const zoom = clampNumber(searchParams.get("zoom"), 1, 18, DEFAULT_ZOOM);

  return {
    categories: categories.length > 0 ? categories : ALL_CATEGORIES,
    dateFrom: searchParams.get("dateFrom") ?? "",
    dateTo: searchParams.get("dateTo") ?? "",
    lat,
    lng,
    zoom,
  };
};

/**
 * Serialize map state into a query string. Omits params that match defaults
 * to keep URLs short.
 */
export const serializeMapState = (state: MapUrlState): string => {
  const params = new URLSearchParams();

  const isAllCategories =
    state.categories.length === ALL_CATEGORIES.length &&
    ALL_CATEGORIES.every((c) => state.categories.includes(c));
  if (!isAllCategories) {
    params.set("categories", state.categories.join(","));
  }

  if (state.dateFrom) params.set("dateFrom", state.dateFrom);
  if (state.dateTo) params.set("dateTo", state.dateTo);

  if (state.lat !== DEFAULT_CENTER[0]) {
    params.set("lat", roundCoord(state.lat));
  }
  if (state.lng !== DEFAULT_CENTER[1]) {
    params.set("lng", roundCoord(state.lng));
  }
  if (state.zoom !== DEFAULT_ZOOM) {
    params.set("zoom", String(Math.round(state.zoom)));
  }

  const qs = params.toString();
  return qs ? `?${qs}` : "";
};

const clampNumber = (
  raw: string | null,
  min: number,
  max: number,
  fallback: number,
): number => {
  if (raw === null) return fallback;
  const parsed = Number(raw);
  if (Number.isNaN(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
};

const roundCoord = (n: number): string => n.toFixed(4);
