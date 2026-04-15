export type ReportCategory = "berlubang" | "retak" | "lainnya";

export interface MapReport {
  id: string;
  lat: number;
  lon: number;
  category: ReportCategory;
  street_name: string;
  image_url: string;
  created_at: string;
}

export const CATEGORY_COLORS: Record<ReportCategory, string> = {
  berlubang: "#ef4444",
  retak: "#f97316",
  lainnya: "#eab308",
};

export const DOT_RADIUS = 8;
export const DOT_OPACITY = 0.3;

export const DEFAULT_CENTER: [number, number] = [-2.5, 118.0];
export const DEFAULT_ZOOM = 5;
