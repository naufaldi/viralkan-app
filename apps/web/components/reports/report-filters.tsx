import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Badge } from "@repo/ui/components/ui/badge";
import { Search, Filter, X } from "lucide-react";
import { categoryConfig } from "../../lib/mock-data";

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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <Input
            placeholder="Cari lokasi atau nama jalan..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 border-neutral-200 focus:border-neutral-800 focus:ring-neutral-800/12 rounded-md"
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
                ? "border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 rounded-md"
                : "bg-neutral-800 hover:bg-neutral-900 text-white rounded-md"
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
                          ? "bg-red-600 hover:bg-red-700 text-white" 
                          : "bg-neutral-800 hover:bg-neutral-900 text-white"
                      } rounded-md`
                    : "border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 rounded-md"
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
        <div className="flex items-center gap-3 pt-4 border-t border-neutral-200">
          <span className="text-sm text-neutral-600">Filter aktif:</span>

          {selectedCategory && (
            <Badge
              variant="secondary"
              className="bg-neutral-100 text-neutral-700 border-neutral-200 rounded-full px-3 py-1"
            >
              <span className="mr-1">{categoryConfig[selectedCategory].icon}</span>
              {categoryConfig[selectedCategory].label}
            </Badge>
          )}

          {searchQuery && (
            <Badge
              variant="secondary"
              className="bg-neutral-100 text-neutral-700 border-neutral-200 rounded-full px-3 py-1"
            >
              &quot;{searchQuery}&quot;
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-sm text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 p-2 h-auto rounded-md"
          >
            <X className="h-3 w-3 mr-1" />
            Hapus filter
          </Button>
        </div>
      )}
    </div>
  );
}
