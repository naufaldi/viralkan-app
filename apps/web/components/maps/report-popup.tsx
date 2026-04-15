"use client";

import Link from "next/link";
import Image from "next/image";
import { REPORT_CATEGORIES } from "../../constant/reports";
import type { MapReport, ReportCategory } from "../../lib/maps/constants";

interface ReportPopupProps {
  report: MapReport;
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const ReportPopup = ({ report }: ReportPopupProps) => {
  const category = REPORT_CATEGORIES[report.category as ReportCategory];

  return (
    <div className="w-48">
      {report.image_url && (
        <div className="relative mb-2 h-[75px] w-full overflow-hidden rounded">
          <Image
            src={report.image_url}
            alt={`Laporan kerusakan ${category?.label ?? report.category}`}
            width={192}
            height={75}
            className="h-full w-full object-cover"
            unoptimized
          />
        </div>
      )}
      <div className="mb-1">
        <span
          className={`rounded px-1.5 py-0.5 text-xs font-medium ${category?.color ?? "bg-neutral-100 text-neutral-700"}`}
        >
          {category?.icon} {category?.label ?? report.category}
        </span>
      </div>
      <p className="mb-1 text-xs leading-snug text-neutral-700">
        {report.street_name}
      </p>
      <p className="mb-2 text-xs text-neutral-500">
        {formatDate(report.created_at)}
      </p>
      <Link
        href={`/laporan/${report.id}`}
        className="block rounded bg-red-600 px-2 py-1 text-center text-xs font-medium text-white hover:bg-red-700"
      >
        Lihat laporan
      </Link>
    </div>
  );
};
