import { AlertCircle, Send, Save } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";

interface ReportFormActionsProps {
  isLoading: boolean;
  isUploadingImage: boolean;
  isUploading: boolean;
  imageUploadFailed: boolean;
  selectedImage: File | null;
  disabled?: boolean;
  isEditing?: boolean;
}

export const ReportFormActions = ({
  isLoading,
  isUploadingImage,
  isUploading,
  imageUploadFailed,
  selectedImage,
  disabled,
  isEditing = false,
}: ReportFormActionsProps) => {
  const getLoadingText = () => {
    if (isUploadingImage) return "Mengunggah Foto...";
    if (isUploading) return "Mengunggah...";
    if (isEditing) return "Menyimpan...";
    return "Membuat Laporan...";
  };

  const renderButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
          {getLoadingText()}
        </>
      );
    }

    if (imageUploadFailed) {
      return (
        <>
          <AlertCircle className="mr-2 h-4 w-4" />
          Perbaiki Upload Foto
        </>
      );
    }

    if (isEditing) {
      return (
        <>
          <Save className="mr-2 h-4 w-4" />
          Simpan Perubahan
        </>
      );
    }

    return (
      <>
        <Send className="mr-2 h-4 w-4" />
        Bagikan Laporan
      </>
    );
  };

  return (
    <Button
      type="submit"
      size="default"
      className="h-12 w-full rounded-lg bg-neutral-900 text-base font-semibold text-white shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-md active:translate-y-0"
      disabled={disabled || (!selectedImage && !isEditing) || imageUploadFailed}
    >
      {renderButtonContent()}
    </Button>
  );
};
