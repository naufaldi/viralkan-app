"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Separator } from "@repo/ui/components/ui/separator";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  User, 
  Crosshair, 
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { REPORT_CATEGORIES } from "@/constant/reports";
import { getTimeAgo, formatCoordinates } from "@/utils/reports";
import { ReportDetailSkeleton } from "@/components/reports";
import { useReport } from "@/hooks/reports";
import Header from "@/components/layout/header";

export default function ReportDetailPage() {
  const params = useParams();
  const reportId = parseInt(params.id as string, 10);
  
  const { data: report, isLoading, error } = useReport(reportId);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "verified":
        return {
          icon: CheckCircle,
          label: "Disetujui",
          color: "bg-green-100 text-green-700 border-green-200",
          bgColor: "bg-green-50",
        };
      case "rejected":
        return {
          icon: XCircle,
          label: "Ditolak",
          color: "bg-red-100 text-red-700 border-red-200",
          bgColor: "bg-red-50",
        };
      case "deleted":
        return {
          icon: XCircle,
          label: "Dihapus",
          color: "bg-neutral-100 text-neutral-700 border-neutral-200",
          bgColor: "bg-neutral-50",
        };
      default:
        return {
          icon: Clock,
          label: "Menunggu",
          color: "bg-yellow-100 text-yellow-700 border-yellow-200",
          bgColor: "bg-yellow-50",
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
      };

  if (isLoading) {
    return <ReportDetailSkeleton />;
  }

  if (error) {
    return (
      <>
        <Header/>
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
            <h1 className="text-2xl font-semibold text-neutral-900 mb-2">
              {error instanceof Error ? error.message : "Laporan tidak ditemukan"}
            </h1>
            <p className="text-neutral-600 mb-6">
              Laporan yang Anda cari tidak dapat ditemukan atau telah dihapus.
            </p>
            <Link href="/laporan">
              <Button variant="outline" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Daftar
              </Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (!report) {
    return (
      <>
        <Header/>
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
            <h1 className="text-2xl font-semibold text-neutral-900 mb-2">
              Laporan tidak ditemukan
            </h1>
            <p className="text-neutral-600 mb-6">
              Laporan yang Anda cari tidak dapat ditemukan atau telah dihapus.
            </p>
            <Link href="/laporan">
              <Button variant="outline" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Daftar
              </Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  const categoryInfo = REPORT_CATEGORIES[report.category];
  const statusConfig = getStatusConfig(report.status);
  const StatusIcon = statusConfig.icon;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-8">
          <Link 
            href="/laporan"
            className="inline-flex items-center text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Daftar Laporan
          </Link>
        </nav>

        {/* Hero Section - Large Image */}
        <div className="mb-12">
          <div className="relative w-full h-96 lg:h-[500px] rounded-lg overflow-hidden bg-neutral-100">
            <Image
              src={report.image_url}
              alt={`Kerusakan jalan di ${report.street_name}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              priority
            />
            
            {/* Status Badge Overlay */}
            <div className="absolute top-4 left-4">
              <Badge className={`${statusConfig.color} border font-medium`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
            </div>
            
            {/* Category Badge Overlay */}
            <div className="absolute top-4 right-4">
              <Badge className={`${categoryInfo.color} border-0 font-medium`}>
                <span className="mr-1">{categoryInfo.icon}</span>
                {categoryInfo.label}
              </Badge>
            </div>
          </div>
        </div>

        {/* Content Section - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Report Title and Description */}
            <Card className="border-neutral-200 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-semibold text-neutral-900">
                  Laporan Kerusakan Jalan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Location Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-neutral-900">
                    {report.street_name}
                  </h3>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-neutral-500 mt-0.5 flex-shrink-0" />
                    <p className="text-neutral-700 leading-relaxed">
                      {report.location_text}
                    </p>
                  </div>
                  
                  {/* Coordinates if available */}
                  {report.lat && report.lon && (
                    <div className="flex items-center gap-3">
                      <Crosshair className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                      <span className="text-sm text-neutral-600 font-mono">
                        {formatCoordinates(report.lat, report.lon)}
                      </span>
                    </div>
                  )}
                </div>

                <Separator className="bg-neutral-200" />

                {/* Status Details */}
                <div className="space-y-4">
                  <h4 className="font-medium text-neutral-900">Status Laporan</h4>
                  <div className={`p-4 rounded-lg ${statusConfig.bgColor} border border-neutral-200`}>
                    <div className="flex items-center gap-3">
                      <StatusIcon className="h-5 w-5 text-neutral-600" />
                      <div>
                        <p className="font-medium text-neutral-900">
                          {statusConfig.label}
                        </p>
                        <p className="text-sm text-neutral-600">
                          {report.status === "verified" && report.verified_at && (
                            `Disetujui pada ${formatDate(report.verified_at)}`
                          )}
                          {report.status === "rejected" && report.rejection_reason && (
                            `Ditolak: ${report.rejection_reason}`
                          )}
                          {report.status === "pending" && (
                            "Laporan sedang menunggu verifikasi"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
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
                  <p className="text-sm font-medium text-neutral-900 mb-2">
                    Kategori
                  </p>
                  <Badge className={`${categoryInfo.color} border-0`}>
                    <span className="mr-1">{categoryInfo.icon}</span>
                    {categoryInfo.label}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="border-neutral-200 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-neutral-900">
                  Aksi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                  asChild
                >
                  <Link href="/laporan">
                    Lihat Semua Laporan
                  </Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                  asChild
                >
                  <Link href="/laporan/buat">
                    Buat Laporan Baru
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
