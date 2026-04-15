"use client";

import "leaflet/dist/leaflet.css";
import { useState, useMemo } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import {
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  type MapReport,
  type ReportCategory,
} from "../../lib/maps/constants";
import { DensityDotsLayer } from "./density-dots-layer";
import { MapFilters, type MapFiltersState } from "./map-filters";
import { MapLegend } from "./map-legend";

interface ReportsMapProps {
  reports: MapReport[];
}

const applyFilters = (
  reports: MapReport[],
  filters: MapFiltersState,
): MapReport[] => {
  return reports.filter((report) => {
    if (!filters.categories.includes(report.category as ReportCategory))
      return false;
    if (filters.dateFrom) {
      const reportDate = new Date(report.created_at);
      const fromDate = new Date(filters.dateFrom);
      if (reportDate < fromDate) return false;
    }
    if (filters.dateTo) {
      const reportDate = new Date(report.created_at);
      const toDate = new Date(filters.dateTo);
      // Include the entire "to" day
      toDate.setHours(23, 59, 59, 999);
      if (reportDate > toDate) return false;
    }
    return true;
  });
};

const ReportsMap = ({ reports }: ReportsMapProps) => {
  const [filters, setFilters] = useState<MapFiltersState>({
    categories: ["berlubang", "retak", "lainnya"],
    dateFrom: "",
    dateTo: "",
  });

  const filteredReports = useMemo(
    () => applyFilters(reports, filters),
    [reports, filters],
  );

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 64px)" }}>
      <MapFilters filters={filters} onChange={setFilters} />
      <div className="relative flex-1">
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <DensityDotsLayer reports={filteredReports} />
        </MapContainer>
        <MapLegend />
      </div>
    </div>
  );
};

export default ReportsMap;
