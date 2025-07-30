"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Separator } from "@repo/ui/components/ui/separator";
import {
  ArrowLeft,
  AlertCircle,
  Edit3,
  FileText,
  MapPin,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { useReport } from "@/hooks/reports";
import { ReportDetailSkeleton } from "@/components/reports";
import EditReportForm from "@/components/reports/edit-report-form";
import Header from "@/components/layout/header";

export default function EditReportPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;

  const { data: report, isLoading, error } = useReport(reportId);

  const handleEditSuccess = (reportId: string) => {
    // Redirect to the report detail page with success message
    router.push(`/laporan/${reportId}?updated=true`);
  };

  if (isLoading) {
    return <ReportDetailSkeleton />;
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="flex min-h-screen items-center justify-center bg-neutral-50">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 h-16 w-16 text-neutral-400" />
            <h1 className="mb-2 text-2xl font-semibold text-neutral-900">
              {error instanceof Error
                ? error.message
                : "Laporan tidak ditemukan"}
            </h1>
            <p className="mb-6 text-neutral-600">
              Laporan yang Anda cari tidak dapat ditemukan atau Anda tidak
              memiliki izin untuk mengeditnya.
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

  if (!report) {
    return (
      <>
        <Header />
        <div className="flex min-h-screen items-center justify-center bg-neutral-50">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 h-16 w-16 text-neutral-400" />
            <h1 className="mb-2 text-2xl font-semibold text-neutral-900">
              Laporan tidak ditemukan
            </h1>
            <p className="mb-6 text-neutral-600">
              Laporan yang Anda cari tidak dapat ditemukan atau telah dihapus.
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

  return (
    <>
      <Header />
      <div className="min-h-screen bg-neutral-50">
        <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <nav className="mb-8">
            <div className="flex items-center gap-4 text-sm text-neutral-600">
              <Link
                href="/laporan"
                className="inline-flex items-center transition-colors hover:text-neutral-900"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Daftar Laporan
              </Link>
              <span>/</span>
              <Link
                href={`/laporan/${report.id}`}
                className="transition-colors hover:text-neutral-900"
              >
                Detail Laporan
              </Link>
              <span>/</span>
              <span className="font-medium text-neutral-900">Edit</span>
            </div>
          </nav>

          {/* Page Header */}
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-900">
                <Edit3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-neutral-900">
                  Edit Laporan
                </h1>
                <p className="text-lg text-neutral-600">
                  Perbarui informasi laporan kerusakan jalan
                </p>
              </div>
            </div>
          </div>

          {/* Current Report Info */}
          <Card className="mb-8 border-neutral-200 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-neutral-900">
                Informasi Laporan Saat Ini
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-neutral-500" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      Lokasi
                    </p>
                    <p className="text-sm text-neutral-600">
                      {report.street_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-neutral-500" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      Detail Lokasi
                    </p>
                    <p className="text-sm text-neutral-600">
                      {report.location_text}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-neutral-500" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      Tanggal Dibuat
                    </p>
                    <p className="text-sm text-neutral-600">
                      {new Date(report.created_at).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full bg-neutral-500" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      Kategori
                    </p>
                    <p className="text-sm text-neutral-600 capitalize">
                      {report.category}
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="bg-neutral-200" />

              <div className="text-sm text-neutral-600">
                <p className="mb-2 font-medium">Catatan:</p>
                <ul className="list-inside list-disc space-y-1">
                  <li>Anda dapat mengubah semua informasi laporan</li>
                  <li>Foto dapat diganti dengan foto baru yang lebih jelas</li>
                  <li>Lokasi dapat diperbarui jika diperlukan</li>
                  <li>Perubahan akan langsung tersimpan setelah disubmit</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Edit Form */}
          <EditReportForm report={report} onSuccess={handleEditSuccess} />
        </div>
      </div>
    </>
  );
}
