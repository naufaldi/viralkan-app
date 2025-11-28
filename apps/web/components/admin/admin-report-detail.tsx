"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Separator } from "@repo/ui/components/ui/separator";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  MapPin,
  ShieldCheck,
  Trash2,
  User,
  XCircle,
} from "lucide-react";
import { RejectionReasonModal } from "./rejection-reason-modal";
import {
  useAdminReportDetail,
  useDeleteReport,
  useRejectReport,
  useVerifyReport,
} from "../../hooks/admin";
import { REPORT_CATEGORIES } from "../../constant/reports";
import type { AdminReportItem } from "../../services/api-client";

interface AdminReportDetailProps {
  reportId: string;
}

const STATUS_STYLES: Record<
  AdminReportItem["status"],
  { label: string; className: string }
> = {
  pending: {
    label: "Menunggu Verifikasi",
    className:
      "bg-amber-50 text-amber-800 border border-amber-200 ring-amber-100",
  },
  verified: {
    label: "Terverifikasi",
    className:
      "bg-emerald-50 text-emerald-800 border border-emerald-200 ring-emerald-100",
  },
  rejected: {
    label: "Ditolak",
    className: "bg-red-50 text-red-800 border border-red-200 ring-red-100",
  },
  deleted: {
    label: "Dihapus",
    className:
      "bg-neutral-100 text-neutral-700 border border-neutral-200 ring-neutral-100",
  },
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCoordinates = (value: number | null) => {
  if (value === null) return "-";
  return value.toFixed(5);
};

export function AdminReportDetail({ reportId }: AdminReportDetailProps) {
  const queryClient = useQueryClient();
  const [rejectionModal, setRejectionModal] = useState({
    isOpen: false,
    reportTitle: "",
  });

  const { data: report, isLoading, error } = useAdminReportDetail(reportId);
  const verifyReport = useVerifyReport();
  const rejectReport = useRejectReport();
  const deleteReport = useDeleteReport();

  const categoryInfo = useMemo(() => {
    if (!report) {
      return null;
    }
    return (
      REPORT_CATEGORIES[report.category as keyof typeof REPORT_CATEGORIES] || {
        label: report.category,
        color: "bg-neutral-100 text-neutral-700",
      }
    );
  }, [report]);

  const handleVerify = async () => {
    try {
      await verifyReport.mutateAsync(reportId);
      toast.success("Laporan berhasil diverifikasi");
      queryClient.invalidateQueries({ queryKey: ["adminReport", reportId] });
      queryClient.invalidateQueries({ queryKey: ["adminReports"] });
    } catch (mutationError) {
      toast.error(
        mutationError instanceof Error
          ? mutationError.message
          : "Gagal memverifikasi laporan",
      );
    }
  };

  const handleReject = () => {
    setRejectionModal({
      isOpen: true,
      reportTitle: report?.street_name || "laporan ini",
    });
  };

  const handleRejectConfirm = async (reason: string) => {
    try {
      await rejectReport.mutateAsync({ reportId, reason });
      toast.success("Laporan ditolak");
      queryClient.invalidateQueries({ queryKey: ["adminReport", reportId] });
      queryClient.invalidateQueries({ queryKey: ["adminReports"] });
      setRejectionModal({ isOpen: false, reportTitle: "" });
    } catch (mutationError) {
      toast.error(
        mutationError instanceof Error
          ? mutationError.message
          : "Gagal menolak laporan",
      );
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Anda yakin ingin menghapus laporan ini? Tindakan ini dapat dipulihkan oleh admin.",
    );
    if (!confirmed) return;

    try {
      await deleteReport.mutateAsync(reportId);
      toast.success("Laporan berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["adminReport", reportId] });
      queryClient.invalidateQueries({ queryKey: ["adminReports"] });
    } catch (mutationError) {
      toast.error(
        mutationError instanceof Error
          ? mutationError.message
          : "Gagal menghapus laporan",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-48" />
        <Card className="border-neutral-200 bg-white">
          <CardContent className="p-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <Skeleton className="h-72 rounded-xl lg:col-span-2" />
              <Skeleton className="h-72 rounded-xl" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/reports"
          className="inline-flex items-center text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke daftar laporan
        </Link>
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              Gagal memuat detail laporan
            </CardTitle>
            <CardDescription className="text-red-700">
              {error instanceof Error
                ? error.message
                : "Detail laporan tidak ditemukan."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const statusStyle = STATUS_STYLES[report.status];

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/reports"
            className="inline-flex items-center text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke daftar laporan
          </Link>
          <Badge className={statusStyle.className}>{statusStyle.label}</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {report.status === "pending" && (
            <>
              <Button
                variant="default"
                size="sm"
                onClick={handleVerify}
                disabled={verifyReport.isPending}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                {verifyReport.isPending ? "Memproses..." : "Setujui"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReject}
                disabled={rejectReport.isPending}
                className="border-red-200 text-red-700 hover:bg-red-50"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Tolak
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={deleteReport.isPending}
            className="text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-neutral-200 bg-white lg:col-span-2">
          <CardHeader className="flex flex-col gap-4 border-b border-neutral-100 pb-6">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-semibold text-neutral-900">
                  {report.street_name}
                </CardTitle>
                <CardDescription className="text-neutral-600">
                  {report.location_text}
                </CardDescription>
              </div>
              {categoryInfo && (
                <Badge className={`${categoryInfo.color} border-0 text-sm`}>
                  {categoryInfo.label}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="relative h-80 w-full overflow-hidden rounded-xl bg-neutral-100">
              <Image
                src={report.image_url}
                alt={`Foto laporan di ${report.street_name}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 900px"
                priority
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                <MapPin className="mt-1 h-5 w-5 text-neutral-500" />
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    Detail Lokasi
                  </p>
                  <p className="text-sm text-neutral-700">
                    {report.street_name}
                  </p>
                  {report.location_text && (
                    <p className="text-sm text-neutral-600">
                      {report.location_text}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                <div>
                  <p className="text-xs tracking-wide text-neutral-500 uppercase">
                    Latitude
                  </p>
                  <p className="text-sm font-semibold text-neutral-900">
                    {formatCoordinates(report.lat)}
                  </p>
                </div>
                <div>
                  <p className="text-xs tracking-wide text-neutral-500 uppercase">
                    Longitude
                  </p>
                  <p className="text-sm font-semibold text-neutral-900">
                    {formatCoordinates(report.lon)}
                  </p>
                </div>
              </div>
            </div>

            <Separator className="bg-neutral-200" />

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-neutral-900">
                  Status & Riwayat
                </h3>
                <div className="space-y-2 rounded-lg border border-neutral-200 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600">Status</span>
                    <Badge className={statusStyle.className}>
                      {statusStyle.label}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600">Dibuat</span>
                    <span className="font-medium text-neutral-900">
                      {formatDateTime(report.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600">Diverifikasi</span>
                    <span className="font-medium text-neutral-900">
                      {formatDateTime(report.verified_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600">Ditolak</span>
                    <span className="font-medium text-neutral-900">
                      {formatDateTime(
                        report.status === "rejected"
                          ? report.verified_at || report.deleted_at
                          : null,
                      )}
                    </span>
                  </div>
                  {report.rejection_reason && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                      {report.rejection_reason}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-neutral-900">
                  Data Pelapor
                </h3>
                <div className="space-y-3 rounded-lg border border-neutral-200 p-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-neutral-500" />
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">
                        {report.user?.name || "Tidak diketahui"}
                      </p>
                      <p className="text-sm text-neutral-600">
                        {report.user?.email || "Email tidak tersedia"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-neutral-500" />
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">
                        Waktu Laporan
                      </p>
                      <p className="text-sm text-neutral-600">
                        {formatDateTime(report.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-neutral-200 bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-neutral-900">
                Identitas Laporan
              </CardTitle>
              <CardDescription className="text-neutral-600">
                Informasi meta untuk audit dan pelacakan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <p className="text-neutral-500">ID Laporan</p>
                <p className="font-mono text-neutral-900">{report.id}</p>
              </div>
              <div className="text-sm">
                <p className="text-neutral-500">ID Pengguna</p>
                <p className="font-mono text-neutral-900">{report.user_id}</p>
              </div>
              {report.verified_by && (
                <div className="text-sm">
                  <p className="text-neutral-500">Diverifikasi oleh</p>
                  <p className="font-mono text-neutral-900">
                    {report.verified_by}
                  </p>
                </div>
              )}
              {report.deleted_at && (
                <div className="text-sm">
                  <p className="text-neutral-500">Dihapus pada</p>
                  <p className="font-mono text-neutral-900">
                    {formatDateTime(report.deleted_at)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-neutral-200 bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-neutral-900">
                Ringkasan Status
              </CardTitle>
              <CardDescription className="text-neutral-600">
                Tindakan moderasi terbaru terhadap laporan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">Status</span>
                <Badge className={statusStyle.className}>
                  {statusStyle.label}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">Dibuat</span>
                <span className="font-medium text-neutral-900">
                  {formatDateTime(report.created_at)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">Diverifikasi</span>
                <span className="font-medium text-neutral-900">
                  {formatDateTime(report.verified_at)}
                </span>
              </div>
              {report.rejection_reason && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  <p className="font-semibold">Alasan penolakan</p>
                  <p>{report.rejection_reason}</p>
                </div>
              )}
              {report.status === "pending" && (
                <div className="flex items-center gap-2 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
                  <AlertCircle className="h-4 w-4" />
                  <span>Menunggu tindakan admin.</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <RejectionReasonModal
        isOpen={rejectionModal.isOpen}
        onClose={() => setRejectionModal({ isOpen: false, reportTitle: "" })}
        onConfirm={handleRejectConfirm}
        isLoading={rejectReport.isPending}
        reportTitle={rejectionModal.reportTitle}
      />
    </div>
  );
}
