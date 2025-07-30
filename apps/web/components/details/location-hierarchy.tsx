"use client";

import { MapPin, ChevronRight } from "lucide-react";

interface LocationHierarchyProps {
  province: string;
  city: string;
  district: string;
  streetName: string;
  coordinates?: { lat: number; lon: number };
}

export function LocationHierarchy({
  province,
  city,
  district,
  streetName,
  coordinates,
}: LocationHierarchyProps) {
  const hierarchyItems = [
    { label: province, level: "province" },
    { label: city, level: "city" },
    { label: district, level: "district" },
    { label: streetName, level: "street" },
  ];

  return (
    <div className="space-y-3">
      {/* Location Header with Icon */}
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 flex-shrink-0 text-neutral-500" />
        <h3 className="text-sm font-medium text-neutral-900">
          Lokasi Kerusakan
        </h3>
      </div>

      {/* Primary Location - Street Name (Most Important) */}
      <div className="rounded-lg border border-neutral-200 bg-white p-3">
        <h4 className="mb-1 text-base font-semibold text-neutral-900">
          {streetName}
        </h4>

        {/* Administrative Path - Clean Breadcrumb */}
        <div className="flex flex-wrap items-center gap-1 text-sm text-neutral-600">
          {hierarchyItems.slice(0, -1).map((item, index) => (
            <div key={`${item.level}-${index}`} className="flex items-center">
              <span className="text-neutral-600">{item.label}</span>
              {index < hierarchyItems.length - 2 && (
                <ChevronRight className="mx-1 h-3 w-3 flex-shrink-0 text-neutral-400" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Administrative Info - Collapsible for Mobile */}
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center gap-1 text-xs text-neutral-500 transition-colors hover:text-neutral-700">
          <span>Detail administratif</span>
          <ChevronRight className="h-3 w-3 transition-transform group-open:rotate-90" />
        </summary>

        <div className="mt-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
          <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
            <div className="space-y-1">
              <span className="block text-neutral-500">Provinsi</span>
              <span className="block font-medium text-neutral-800">
                {province}
              </span>
            </div>
            <div className="space-y-1">
              <span className="block text-neutral-500">Kota/Kabupaten</span>
              <span className="block font-medium text-neutral-800">{city}</span>
            </div>
            <div className="space-y-1">
              <span className="block text-neutral-500">Kecamatan</span>
              <span className="block font-medium text-neutral-800">
                {district}
              </span>
            </div>
          </div>

          {/* Coordinates - Technical Info */}
          {coordinates && (
            <div className="mt-3 border-t border-neutral-200 pt-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-neutral-500">Koordinat:</span>
                <code className="rounded border bg-white px-2 py-1 font-mono text-xs text-neutral-700">
                  {coordinates.lat.toFixed(6)}, {coordinates.lon.toFixed(6)}
                </code>
              </div>
            </div>
          )}
        </div>
      </details>
    </div>
  );
}
