import { ReportsHero } from "../../components/reports/reports-hero";
import { ReportsErrorState } from "../../components/reports/reports-error-state";
import { getPublicReportsWithStats } from "../../lib/auth-actions";
import { getDefaultStats } from "../../utils/stats-utils";
import Header from "components/layout/header";
import { LaporanClientWrapper } from "../../components/reports/laporan-client-wrapper";

type CategoryType = "berlubang" | "retak" | "lainnya";

interface LaporanPageProps {
  searchParams: Promise<{
    page?: string;
    category?: CategoryType;
    search?: string;
  }>;
}

export default async function LaporanPage({ searchParams }: LaporanPageProps) {
  // Parse search params with defaults
  const params = await searchParams;
  const currentPage = parseInt(params.page || "1");
  const selectedCategory = params.category;
  const searchQuery = params.search || "";

  // Build query parameters
  const queryParams = new URLSearchParams();
  queryParams.set("page", currentPage.toString());
  queryParams.set("limit", "20");
  if (selectedCategory) queryParams.set("category", selectedCategory);
  if (searchQuery) queryParams.set("search", searchQuery);

  // Server-side data fetching with stats calculation
  let reports,
    stats,
    reportsError: Error | null = null;

  try {
    // Fetch reports and calculate stats from real data
    const result = await getPublicReportsWithStats(queryParams, true);
    reports = result.reports;
    stats = result.stats || getDefaultStats();
  } catch (error) {
    reportsError =
      error instanceof Error ? error : new Error("Unknown error occurred");
    stats = getDefaultStats();
  }

  // Stats are already in the correct format from stats-utils
  const transformedStats = stats;

  // Handle error states
  if (reportsError) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <ReportsErrorState error={reportsError} />
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
          isLoading={false} // Server-side, no loading state
        />

        {/* Client Wrapper for Interactive Features */}
        <LaporanClientWrapper
          initialReports={reports}
          currentPage={currentPage}
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
        />
      </main>
    </div>
  );
}
