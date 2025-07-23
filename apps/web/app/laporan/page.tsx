import { ReportsHero } from "../../components/reports/reports-hero";
import { ReportsErrorState } from "../../components/reports/reports-error-state";
import { getPublicReportsAction, getPublicReportsStatsAction } from "../../lib/auth-actions";
import Header from "components/layout/header";
import { LaporanClientWrapper } from "../../components/reports/laporan-client-wrapper";

type CategoryType = "berlubang" | "retak" | "lainnya";

interface LaporanPageProps {
  searchParams: {
    page?: string;
    category?: CategoryType;
    search?: string;
  };
}

export default async function LaporanPage({ searchParams }: LaporanPageProps) {
  // Parse search params with defaults
  const currentPage = parseInt(searchParams.page || "1");
  const selectedCategory = searchParams.category;
  const searchQuery = searchParams.search || "";

  // Build query parameters
  const queryParams = new URLSearchParams();
  queryParams.set("page", currentPage.toString());
  queryParams.set("limit", "20");
  if (selectedCategory) queryParams.set("category", selectedCategory);
  if (searchQuery) queryParams.set("search", searchQuery);

  // Server-side data fetching
  let reports, stats, reportsError: Error | null = null, statsError: Error | null = null;
  
  try {
    [reports, stats] = await Promise.all([
      getPublicReportsAction(queryParams),
      getPublicReportsStatsAction(),
    ]);
  } catch (error) {
    console.error("Error fetching public reports:", error);
    reportsError = error instanceof Error ? error : new Error("Unknown error occurred");
  }

  // Transform stats to match expected format
  const transformedStats = stats ? {
    totalReports: stats.total || 0,
    thisWeek: stats.recent || 0,
    today: Math.floor((stats.recent || 0) / 7), // Estimate today's reports
    byCategory: {
      berlubang: stats.byCategory?.berlubang || 0,
      retak: stats.byCategory?.retak || 0,
      lainnya: stats.byCategory?.lainnya || 0,
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
          onSearchChange={() => {}} // Will be handled by client wrapper
          isLoading={false} // Server-side, no loading state
        />

        {/* Client Wrapper for Interactive Features */}
        <LaporanClientWrapper
          initialReports={reports}
          initialStats={transformedStats}
          currentPage={currentPage}
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
        />
      </main>
    </div>
  );
}

