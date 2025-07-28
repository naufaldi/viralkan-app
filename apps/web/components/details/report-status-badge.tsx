"use client";

import { Badge } from "@repo/ui/components/ui/badge";
import { CheckCircle, Clock, XCircle } from "lucide-react";

interface ReportStatusBadgeProps {
  status: string;
}

export function ReportStatusBadge({ status }: ReportStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "verified":
        return {
          icon: CheckCircle,
          label: "Disetujui",
          color: "bg-green-100 text-green-700 border-green-200",
        };
      case "rejected":
        return {
          icon: XCircle,
          label: "Ditolak",
          color: "bg-red-100 text-red-700 border-red-200",
        };
      case "deleted":
        return {
          icon: XCircle,
          label: "Dihapus",
          color: "bg-neutral-100 text-neutral-700 border-neutral-200",
        };
      default:
        return {
          icon: Clock,
          label: "Menunggu",
          color: "bg-yellow-100 text-yellow-700 border-yellow-200",
        };
    }
  };

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="absolute top-4 left-4">
      <Badge className={`${statusConfig.color} border font-medium`}>
        <StatusIcon className="h-3 w-3 mr-1" />
        {statusConfig.label}
      </Badge>
    </div>
  );
} 