"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import type { CircleMarker as LeafletCircleMarker } from "leaflet";
import { renderToString } from "react-dom/server";
import {
  BEKASI_CENTER,
  BEKASI_ZOOM,
  STATUS_COLORS,
  type DashboardMapReport,
} from "../../lib/maps/constants";
import { MapPin } from "lucide-react";

interface DashboardMapProps {
  reports: DashboardMapReport[];
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Menunggu",
  verified: "Terverifikasi",
  rejected: "Ditolak",
};

/**
 * Popup content for a dashboard map marker. Shows thumbnail, street name,
 * status badge, date, and action links.
 */
const DashboardPopup = ({ report }: { report: DashboardMapReport }) => {
  const statusColor = STATUS_COLORS[report.status] ?? "#6b7280";
  const statusLabel = STATUS_LABELS[report.status] ?? report.status;

  return (
    <div className="w-48">
      {report.image_url && (
        // eslint-disable-next-line @next/next/no-img-element -- rendered via renderToString for Leaflet popup, outside React tree
        <img
          src={report.image_url}
          alt={report.street_name}
          className="mb-2 h-24 w-full rounded object-cover"
        />
      )}
      <p className="mb-1 text-sm font-semibold">{report.street_name}</p>
      <span
        className="mb-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white"
        style={{ backgroundColor: statusColor }}
      >
        {statusLabel}
      </span>
      <p className="mb-2 text-xs text-neutral-500">
        {new Date(report.created_at).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </p>
      <div className="flex gap-2">
        <a
          href={`/laporan/${report.id}`}
          className="text-xs font-medium text-blue-600 hover:underline"
        >
          Lihat Detail
        </a>
        <a
          href={`/laporan/${report.id}/edit`}
          className="text-xs font-medium text-neutral-600 hover:underline"
        >
          Edit
        </a>
      </div>
    </div>
  );
};

/**
 * Renders markers and auto-fits bounds to the user's reports on mount.
 */
const DashboardMarkersLayer = ({
  reports,
}: {
  reports: DashboardMapReport[];
}) => {
  const map = useMap();
  const markersRef = useRef<LeafletCircleMarker[]>([]);

  // Auto-fit bounds on mount
  useEffect(() => {
    if (reports.length === 0) return;
    const bounds = L.latLngBounds(reports.map((r) => [r.lat, r.lon]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }, [map, reports]);

  // Render markers
  useEffect(() => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    reports.forEach((report) => {
      const color = STATUS_COLORS[report.status] ?? "#6b7280";
      const marker = L.circleMarker([report.lat, report.lon], {
        radius: 10,
        fillColor: color,
        fillOpacity: 1,
        color: "#fff",
        weight: 2,
      }).addTo(map);

      const popupHtml = renderToString(<DashboardPopup report={report} />);
      marker.bindPopup(popupHtml, { maxWidth: 220 });

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
    };
  }, [map, reports]);

  return null;
};

/**
 * Interactive Leaflet map showing the current user's reports with status-based
 * marker colors. Auto-fits to report bounds on mount.
 */
const DashboardMap = ({ reports }: DashboardMapProps) => {
  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <MapPin className="mb-4 h-12 w-12 text-neutral-400" />
        <p className="mb-2 text-neutral-600">Belum ada laporan dengan lokasi</p>
        <p className="text-sm text-neutral-500">
          Laporan yang memiliki koordinat akan ditampilkan di peta ini
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg" style={{ height: "400px" }}>
      <MapContainer
        center={BEKASI_CENTER}
        zoom={BEKASI_ZOOM}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <DashboardMarkersLayer reports={reports} />
      </MapContainer>
    </div>
  );
};

export default DashboardMap;
