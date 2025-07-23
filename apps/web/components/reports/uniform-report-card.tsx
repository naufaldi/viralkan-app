import { Badge } from "@repo/ui/components/ui/badge";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { MapPin } from "lucide-react";
import Image from "next/image";
import { MockReportWithUser } from "../../lib/mock-data";

interface UniformReportCardProps {
  report: MockReportWithUser;
  onClick?: () => void;
}

export function UniformReportCard({ report, onClick }: UniformReportCardProps) {
  const categoryInfo = {
    berlubang: { icon: "🕳️", label: "Berlubang", color: "bg-red-100 text-red-700" },
    retak: { icon: "⚡", label: "Retak", color: "bg-neutral-100 text-neutral-700" },
    lainnya: { icon: "🚧", label: "Lainnya", color: "bg-neutral-100 text-neutral-700" },
  }[report.category];

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Baru saja";
    if (diffInHours < 24) return `${diffInHours} jam lalu`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} hari lalu`;
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

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
          <Badge className={`${categoryInfo.color} border-0 text-xs rounded-full px-3 py-1`}>
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
          
          <div className="flex items-start gap-2">
            <MapPin className="text-neutral-500 mt-0.5 flex-shrink-0 h-4 w-4" />
            <p className="text-neutral-600 line-clamp-2 text-sm">
              {report.location_text}
            </p>
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
              {getTimeAgo(report.created_at)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 