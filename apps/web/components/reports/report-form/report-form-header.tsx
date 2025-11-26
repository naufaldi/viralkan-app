import { FileText } from "lucide-react";
import { CardHeader, CardTitle } from "@repo/ui/components/ui/card";

interface ReportFormHeaderProps {
  title: string;
}

export const ReportFormHeader = ({ title }: ReportFormHeaderProps) => {
  return (
    <CardHeader className="bg-neutral-25 border-b border-neutral-200 px-6 py-6">
      <CardTitle className="flex items-center gap-3 text-xl font-semibold tracking-tight text-neutral-900">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100">
          <FileText className="h-5 w-5 text-neutral-700" />
        </div>
        <div>
          <div className="text-xl font-bold text-neutral-900">{title}</div>
          <div className="mt-1 text-sm font-normal text-neutral-600">
            Bantu komunitas menghindari jalan rusak dan tingkatkan kesadaran
            publik
          </div>
        </div>
      </CardTitle>
    </CardHeader>
  );
};
