"use client";

import { useState } from "react";
import { Pagination } from "../../components/ui/pagination";
import { ReportsHero } from "../../components/reports/reports-hero";
import { ReportsFilterSection } from "../../components/reports/reports-filter-section";
import { ReportsGrid } from "../../components/reports/reports-grid";
import { ReportsErrorState } from "../../components/reports/reports-error-state";
import { useReports, useReportsStats } from "../../hooks/reports";
import Header from "components/layout/header";

type CategoryType = "berlubang" | "retak" | "lainnya";

export default function LaporanPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");

  // TanStack Query hooks
  const { 
    data: reports, 
    isLoading: reportsLoading, 
    error: reportsError 
  } = useReports({
    page: currentPage,
    limit: 20,
    category: selectedCategory || undefined,
    search: searchQuery || undefined,
  });

  const { 
    data: stats, 
    isLoading: statsLoading, 
    error: statsError 
  } = useReportsStats();

  // Transform stats to match expected format
  const transformedStats = stats ? {
    totalReports: stats.total,
    thisWeek: stats.recent,
    today: Math.floor(stats.recent / 7), // Estimate today's reports
    byCategory: {
      berlubang: stats.byCategory.berlubang || 0,
      retak: stats.byCategory.retak || 0,
      lainnya: stats.byCategory.lainnya || 0,
    },
  } : {
    totalReports: 0,
    thisWeek: 0,
    today: 0,
    byCategory: {
      berlubang: 0,
      retak: 0,
      lainnya: 0,
    },
  };

  const handleReportClick = (report: any) => {
    // Will navigate to report detail page
    console.log("Navigate to report:", report.id);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCategoryChange = (category?: CategoryType) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle error states
  if (reportsError || statsError) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <ReportsErrorState 
            error={reportsError || statsError} 
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="relative">
        {/* Hero Section */}
        <ReportsHero
          stats={transformedStats}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          isLoading={statsLoading}
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
                {reportsLoading ? (
                  "Memuat data..."
                ) : (
                  <>
                    Menampilkan {reports?.items?.length || 0} dari{" "}
                    {reports?.total || 0} laporan
                    {selectedCategory && ` untuk kategori "${selectedCategory}"`}
                    {searchQuery && ` dengan kata kunci "${searchQuery}"`}
                  </>
                )}
              </div>
            </div>

            {/* Reports Grid */}
            <ReportsGrid
              reports={reports?.items || []}
              isLoading={reportsLoading}
              onReportClick={handleReportClick}
            />

            {/* Pagination */}
            {reports && reports.pages > 1 && (
              <div className="flex justify-center mt-12">
                <Pagination
                  currentPage={currentPage}
                  totalPages={reports.pages}
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

