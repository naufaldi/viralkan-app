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
        <MapPin className="h-4 w-4 text-neutral-500 flex-shrink-0" />
        <h3 className="text-sm font-medium text-neutral-900">
          Lokasi Kerusakan
        </h3>
      </div>

      {/* Primary Location - Street Name (Most Important) */}
      <div className="bg-white rounded-lg border border-neutral-200 p-3">
        <h4 className="text-base font-semibold text-neutral-900 mb-1">
          {streetName}
        </h4>
        
        {/* Administrative Path - Clean Breadcrumb */}
        <div className="flex flex-wrap items-center gap-1 text-sm text-neutral-600">
          {hierarchyItems.slice(0, -1).map((item, index) => (
            <div key={`${item.level}-${index}`} className="flex items-center">
              <span className="text-neutral-600">{item.label}</span>
              {index < hierarchyItems.length - 2 && (
                <ChevronRight className="h-3 w-3 text-neutral-400 mx-1 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Administrative Info - Collapsible for Mobile */}
      <details className="group">
        <summary className="cursor-pointer text-xs text-neutral-500 hover:text-neutral-700 transition-colors list-none flex items-center gap-1">
          <span>Detail administratif</span>
          <ChevronRight className="h-3 w-3 transition-transform group-open:rotate-90" />
        </summary>
        
        <div className="mt-2 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="space-y-1">
              <span className="text-neutral-500 block">Provinsi</span>
              <span className="text-neutral-800 font-medium block">{province}</span>
            </div>
            <div className="space-y-1">
              <span className="text-neutral-500 block">Kota/Kabupaten</span>
              <span className="text-neutral-800 font-medium block">{city}</span>
            </div>
            <div className="space-y-1">
              <span className="text-neutral-500 block">Kecamatan</span>
              <span className="text-neutral-800 font-medium block">{district}</span>
            </div>
          </div>

          {/* Coordinates - Technical Info */}
          {coordinates && (
            <div className="mt-3 pt-3 border-t border-neutral-200">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-neutral-500">Koordinat:</span>
                <code className="font-mono bg-white px-2 py-1 rounded text-neutral-700 text-xs border">
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
