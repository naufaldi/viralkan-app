import { FileText } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@repo/ui/components/ui/card";

export const ReportFormHeader = () => {
  return (
    <CardHeader className="bg-neutral-25 border-b border-neutral-200 px-6 py-6">
      <CardTitle className="flex items-center gap-3 text-xl font-semibold text-neutral-900 tracking-tight">
        <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center border border-neutral-200">
          <FileText className="h-5 w-5 text-neutral-700" />
        </div>
        <div>
          <div className="text-xl font-bold text-neutral-900">
            Bagikan Kondisi Jalan Rusak
          </div>
          <div className="text-sm font-normal text-neutral-600 mt-1">
            Bantu komunitas menghindari jalan rusak dan tingkatkan kesadaran
            publik
          </div>
        </div>
      </CardTitle>
    </CardHeader>
  );
};
