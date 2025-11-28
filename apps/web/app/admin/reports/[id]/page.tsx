import { AdminReportDetail } from "@/components/admin/admin-report-detail";

interface AdminReportDetailPageProps {
  params: { id: string };
}

export default function AdminReportDetailPage({
  params,
}: AdminReportDetailPageProps) {
  return <AdminReportDetail reportId={params.id} />;
}
