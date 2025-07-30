"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "../ui/pagination";
import { ReportsFilterSection } from "./reports-filter-section";
import { ReportsGrid } from "./reports-grid";
import type { ReportWithUser } from "../../utils/stats-utils";

type CategoryType = "berlubang" | "retak" | "lainnya";

interface ReportsData {
  items: ReportWithUser[];
  total: number;
  pages: number;
}

interface LaporanClientWrapperProps {
  initialReports: ReportsData;
  currentPage: number;
  selectedCategory?: CategoryType;
  searchQuery: string;
  provinsi?: string;
  kabupaten_kota?: string;
  kecamatan?: string;
}

export function LaporanClientWrapper({
  initialReports,
  currentPage,
  selectedCategory,
  searchQuery,
  provinsi,
  kabupaten_kota,
  kecamatan,
}: LaporanClientWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleReportClick = (report: ReportWithUser) => {
    // Will navigate to report detail page
    router.push(`/laporan/${report.id}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`/laporan?${params.toString()}`);
  };

  const handleCategoryChange = (category?: CategoryType) => {
    const params = new URLSearchParams(searchParams);
    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    params.set("page", "1"); // Reset to first page when filtering
    router.replace(`/laporan?${params.toString()}`, { scroll: false });
  };

  const handleSearchChange = (query: string) => {
    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set("search", query);
    } else {
      params.delete("search");
    }
    params.set("page", "1"); // Reset to first page when searching
    router.replace(`/laporan?${params.toString()}`, { scroll: false });
  };

  const handleProvinsiChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      params.set("provinsi", value);
    } else {
      params.delete("provinsi");
    }
    // Clear dependent filters
    params.delete("kabupaten_kota");
    params.delete("kecamatan");
    params.set("page", "1");
    router.replace(`/laporan?${params.toString()}`, { scroll: false });
  };

  const handleKabupatenKotaChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      params.set("kabupaten_kota", value);
    } else {
      params.delete("kabupaten_kota");
    }
    // Clear dependent filters
    params.delete("kecamatan");
    params.set("page", "1");
    router.replace(`/laporan?${params.toString()}`, { scroll: false });
  };

  const handleKecamatanChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      params.set("kecamatan", value);
    } else {
      params.delete("kecamatan");
    }
    params.set("page", "1");
    router.replace(`/laporan?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      {/* Filter Section */}
      <ReportsFilterSection
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
        provinsi={provinsi}
        kabupaten_kota={kabupaten_kota}
        kecamatan={kecamatan}
        onCategoryChange={handleCategoryChange}
        onSearchChange={handleSearchChange}
        onProvinsiChange={handleProvinsiChange}
        onKabupatenKotaChange={handleKabupatenKotaChange}
        onKecamatanChange={handleKecamatanChange}
      />

      {/* Gallery Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Results Summary */}
          <div className="mb-8 flex items-center justify-between">
            <div className="text-muted-foreground text-sm">
              Menampilkan {initialReports?.items?.length || 0} dari{" "}
              {initialReports?.total || 0} laporan
              {selectedCategory && ` untuk kategori "${selectedCategory}"`}
              {searchQuery && ` dengan kata kunci "${searchQuery}"`}
            </div>
          </div>

          {/* Reports Grid */}
          <ReportsGrid
            reports={initialReports?.items || []}
            isLoading={false} // Server-rendered, no loading state
            onReportClick={handleReportClick}
          />

          {/* Pagination */}
          {initialReports && initialReports.pages > 1 && (
            <div className="mt-12 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={initialReports.pages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
