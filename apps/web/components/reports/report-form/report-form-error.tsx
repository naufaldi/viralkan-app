import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";

interface ReportFormErrorProps {
  error?: string;
}

export const ReportFormError = ({ error }: ReportFormErrorProps) => {
  if (!error) return null;

  return (
    <Alert
      variant="destructive"
      className="mb-6 border-red-200 bg-red-50"
    >
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="text-red-800 font-medium">
        {error}
      </AlertDescription>
    </Alert>
  );
}; 