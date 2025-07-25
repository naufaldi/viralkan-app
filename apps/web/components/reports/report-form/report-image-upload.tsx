import { Upload } from "lucide-react";
import { FormLabel } from "@repo/ui/components/ui/form";
import ImageUpload from "../../forms/image-upload";

interface ReportImageUploadProps {
  selectedImage: File | null;
  onImageSelect: (file: File) => void;
  onImageRemove: () => void;
  onUploadError: (error: string) => void;
  onUploadSuccess: () => void;
  isUploading: boolean;
  error?: string;
  disabled?: boolean;
}

export const ReportImageUpload = ({
  selectedImage,
  onImageSelect,
  onImageRemove,
  onUploadError,
  onUploadSuccess,
  isUploading,
  error,
  disabled,
}: ReportImageUploadProps) => {
  return (
    <div className="space-y-3">
      <FormLabel className="text-base font-semibold text-neutral-900 flex items-center gap-2">
        <Upload className="h-4 w-4 text-neutral-600" />
        Foto Jalan Rusak *
        {isUploading && (
          <span className="text-xs text-neutral-500 font-normal">
            • Mengekstrak lokasi dari foto...
          </span>
        )}
      </FormLabel>
      <ImageUpload
        selectedImage={selectedImage}
        onImageSelect={onImageSelect}
        onImageRemove={onImageRemove}
        onUploadError={onUploadError}
        onUploadSuccess={onUploadSuccess}
        isUploading={isUploading}
        error={error}
        disabled={disabled}
      />
      <p className="text-sm text-neutral-600">
        Unggah foto yang jelas untuk membantu komunitas mengidentifikasi
        lokasi jalan rusak. <strong>Ambil foto langsung</strong> untuk data lokasi otomatis.
      </p>
    </div>
  );
}; 