import { useMemo } from "react";
import { MockReportWithUser } from "../lib/mock-data";

interface UseReportsStatsOptions {
  reports: MockReportWithUser[];
}

interface ReportsStats {
  totalReports: number;
  thisWeek: number;
  today: number;
  byCategory: {
    berlubang: number;
    retak: number;
    lainnya: number;
  };
}

export function useReportsStats({ reports }: UseReportsStatsOptions): ReportsStats {
  return useMemo(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const thisWeek = reports.filter(report => {
      const reportDate = new Date(report.created_at);
      return reportDate >= oneWeekAgo;
    }).length;

    const todayReports = reports.filter(report => {
      const reportDate = new Date(report.created_at);
      const reportDay = new Date(reportDate.getFullYear(), reportDate.getMonth(), reportDate.getDate());
      return reportDay.getTime() === today.getTime();
    }).length;

    const byCategory = {
      berlubang: reports.filter(r => r.category === "berlubang").length,
      retak: reports.filter(r => r.category === "retak").length,
      lainnya: reports.filter(r => r.category === "lainnya").length,
    };

    return {
      totalReports: reports.length,
      thisWeek,
      today: todayReports,
      byCategory,
    };
  }, [reports]);
} 