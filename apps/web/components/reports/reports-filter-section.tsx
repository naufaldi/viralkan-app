import { ReportFilters } from "./report-filters";
import { AdministrativeFilters } from "./administrative-filters";

interface ReportsFilterSectionProps {
  selectedCategory?: "berlubang" | "retak" | "lainnya";
  searchQuery: string;
  provinsi?: string;
  kabupaten_kota?: string;
  kecamatan?: string;
  onCategoryChange: (category?: "berlubang" | "retak" | "lainnya") => void;
  onSearchChange: (query: string) => void;
  onProvinsiChange: (value: string) => void;
  onKabupatenKotaChange: (value: string) => void;
  onKecamatanChange: (value: string) => void;
}

export function ReportsFilterSection({
  selectedCategory,
  searchQuery,
  provinsi,
  kabupaten_kota,
  kecamatan,
  onCategoryChange,
  onSearchChange,
  onProvinsiChange,
  onKabupatenKotaChange,
  onKecamatanChange,
}: ReportsFilterSectionProps) {
  return (
    <section className="border-b border-border bg-muted/20">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <ReportFilters
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          onCategoryChange={onCategoryChange}
          onSearchChange={onSearchChange}
        />

        <AdministrativeFilters
          provinsi={provinsi}
          kabupaten_kota={kabupaten_kota}
          kecamatan={kecamatan}
          onProvinsiChange={onProvinsiChange}
          onKabupatenKotaChange={onKabupatenKotaChange}
          onKecamatanChange={onKecamatanChange}
        />
      </div>
    </section>
  );
}
