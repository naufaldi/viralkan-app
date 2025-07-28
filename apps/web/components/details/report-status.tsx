"use client";

import { Badge } from "@repo/ui/components/ui/badge";
import { Separator } from "@repo/ui/components/ui/separator";
import { CheckCircle, Clock, XCircle } from "lucide-react";

interface ReportStatusProps {
  status: string;
  verifiedAt?: string | null;
  rejectionReason?: string | null;
}

export function ReportStatus({ status, verifiedAt, rejectionReason }: ReportStatusProps) {
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

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-neutral-900">
        Status Laporan
      </h4>
      <div
        className={`p-4 rounded-lg ${statusConfig.bgColor} border border-neutral-200`}
      >
        <div className="flex items-center gap-3">
          <StatusIcon className="h-5 w-5 text-neutral-600" />
          <div>
            <p className="font-medium text-neutral-900">
              {statusConfig.label}
            </p>
            <p className="text-sm text-neutral-600">
              {status === "verified" &&
                verifiedAt &&
                `Disetujui pada ${formatDate(verifiedAt)}`}
              {status === "rejected" &&
                rejectionReason &&
                `Ditolak: ${rejectionReason}`}
              {status === "pending" &&
                "Laporan sedang menunggu verifikasi"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 