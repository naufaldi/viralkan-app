import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Separator } from "@repo/ui/components/ui/separator";
import { ArrowLeft, Calendar, User, AlertCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { REPORT_CATEGORIES } from "@/constant/reports";
import { getTimeAgo } from "@/utils/reports";
import {
  ReportActions,
  ReportStatus,
  ReportStatusBadge,
  LocationHierarchy,
  ShareCount,
  ShareButton,
} from "@/components/details";
import { getReportByIdAction } from "@/lib/report-actions";
import { getAuthUser } from "@/lib/auth-server";
import Header from "@/components/layout/header";
import { ReportDetailClient } from "@/components/details/report-detail-client";

interface ReportDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ReportDetailPage({
  params,
}: ReportDetailPageProps) {
  const { id: reportId } = await params;

  try {
    // Fetch report data server-side
    const report = await getReportByIdAction(reportId);

    // Get current user for ownership check
    const currentUser = await getAuthUser();

    // Check if current user is the report owner
    const isOwner = currentUser && report.user_id === currentUser.id;
    const canEdit = isOwner || false;

    const categoryInfo =
      REPORT_CATEGORIES[report.category as keyof typeof REPORT_CATEGORIES];

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    return (
      <>
        <Header />
        <div className="min-h-screen bg-neutral-50">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Breadcrumb Navigation */}
            <nav className="mb-8">
              <Link
                href="/laporan"
                className="inline-flex items-center text-sm text-neutral-600 transition-colors hover:text-neutral-900"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Daftar Laporan
              </Link>
            </nav>

            {/* Hero Section - Large Image */}
            <div className="mb-12">
              <div className="relative h-96 w-full overflow-hidden rounded-lg bg-neutral-100 lg:h-[500px]">
                <Image
                  src={report.image_url}
                  alt={`Kerusakan jalan di ${report.street_name}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  priority
                />

                {/* Status Badge Overlay - Only show for owner */}
                <div className="absolute flex h-auto w-auto gap-4 px-4">
                  {isOwner && (
                    <ReportStatusBadge
                      className="relative left-auto"
                      status={report.status}
                    />
                  )}

                  {/* Category Badge Overlay */}
                  <div className="relative top-4">
                    <Badge
                      className={`${categoryInfo.color} border-0 font-medium`}
                    >
                      <span className="mr-1">{categoryInfo.icon}</span>
                      {categoryInfo.label}
                    </Badge>
                  </div>
                </div>

                {/* Share Button will be rendered by client component */}
                <div className="absolute top-4 right-4 z-10">
                  <ShareButton
                    reportId={report.id}
                    report={{
                      street_name: report.street_name,
                      district: report.district,
                      city: report.city,
                      province: report.province,
                      category: report.category,
                    }}
                    useDialog={true}
                    size="md"
                  />
                </div>
              </div>
            </div>

            {/* Content Section - Two Column Layout */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Main Content - Left Column */}
              <div className="space-y-8 lg:col-span-2">
                {/* Report Title and Description */}
                <Card className="border-neutral-200 bg-white">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-semibold text-neutral-900">
                      Laporan Kerusakan Jalan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Enhanced Location Information */}
                    <LocationHierarchy
                      province={report.province}
                      city={report.city}
                      district={report.district}
                      streetName={report.street_name}
                      coordinates={
                        report.lat && report.lon
                          ? { lat: report.lat, lon: report.lon }
                          : undefined
                      }
                    />

                    {/* Additional Location Details */}
                    {report.location_text && (
                      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                        <h4 className="mb-2 text-sm font-medium text-neutral-900">
                          Deskripsi Lokasi
                        </h4>
                        <p className="text-sm leading-relaxed text-neutral-700">
                          {report.location_text}
                        </p>
                      </div>
                    )}

                    <Separator className="bg-neutral-200" />

                    {/* Status Details - Only show for owner */}
                    {isOwner && (
                      <ReportStatus
                        status={report.status}
                        verifiedAt={report.verified_at}
                        rejectionReason={report.rejection_reason}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar - Right Column */}
              <div className="space-y-6">
                {/* Report Metadata */}
                <Card className="border-neutral-200 bg-white">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-neutral-900">
                      Informasi Laporan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-neutral-500" />
                      <div>
                        <p className="text-sm font-medium text-neutral-900">
                          Tanggal Laporan
                        </p>
                        <p className="text-sm text-neutral-600">
                          {formatDate(report.created_at)}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {getTimeAgo(report.created_at)}
                        </p>
                      </div>
                    </div>

                    <Separator className="bg-neutral-200" />

                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-neutral-500" />
                      <div>
                        <p className="text-sm font-medium text-neutral-900">
                          Pelapor
                        </p>
                        <p className="text-sm text-neutral-600">
                          {report.user_name || "Anonim"}
                        </p>
                      </div>
                    </div>

                    <Separator className="bg-neutral-200" />

                    <div>
                      <p className="mb-2 text-sm font-medium text-neutral-900">
                        Kategori
                      </p>
                      <Badge className={`${categoryInfo.color} border-0`}>
                        <span className="mr-1">{categoryInfo.icon}</span>
                        {categoryInfo.label}
                      </Badge>
                    </div>

                    {/* Share Count */}
                    <div data-share-count>
                      <ShareCount
                        reportId={report.id}
                        initialCount={report.share_count || 0}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <ReportActions reportId={report.id} canEdit={canEdit} />
              </div>
            </div>
          </div>
        </div>

        {/* Client-side sharing components */}
        <ReportDetailClient report={report} />
      </>
    );
  } catch (error) {
    console.error("Error in report detail page:", error);

    return (
      <>
        <Header />
        <div className="flex min-h-screen items-center justify-center bg-neutral-50">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 h-16 w-16 text-neutral-400" />
            <h1 className="mb-2 text-2xl font-semibold text-neutral-900">
              {error instanceof Error && error.message === "Report not found"
                ? "Laporan tidak ditemukan"
                : "Terjadi kesalahan"}
            </h1>
            <p className="mb-6 text-neutral-600">
              {error instanceof Error && error.message === "Report not found"
                ? "Laporan yang Anda cari tidak dapat ditemukan atau telah dihapus."
                : "Terjadi kesalahan saat memuat laporan. Silakan coba lagi."}
            </p>
            <Link href="/laporan">
              <Button variant="outline" className="mr-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Daftar
              </Button>
            </Link>
          </div>
        </div>
      </>
    );
  }
}
