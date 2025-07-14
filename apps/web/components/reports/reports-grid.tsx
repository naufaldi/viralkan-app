import { ReportCard } from "./report-card";
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
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="bg-neutral-100 rounded-lg h-80 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔍</span>
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Tidak ada laporan ditemukan
        </h3>
        <p className="text-neutral-600">
          Coba ubah filter atau kata kunci pencarian Anda
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reports.map((report) => (
        <ReportCard
          key={report.id}
          report={report}
          onClick={() => onReportClick?.(report)}
        />
      ))}
    </div>
  );
}
