"use client";

import { useState } from "react";
import { Pagination } from "../../components/ui/pagination";
import { ReportsHero } from "../../components/reports/reports-hero";
import { ReportsFilterSection } from "../../components/reports/reports-filter-section";
import { ReportsGrid } from "../../components/reports/reports-grid";
import { MockReportWithUser, mockReports } from "../../lib/mock-data";
import { useReportsFilter } from "../../hooks/use-reports-filter";
import { useReportsStats } from "../../hooks/use-reports-stats";
import Header from "components/layout/header";

export default function LaporanPage() {
  const [isLoading] = useState(false); // Will be used with real API

  // Custom hooks for data management
  const {
    currentPage,
    selectedCategory,
    searchQuery,
    filteredAndPaginatedReports,
    handlePageChange,
    handleCategoryChange,
    handleSearchChange,
  } = useReportsFilter({ reports: mockReports });

  const stats = useReportsStats({ reports: mockReports });

  const handleReportClick = (report: MockReportWithUser) => {
    // Will navigate to report detail page
    console.log("Navigate to report:", report.id);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="relative">
        {/* Hero Section */}
        <ReportsHero
          stats={stats}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
        />

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
                Menampilkan {filteredAndPaginatedReports.items.length} dari{" "}
                {filteredAndPaginatedReports.total} laporan
                {selectedCategory && ` untuk kategori "${selectedCategory}"`}
                {searchQuery && ` dengan kata kunci "${searchQuery}"`}
              </div>
            </div>

            {/* Reports Grid */}
            <ReportsGrid
              reports={filteredAndPaginatedReports.items}
              isLoading={isLoading}
              onReportClick={handleReportClick}
            />

            {/* Pagination */}
            {filteredAndPaginatedReports.pages > 1 && (
              <div className="flex justify-center mt-12">
                <Pagination
                  currentPage={currentPage}
                  totalPages={filteredAndPaginatedReports.pages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

