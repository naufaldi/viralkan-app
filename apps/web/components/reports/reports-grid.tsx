import { UniformReportCard } from "./uniform-report-card";
import { ReportsEmptyState } from "./reports-empty-state";
import { ReportsLoadingState } from "./reports-loading-state";
import { MockReportWithUser } from "../../lib/mock-data";

interface ReportsGridProps {
  reports: MockReportWithUser[];
  isLoading?: boolean;
  onReportClick?: (report: MockReportWithUser) => void;
}

export function ReportsGrid({
  reports,
  isLoading,
  onReportClick,
}: ReportsGridProps) {
  if (isLoading) {
    return <ReportsLoadingState />;
  }

  if (reports.length === 0) {
    return <ReportsEmptyState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {reports.map((report) => (
        <UniformReportCard
          key={report.id}
          report={report}
          onClick={() => onReportClick?.(report)}
        />
      ))}
    </div>
  );
}
