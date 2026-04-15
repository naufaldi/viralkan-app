import type { LatLngBounds } from "leaflet";
import type { MapReport } from "./constants";

/**
 * Filters reports to those within the given Leaflet map bounds.
 * Used by DensityDotsLayer for viewport culling on pan/zoom.
 */
export const filterReportsInBounds = (
  reports: MapReport[],
  bounds: LatLngBounds,
): MapReport[] => {
  return reports.filter((report) => bounds.contains([report.lat, report.lon]));
};
