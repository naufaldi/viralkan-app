import { Upload } from "lucide-react";
import { FormLabel } from "@repo/ui/components/ui/form";
import ImageUpload from "../../forms/image-upload";

interface ReportImageUploadProps {
  selectedImage: File | null;
  onImageSelect: (file: File, originalFile?: File) => void;
  onImageRemove: () => void;
  onUploadError: (error: string) => void;
  onUploadSuccess: () => void;
  isUploading: boolean;
  error?: string;
  disabled?: boolean;
  onFormActivation?: () => void;
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
  onFormActivation,
}: ReportImageUploadProps) => {
  return (
    <div className="space-y-3">
      <FormLabel className="flex items-center gap-2 text-base font-semibold text-neutral-900">
        <Upload className="h-4 w-4 text-neutral-600" />
        Foto Jalan Rusak *
        {isUploading && (
          <span className="text-xs font-normal text-neutral-500">
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
        enableCameraMode={true}
        onFormActivation={onFormActivation}
      />
      <p className="text-sm text-neutral-600">
        Unggah foto yang jelas untuk membantu komunitas mengidentifikasi lokasi
        jalan rusak. <strong>Ambil foto langsung</strong> untuk data lokasi
        otomatis.
      </p>
    </div>
  );
};
