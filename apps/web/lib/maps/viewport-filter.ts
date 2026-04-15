import type { LatLngBounds } from "leaflet";
import type { MapReport } from "./constants";

/**
 * Filters reports to only those within the given Leaflet LatLngBounds.
 */
export const filterReportsInBounds = (
  reports: MapReport[],
  bounds: LatLngBounds,
): MapReport[] => {
  return reports.filter((report) => bounds.contains([report.lat, report.lon]));
};
