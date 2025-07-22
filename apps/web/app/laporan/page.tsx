"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import { MapPin, Plus, FileText } from "lucide-react";
import { ReportsGrid } from "../../components/reports/reports-grid";
import { ReportFilters } from "../../components/reports/report-filters";
import { Pagination } from "../../components/ui/pagination";
import { MockReportWithUser, mockReports } from "../../lib/mock-data";
import Header from "components/layout/header";

export default function LaporanPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<
    "berlubang" | "retak" | "lainnya" | undefined
  >();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading] = useState(false); // Will be used with real API

  const reportsPerPage = 9;

  // Filter and paginate reports
  const filteredAndPaginatedReports = useMemo(() => {
    let filtered = mockReports;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (report) =>
          report.street_name.toLowerCase().includes(query) ||
          report.location_text.toLowerCase().includes(query) ||
          report.user_name?.toLowerCase().includes(query),
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(
        (report) => report.category === selectedCategory,
      );
    }

    // Paginate
    const total = filtered.length;
    const totalPages = Math.ceil(total / reportsPerPage);
    const start = (currentPage - 1) * reportsPerPage;
    const end = start + reportsPerPage;
    const items = filtered.slice(start, end);

    return {
      items,
      total,
      page: currentPage,
      limit: reportsPerPage,
      pages: totalPages,
    };
  }, [currentPage, selectedCategory, searchQuery]);

  const handleReportClick = (report: MockReportWithUser) => {
    // Will navigate to report detail page
    console.log("Navigate to report:", report.id);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategoryChange = (
    category?: "berlubang" | "retak" | "lainnya",
  ) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
     <Header/>
      <main className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Badge
              variant="secondary"
              className="bg-primary-100 text-primary-700 border-0"
            >
              <FileText className="mr-1 h-3 w-3" />
              Daftar Laporan
            </Badge>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                Laporan Jalan Rusak
              </h1>
              <p className="text-lg text-neutral-600">
                Lihat laporan kerusakan jalan dari komunitas di seluruh
                Indonesia
              </p>
            </div>

            <Button className="bg-primary-600 hover:bg-primary-700 w-fit">
              <Plus className="mr-2 h-4 w-4" />
              Buat Laporan Baru
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-neutral-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary-600 mb-1">
              {mockReports.length}
            </div>
            <div className="text-sm text-neutral-600">Total Laporan</div>
          </div>
          <div className="bg-neutral-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-warning mb-1">
              {mockReports.filter((r) => r.category === "berlubang").length}
            </div>
            <div className="text-sm text-neutral-600">Jalan Berlubang</div>
          </div>
          <div className="bg-neutral-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-info mb-1">
              {mockReports.filter((r) => r.category === "retak").length}
            </div>
            <div className="text-sm text-neutral-600">Jalan Retak</div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <ReportFilters
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
            onCategoryChange={handleCategoryChange}
            onSearchChange={handleSearchChange}
          />
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-neutral-600">
            Menampilkan {filteredAndPaginatedReports.items.length} dari{" "}
            {filteredAndPaginatedReports.total} laporan
            {selectedCategory && ` untuk kategori "${selectedCategory}"`}
            {searchQuery && ` dengan kata kunci "${searchQuery}"`}
          </div>
        </div>

        {/* Reports Grid */}
        <div className="mb-8">
          <ReportsGrid
            reports={filteredAndPaginatedReports.items}
            isLoading={isLoading}
            onReportClick={handleReportClick}
          />
        </div>

        {/* Pagination */}
        {filteredAndPaginatedReports.pages > 1 && (
          <div className="flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={filteredAndPaginatedReports.pages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </main>
    </div>
  );
}
