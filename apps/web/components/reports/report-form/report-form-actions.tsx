import { AlertCircle, Send } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";

interface ReportFormActionsProps {
  isLoading: boolean;
  isUploadingImage: boolean;
  isUploading: boolean;
  imageUploadFailed: boolean;
  selectedImage: File | null;
  disabled?: boolean;
}

export const ReportFormActions = ({
  isLoading,
  isUploadingImage,
  isUploading,
  imageUploadFailed,
  selectedImage,
  disabled,
}: ReportFormActionsProps) => {
  return (
    <Button
      type="submit"
      size="default"
      className="h-12 w-full rounded-lg bg-neutral-900 text-base font-semibold text-white shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-md active:translate-y-0"
      disabled={disabled || !selectedImage || imageUploadFailed}
    >
      {isLoading ? (
        <>
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
          {isUploadingImage
            ? "Mengunggah Foto..."
            : isUploading
              ? "Mengunggah..."
              : "Membuat Laporan..."}
        </>
      ) : imageUploadFailed ? (
        <>
          <AlertCircle className="mr-2 h-4 w-4" />
          Perbaiki Upload Foto
        </>
      ) : (
        <>
          <Send className="mr-2 h-4 w-4" />
          Bagikan Laporan
        </>
      )}
    </Button>
  );
};
