"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "../ui/pagination";
import { ReportsFilterSection } from "./reports-filter-section";
import { ReportsGrid } from "./reports-grid";

type CategoryType = "berlubang" | "retak" | "lainnya";

interface LaporanClientWrapperProps {
  initialReports: any;
  initialStats: any;
  currentPage: number;
  selectedCategory?: CategoryType;
  searchQuery: string;
}

export function LaporanClientWrapper({
  initialReports,
  initialStats,
  currentPage,
  selectedCategory,
  searchQuery,
}: LaporanClientWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleReportClick = (report: any) => {
    // Will navigate to report detail page
    console.log("Navigate to report:", report.id);
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
    router.push(`/laporan?${params.toString()}`);
  };

  const handleSearchChange = (query: string) => {
    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set("search", query);
    } else {
      params.delete("search");
    }
    params.set("page", "1"); // Reset to first page when searching
    router.push(`/laporan?${params.toString()}`);
  };

  return (
    <>
      {/* Filter Section */}
      <ReportsFilterSection
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
        onCategoryChange={handleCategoryChange}
        onSearchChange={handleSearchChange}
      />

      {/* Gallery Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Results Summary */}
          <div className="flex items-center justify-between mb-8">
            <div className="text-sm text-muted-foreground">
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
            <div className="flex justify-center mt-12">
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