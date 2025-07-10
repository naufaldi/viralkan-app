import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Badge } from "@repo/ui/components/ui/badge";
import { Search, Filter } from "lucide-react";
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
    typeof categoryConfig[keyof typeof categoryConfig]
  ][];

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
        <Input
          placeholder="Cari lokasi atau nama jalan..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 border-neutral-300"
        />
      </div>

      {/* Category Filters */}
      <div className="space-y-3">
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
                ? "border-neutral-300 text-neutral-600 hover:bg-neutral-50" 
                : "bg-primary-600 hover:bg-primary-700 text-white"
            }
          >
            Semua Laporan
          </Button>

          {/* Category Buttons */}
          {categories.map(([key, config]) => (
            <Button
              key={key}
              variant={selectedCategory === key ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(key)}
              className={
                selectedCategory === key
                  ? "bg-primary-600 hover:bg-primary-700 text-white"
                  : "border-neutral-300 text-neutral-600 hover:bg-neutral-50"
              }
            >
              <span className="mr-1">{config.icon}</span>
              {config.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Active Filters Display */}
      {(selectedCategory || searchQuery) && (
        <div className="flex items-center gap-2 pt-2 border-t border-neutral-200">
          <span className="text-xs text-neutral-600">Filter aktif:</span>
          
          {selectedCategory && (
            <Badge 
              variant="secondary" 
              className="bg-primary-100 text-primary-700 border-0"
            >
              {categoryConfig[selectedCategory].icon} {categoryConfig[selectedCategory].label}
            </Badge>
          )}
          
          {searchQuery && (
            <Badge 
              variant="secondary" 
              className="bg-neutral-100 text-neutral-700 border-0"
            >
              "{searchQuery}"
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onCategoryChange(undefined);
              onSearchChange("");
            }}
            className="text-xs text-neutral-500 hover:text-neutral-700 p-1 h-auto"
          >
            Hapus filter
          </Button>
        </div>
      )}
    </div>
  );
}