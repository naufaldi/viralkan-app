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
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <div className="text-foreground mb-1 text-2xl font-bold">
          {stats.byCategory.berlubang}
        </div>
        <div className="text-muted-foreground text-sm">Jalan Berlubang</div>
      </Card>

      <Card className="p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
          <TrendingUp className="h-6 w-6 text-yellow-600" />
        </div>
        <div className="text-foreground mb-1 text-2xl font-bold">
          {stats.byCategory.retak}
        </div>
        <div className="text-muted-foreground text-sm">Jalan Retak</div>
      </Card>

      <Card className="col-span-2 p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <MapPin className="h-6 w-6 text-blue-600" />
        </div>
        <div className="text-foreground mb-1 text-2xl font-bold">
          {stats.byCategory.lainnya}
        </div>
        <div className="text-muted-foreground text-sm">Masalah Lainnya</div>
      </Card>
    </div>
  );
}
