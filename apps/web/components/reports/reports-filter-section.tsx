import { ReportFilters } from "./report-filters";

interface ReportsFilterSectionProps {
  selectedCategory?: "berlubang" | "retak" | "lainnya";
  searchQuery: string;
  onCategoryChange: (category?: "berlubang" | "retak" | "lainnya") => void;
  onSearchChange: (query: string) => void;
}

export function ReportsFilterSection({
  selectedCategory,
  searchQuery,
  onCategoryChange,
  onSearchChange,
}: ReportsFilterSectionProps) {
  return (
    <section className="border-b border-border bg-muted/20">
      <div className="container mx-auto px-4 py-6">
        <ReportFilters
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          onCategoryChange={onCategoryChange}
          onSearchChange={onSearchChange}
        />
      </div>
    </section>
  );
} 