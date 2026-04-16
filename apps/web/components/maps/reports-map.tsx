"use client";

import "leaflet/dist/leaflet.css";
import { useState, useMemo, useCallback, useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import {
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  type MapReport,
  type ReportCategory,
} from "../../lib/maps/constants";
import { serializeMapState, type MapUrlState } from "../../lib/maps/url-state";
import { DensityDotsLayer } from "./density-dots-layer";
import { MapFilters, type MapFiltersState } from "./map-filters";
import { MapLegend } from "./map-legend";
import { ShareMapButton } from "./share-map-button";

interface ReportsMapProps {
  reports: MapReport[];
  initialState?: MapUrlState;
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
      toDate.setHours(23, 59, 59, 999);
      if (reportDate > toDate) return false;
    }
    return true;
  });
};

/**
 * Inner component that syncs map position changes back to the URL
 * via replaceState (no server re-fetch).
 */
const MapUrlSync = ({ filters }: { filters: MapFiltersState }) => {
  const map = useMap();

  useEffect(() => {
    const syncUrl = () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      const qs = serializeMapState({
        categories: filters.categories,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        lat: center.lat,
        lng: center.lng,
        zoom,
      });
      window.history.replaceState(null, "", `/peta${qs}`);
    };

    map.on("moveend", syncUrl);
    return () => {
      map.off("moveend", syncUrl);
    };
  }, [map, filters]);

  // Also sync when filters change (without map movement)
  useEffect(() => {
    const center = map.getCenter();
    const zoom = map.getZoom();
    const qs = serializeMapState({
      categories: filters.categories,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      lat: center.lat,
      lng: center.lng,
      zoom,
    });
    window.history.replaceState(null, "", `/peta${qs}`);
  }, [map, filters]);

  return null;
};

/**
 * Full-page interactive Leaflet map displaying filtered road damage reports.
 * Composes MapFilters, DensityDotsLayer, MapLegend, and ShareMapButton.
 * Optionally restores map state from URL search params via initialState.
 */
const ReportsMap = ({ reports, initialState }: ReportsMapProps) => {
  const [filters, setFilters] = useState<MapFiltersState>({
    categories: initialState?.categories ?? ["berlubang", "retak", "lainnya"],
    dateFrom: initialState?.dateFrom ?? "",
    dateTo: initialState?.dateTo ?? "",
  });

  const center: [number, number] = initialState
    ? [initialState.lat, initialState.lng]
    : DEFAULT_CENTER;
  const zoom = initialState?.zoom ?? DEFAULT_ZOOM;

  const filteredReports = useMemo(
    () => applyFilters(reports, filters),
    [reports, filters],
  );

  const handleFiltersChange = useCallback((next: MapFiltersState) => {
    setFilters(next);
  }, []);

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 64px)" }}>
      <MapFilters filters={filters} onChange={handleFiltersChange} />
      <div className="relative flex-1">
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <DensityDotsLayer reports={filteredReports} />
          <MapUrlSync filters={filters} />
        </MapContainer>
        <MapLegend />
        <ShareMapButton />
      </div>
    </div>
  );
};

export default ReportsMap;
