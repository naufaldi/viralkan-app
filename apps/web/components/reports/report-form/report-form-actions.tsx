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
      className="w-full h-12 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-base rounded-lg transition-all duration-150 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
      disabled={disabled || !selectedImage || imageUploadFailed}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
