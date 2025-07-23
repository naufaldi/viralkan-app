import { Card } from "@repo/ui/components/ui/card";
import { AlertTriangle, TrendingUp, MapPin } from "lucide-react";

interface ReportsStatsProps {
  stats: {
    byCategory: {
      berlubang: number;
      retak: number;
      lainnya: number;
    };
  };
}

export function ReportsStats({ stats }: ReportsStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <div className="text-2xl font-bold text-foreground mb-1">
          {stats.byCategory.berlubang}
        </div>
        <div className="text-sm text-muted-foreground">Jalan Berlubang</div>
      </Card>

      <Card className="p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-3">
          <TrendingUp className="h-6 w-6 text-yellow-600" />
        </div>
        <div className="text-2xl font-bold text-foreground mb-1">
          {stats.byCategory.retak}
        </div>
        <div className="text-sm text-muted-foreground">Jalan Retak</div>
      </Card>

      <Card className="p-6 text-center col-span-2">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
          <MapPin className="h-6 w-6 text-blue-600" />
        </div>
        <div className="text-2xl font-bold text-foreground mb-1">
          {stats.byCategory.lainnya}
        </div>
        <div className="text-sm text-muted-foreground">Masalah Lainnya</div>
      </Card>
    </div>
  );
}
