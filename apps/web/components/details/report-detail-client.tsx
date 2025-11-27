"use client";
import { ShareCount } from "./share-count";

interface ReportDetailClientProps {
  report: {
    id: string;
    share_count?: number;
  };
}

export function ReportDetailClient({ report }: ReportDetailClientProps) {
  return (
    <div style={{ display: "none" }}>
      {/* This component is hidden but handles share count updates */}
      <ShareCount reportId={report.id} initialCount={report.share_count || 0} />
    </div>
  );
}
