"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMap } from "react-leaflet";
import { renderToString } from "react-dom/server";
import L from "leaflet";
import type {
  CircleMarker as LeafletCircleMarker,
  LatLngBounds,
} from "leaflet";
import {
  CATEGORY_COLORS,
  DOT_OPACITY,
  DOT_RADIUS,
  type MapReport,
} from "../../lib/maps/constants";
import { filterReportsInBounds } from "../../lib/maps/viewport-filter";
import { ReportPopup } from "./report-popup";

interface DensityDotsLayerProps {
  reports: MapReport[];
}

export const DensityDotsLayer = ({ reports }: DensityDotsLayerProps) => {
  const map = useMap();
  const [bounds, setBounds] = useState<LatLngBounds>(() => map.getBounds());
  const markersRef = useRef<LeafletCircleMarker[]>([]);

  // Update bounds on map move/zoom
  useEffect(() => {
    const updateBounds = () => setBounds(map.getBounds());
    map.on("moveend", updateBounds);
    map.on("zoomend", updateBounds);
    return () => {
      map.off("moveend", updateBounds);
      map.off("zoomend", updateBounds);
    };
  }, [map]);

  // Viewport-culled reports
  const visibleReports = useMemo(
    () => filterReportsInBounds(reports, bounds),
    [reports, bounds],
  );

  // Render circle markers imperatively
  useEffect(() => {
    // Remove previous markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    visibleReports.forEach((report) => {
      const color = CATEGORY_COLORS[report.category] ?? "#ef4444";
      const marker = L.circleMarker([report.lat, report.lon], {
        radius: DOT_RADIUS,
        fillColor: color,
        fillOpacity: DOT_OPACITY,
        color: "transparent",
        weight: 0,
      }).addTo(map);

      const popupHtml = renderToString(<ReportPopup report={report} />);
      marker.bindPopup(popupHtml, { maxWidth: 200 });

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
    };
  }, [map, visibleReports]);

  return null;
};
