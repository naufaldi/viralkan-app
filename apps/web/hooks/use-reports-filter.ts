import { useState, useMemo } from "react";
import { MockReportWithUser } from "../lib/mock-data";

interface UseReportsFilterOptions {
  reports: MockReportWithUser[];
  reportsPerPage?: number;
}

interface UseReportsFilterReturn {
  // State
  currentPage: number;
  selectedCategory: "berlubang" | "retak" | "lainnya" | undefined;
  searchQuery: string;
  
  // Computed values
  filteredAndPaginatedReports: {
    items: MockReportWithUser[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  
  // Actions
  setCurrentPage: (page: number) => void;
  setSelectedCategory: (category?: "berlubang" | "retak" | "lainnya") => void;
  setSearchQuery: (query: string) => void;
  handlePageChange: (page: number) => void;
  handleCategoryChange: (category?: "berlubang" | "retak" | "lainnya") => void;
  handleSearchChange: (query: string) => void;
}

export function useReportsFilter({ 
  reports, 
  reportsPerPage = 12 
}: UseReportsFilterOptions): UseReportsFilterReturn {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<
    "berlubang" | "retak" | "lainnya" | undefined
  >();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter and paginate reports
  const filteredAndPaginatedReports = useMemo(() => {
    let filtered = reports;

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
  }, [currentPage, selectedCategory, searchQuery, reports, reportsPerPage]);

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

  return {
    // State
    currentPage,
    selectedCategory,
    searchQuery,
    
    // Computed values
    filteredAndPaginatedReports,
    
    // Actions
    setCurrentPage,
    setSelectedCategory,
    setSearchQuery,
    handlePageChange,
    handleCategoryChange,
    handleSearchChange,
  };
} 