import { Badge } from "@repo/ui/components/ui/badge";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { MapPin, Crosshair, Building } from "lucide-react";
import Image from "next/image";
import type { ReportWithUser } from "../../utils/stats-utils";
import { formatCoordinates, getTimeAgo } from "@/utils/reports";
import { REPORT_CATEGORIES } from "@/constant/reports";

interface UniformReportCardProps {
  report: ReportWithUser;
  onClick?: () => void;
}

// Administrative Area Component
function AdministrativeArea({
  district,
  city,
  province,
}: {
  district: string;
  city: string;
  province: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Building className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-500" />
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="truncate text-sm font-medium text-neutral-600">
          {district}
        </p>
        <p className="truncate text-xs text-neutral-500">
          {city}, {province}
        </p>
      </div>
    </div>
  );
}

export function UniformReportCard({ report, onClick }: UniformReportCardProps) {
  const categoryInfo = REPORT_CATEGORIES[report.category];
  const hasCoordinates = report.lat !== null && report.lon !== null;
  const hasAdministrativeData =
    report.district && report.city && report.province;

  return (
    <Card
      className="group hover:shadow-card-hover cursor-pointer overflow-hidden rounded-lg border-neutral-200 transition-all duration-200 hover:-translate-y-1"
      onClick={onClick}
    >
      <div className="relative overflow-hidden">
        <Image
          src={report.image_url}
          alt={`Jalan rusak di ${report.street_name}`}
          width={400}
          height={300}
          className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <Badge
            className={`${categoryInfo.color} rounded-full border-0 px-3 py-1 text-xs`}
          >
            <span className="mr-1">{categoryInfo.icon}</span>
            {categoryInfo.label}
          </Badge>
        </div>
      </div>

      <CardContent className="flex h-full flex-col p-4">
        <div className="flex-1 space-y-3">
          <h3 className="line-clamp-2 text-base font-semibold text-neutral-900">
            {report.street_name}
          </h3>

          <div className="space-y-2">
            {/* Main Location */}
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-500" />
              <p className="line-clamp-2 text-sm text-neutral-600">
                {report.location_text}
              </p>
            </div>

            {/* Administrative Area */}
            {hasAdministrativeData && (
              <AdministrativeArea
                district={report.district}
                city={report.city}
                province={report.province}
              />
            )}

            {/* Coordinates (Optional) */}
            {hasCoordinates && (
              <div className="flex items-center gap-2">
                <Crosshair className="h-3 w-3 flex-shrink-0 text-neutral-400" />
                <span className="font-mono text-xs text-neutral-500">
                  {formatCoordinates(report.lat!, report.lon!)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex items-center gap-2">
            {report.user_avatar && (
              <Image
                src={report.user_avatar}
                alt={report.user_name || "User"}
                width={24}
                height={24}
                className="h-6 w-6 rounded-full"
              />
            )}
            <span className="text-xs text-neutral-600">
              {report.user_name || "Anonim"}
            </span>
          </div>
          <span className="text-xs text-neutral-500">
            {getTimeAgo(
              typeof report.created_at === "string"
                ? report.created_at
                : report.created_at.toISOString(),
            )}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
