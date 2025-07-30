import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Badge } from "@repo/ui/components/ui/badge";
import { Search, Filter, X } from "lucide-react";
import { REPORT_CATEGORIES } from "@/constant/reports";

interface ReportFiltersProps {
  selectedCategory?: "berlubang" | "retak" | "lainnya";
  searchQuery: string;
  onCategoryChange: (category?: "berlubang" | "retak" | "lainnya") => void;
  onSearchChange: (query: string) => void;
}

export function ReportFilters({
  selectedCategory,
  searchQuery,
  onCategoryChange,
  onSearchChange,
}: ReportFiltersProps) {
  const categoryConfig = REPORT_CATEGORIES;
  const categories = Object.entries(categoryConfig) as [
    keyof typeof categoryConfig,
    (typeof categoryConfig)[keyof typeof categoryConfig],
  ][];

  const handleClearFilters = () => {
    onCategoryChange(undefined);
    onSearchChange("");
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-neutral-500" />
          <Input
            placeholder="Cari lokasi atau nama jalan..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="rounded-md border-neutral-200 pl-10 focus:border-neutral-800 focus:ring-neutral-800/12"
          />
        </div>
      </div>

      {/* Category Filters Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-neutral-600" />
          <span className="text-sm font-medium text-neutral-700">
            Filter Kategori:
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* All Reports Button */}
          <Button
            variant={selectedCategory ? "outline" : "default"}
            size="sm"
            onClick={() => onCategoryChange(undefined)}
            className={
              selectedCategory
                ? "rounded-md border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
                : "rounded-md bg-neutral-800 text-white hover:bg-neutral-900"
            }
          >
            Semua Laporan
          </Button>

          {/* Category Buttons */}
          {categories.map(([key, config]) => {
            const isActive = selectedCategory === key;
            const isPothole = key === "berlubang";

            return (
              <Button
                key={key}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryChange(key)}
                className={
                  isActive
                    ? `${
                        isPothole
                          ? "bg-red-600 text-white hover:bg-red-700"
                          : "bg-neutral-800 text-white hover:bg-neutral-900"
                      } rounded-md`
                    : "rounded-md border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
                }
              >
                <span className="mr-2">{config.icon}</span>
                {config.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Active Filters Display */}
      {(selectedCategory || searchQuery) && (
        <div className="flex items-center gap-3 border-t border-neutral-200 pt-4">
          <span className="text-sm text-neutral-600">Filter aktif:</span>

          {selectedCategory && (
            <Badge
              variant="secondary"
              className="rounded-full border-neutral-200 bg-neutral-100 px-3 py-1 text-neutral-700"
            >
              <span className="mr-1">
                {categoryConfig[selectedCategory].icon}
              </span>
              {categoryConfig[selectedCategory].label}
            </Badge>
          )}

          {searchQuery && (
            <Badge
              variant="secondary"
              className="rounded-full border-neutral-200 bg-neutral-100 px-3 py-1 text-neutral-700"
            >
              &quot;{searchQuery}&quot;
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-auto rounded-md p-2 text-sm text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700"
          >
            <X className="mr-1 h-3 w-3" />
            Hapus filter
          </Button>
        </div>
      )}
    </div>
  );
}
