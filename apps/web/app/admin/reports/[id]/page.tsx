import { AdminReportDetail } from "@/components/admin/admin-report-detail";

interface AdminReportDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminReportDetailPage({
  params,
}: AdminReportDetailPageProps) {
  const { id } = await params;
  return <AdminReportDetail reportId={id} />;
}
