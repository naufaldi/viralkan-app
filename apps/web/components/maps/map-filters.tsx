"use client";

import { REPORT_CATEGORIES } from "../../constant/reports";
import type { ReportCategory } from "../../lib/maps/constants";

export interface MapFiltersState {
  categories: ReportCategory[];
  dateFrom: string;
  dateTo: string;
}

interface MapFiltersProps {
  filters: MapFiltersState;
  onChange: (filters: MapFiltersState) => void;
}

const ALL_CATEGORIES: ReportCategory[] = ["berlubang", "retak", "lainnya"];

/**
 * Category and date-range filter bar rendered above the map.
 * Calls onChange whenever the user toggles a category or adjusts a date input.
 */
export const MapFilters = ({ filters, onChange }: MapFiltersProps) => {
  const handleCategoryToggle = (category: ReportCategory) => {
    const next = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onChange({ ...filters, categories: next });
  };

  const handleReset = () => {
    onChange({ categories: ALL_CATEGORIES, dateFrom: "", dateTo: "" });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-neutral-200 bg-white px-4 py-2 shadow-sm">
      <span className="text-xs font-semibold tracking-wide text-neutral-600 uppercase">
        Filter:
      </span>

      {/* Category checkboxes */}
      <div className="flex flex-wrap gap-2">
        {ALL_CATEGORIES.map((category) => {
          const meta = REPORT_CATEGORIES[category];
          const checked = filters.categories.includes(category);
          return (
            <label
              key={category}
              className="flex cursor-pointer items-center gap-1.5 rounded-full border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50 has-[:checked]:border-red-300 has-[:checked]:bg-red-50 has-[:checked]:text-red-700"
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={() => handleCategoryToggle(category)}
              />
              {meta.icon} {meta.label}
            </label>
          );
        })}
      </div>

      {/* Date range */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-neutral-500">Dari:</span>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
          className="rounded border border-neutral-200 px-2 py-0.5 text-xs text-neutral-700 focus:ring-1 focus:ring-red-400 focus:outline-none"
        />
        <span className="text-xs text-neutral-500">Hingga:</span>
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
          className="rounded border border-neutral-200 px-2 py-0.5 text-xs text-neutral-700 focus:ring-1 focus:ring-red-400 focus:outline-none"
        />
      </div>

      {/* Reset */}
      <button
        onClick={handleReset}
        className="ml-auto rounded border border-neutral-200 px-2.5 py-1 text-xs text-neutral-600 hover:bg-neutral-100"
      >
        Reset
      </button>
    </div>
  );
};
