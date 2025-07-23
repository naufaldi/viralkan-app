import { Badge } from "@repo/ui/components/ui/badge";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { MapPin, Crosshair } from "lucide-react";
import Image from "next/image";
import type { ReportWithUser } from "../../utils/stats-utils";
import { formatCoordinates, getTimeAgo } from "@/utils/reports";
import { REPORT_CATEGORIES } from "@/constant/reports";

interface UniformReportCardProps {
  report: ReportWithUser;
  onClick?: () => void;
}

export function UniformReportCard({ report, onClick }: UniformReportCardProps) {
  const categoryInfo = REPORT_CATEGORIES[report.category];
  const hasCoordinates = report.lat !== null && report.lon !== null;

  return (
    <Card
      className="cursor-pointer group overflow-hidden transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1 border-neutral-200 rounded-lg"
      onClick={onClick}
    >
      <div className="relative overflow-hidden">
        <Image
          src={report.image_url}
          alt={`Jalan rusak di ${report.street_name}`}
          width={400}
          height={300}
          className="w-full aspect-[4/3] object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <Badge
            className={`${categoryInfo.color} border-0 text-xs rounded-full px-3 py-1`}
          >
            <span className="mr-1">{categoryInfo.icon}</span>
            {categoryInfo.label}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <h3 className="font-semibold text-neutral-900 line-clamp-2 text-base">
            {report.street_name}
          </h3>

          <div className="space-y-2">
            {/* Main Location */}
            <div className="flex items-start gap-2">
              <MapPin className="text-neutral-500 mt-0.5 flex-shrink-0 h-4 w-4" />
              <p className="text-neutral-600 line-clamp-2 text-sm">
                {report.location_text}
              </p>
            </div>

            {/* Coordinates (Optional) */}
            {hasCoordinates && (
              <div className="flex items-center gap-2">
                <Crosshair className="text-neutral-400 flex-shrink-0 h-3 w-3" />
                <span className="text-xs text-neutral-500 font-mono">
                  {formatCoordinates(report.lat!, report.lon!)}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              {report.user_avatar && (
                <Image
                  src={report.user_avatar}
                  alt={report.user_name || "User"}
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-full"
                />
              )}
              <span className="text-xs text-neutral-600">
                {report.user_name || "Anonim"}
              </span>
            </div>
            <span className="text-xs text-neutral-500">
              {getTimeAgo(typeof report.created_at === 'string' ? report.created_at : report.created_at.toISOString())}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
