/**
 * Utility functions for calculating statistics from reports data
 * Used for server-side stats generation in /laporan page
 */

export interface StatsData {
  totalReports: number;
  thisWeek: number;
  today: number;
  byCategory: {
    berlubang: number;
    retak: number;
    lainnya: number;
  };
}

export interface ReportWithUser {
  id: string;
  user_id: string;
  image_url: string;
  category: "berlubang" | "retak" | "lainnya";
  street_name: string;
  location_text: string;
  lat: number | null;
  lon: number | null;
  district: string;
  city: string;
  province: string;
  created_at: string | Date;
  user_name: string | null;
  user_avatar: string | null;
}

/**
 * Calculate comprehensive statistics from reports data
 * @param reports - Array of reports with user data
 * @returns StatsData object with calculated statistics
 */
export function calculateStatsFromReports(
  reports: ReportWithUser[],
): StatsData {
  if (!reports || reports.length === 0) {
    return {
      totalReports: 0,
      thisWeek: 0,
      today: 0,
      byCategory: {
        berlubang: 0,
        retak: 0,
        lainnya: 0,
      },
    };
  }

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Calculate total reports
  const totalReports = reports.length;

  // Calculate reports from this week
  const thisWeek = reports.filter((report) => {
    const reportDate = new Date(report.created_at);
    return reportDate >= weekAgo;
  }).length;

  // Calculate reports from today
  const today = reports.filter((report) => {
    const reportDate = new Date(report.created_at);
    return reportDate >= todayStart;
  }).length;

  // Calculate reports by category
  const byCategory = {
    berlubang: reports.filter((report) => report.category === "berlubang")
      .length,
    retak: reports.filter((report) => report.category === "retak").length,
    lainnya: reports.filter((report) => report.category === "lainnya").length,
  };

  return {
    totalReports,
    thisWeek,
    today,
    byCategory,
  };
}

/**
 * Create default/fallback stats when calculation fails
 * @returns Default StatsData with zero values
 */
export function getDefaultStats(): StatsData {
  return {
    totalReports: 0,
    thisWeek: 0,
    today: 0,
    byCategory: {
      berlubang: 0,
      retak: 0,
      lainnya: 0,
    },
  };
}

/**
 * Validate that reports data is in expected format
 * @param reports - Data to validate
 * @returns boolean indicating if data is valid
 */
export function validateReportsData(
  reports: unknown,
): reports is ReportWithUser[] {
  if (!Array.isArray(reports)) {
    return false;
  }

  if (reports.length === 0) {
    return true; // Empty array is valid
  }

  // Check first item has required fields
  const firstReport = reports[0];
  return (
    typeof firstReport === "object" &&
    firstReport !== null &&
    "id" in firstReport &&
    "category" in firstReport &&
    "created_at" in firstReport &&
    typeof firstReport.category === "string" &&
    ["berlubang", "retak", "lainnya"].includes(firstReport.category)
  );
}
