"use client";

import { CATEGORY_COLORS, type ReportCategory } from "../../lib/maps/constants";
import { REPORT_CATEGORIES } from "../../constant/reports";

const LEGEND_ENTRIES: ReportCategory[] = ["berlubang", "retak", "lainnya"];

export const MapLegend = () => {
  return (
    <div className="absolute bottom-8 left-2 z-[1000] rounded-lg border border-neutral-200 bg-white/90 px-3 py-2 shadow-md backdrop-blur-sm">
      <p className="mb-1.5 text-xs font-semibold text-neutral-700">Kategori</p>
      <ul className="space-y-1">
        {LEGEND_ENTRIES.map((category) => {
          const meta = REPORT_CATEGORIES[category];
          return (
            <li key={category} className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 flex-shrink-0 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[category] }}
              />
              <span className="text-xs text-neutral-600">
                {meta.icon} {meta.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
