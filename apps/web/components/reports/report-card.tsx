import { Badge } from "@repo/ui/components/ui/badge";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@repo/ui/components/ui/avatar";
import { MapPin, Calendar, User } from "lucide-react";
import {
  MockReportWithUser,
  categoryConfig,
  getTimeAgo,
} from "../../lib/mock-data";

interface ReportCardProps {
  report: MockReportWithUser;
  onClick?: () => void;
}

export function ReportCard({ report, onClick }: ReportCardProps) {
  const categoryInfo = categoryConfig[report.category];

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer border border-neutral-200"
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Report Image */}
        <div className="relative">
          <img
            src={report.image_url}
            alt={`Kerusakan jalan di ${report.street_name}`}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <div className="absolute top-3 left-3">
            <Badge className={`${categoryInfo.color} border-0 font-medium`}>
              <span className="mr-1">{categoryInfo.icon}</span>
              {categoryInfo.label}
            </Badge>
          </div>
        </div>

        {/* Report Info */}
        <div className="p-4 space-y-3">
          {/* Location */}
          <div className="space-y-2">
            <h3 className="font-semibold text-neutral-900 line-clamp-1">
              {report.street_name}
            </h3>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-neutral-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-neutral-600 line-clamp-2">
                {report.location_text}
              </p>
            </div>
          </div>

          {/* User & Time */}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={report.user_avatar || undefined} />
                <AvatarFallback className="text-xs bg-primary-100 text-primary-700">
                  {report.user_name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || <User className="h-3 w-3" />}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-neutral-600 font-medium">
                {report.user_name || "Anonymous"}
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs text-neutral-500">
              <Calendar className="h-3 w-3" />
              {getTimeAgo(report.created_at)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
