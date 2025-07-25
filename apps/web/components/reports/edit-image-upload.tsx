"use client";

import { useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import {
  Upload,
  X,
  Image as ImageIcon,
  AlertCircle,
  RefreshCw,
  Camera,
} from "lucide-react";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { FormLabel } from "@repo/ui/components/ui/form";
import imageCompression from "browser-image-compression";

interface EditImageUploadProps {
  existingImageUrl?: string | null;
  selectedImage: File | null;
  onImageSelect: (file: File) => void;
  onImageRemove: () => void;
  onUploadError: (error: string) => void;
  onUploadSuccess: () => void;
  isUploading: boolean;
  error?: string;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FORMATS = ["image/jpeg", "image/png", "image/webp"];
const MAX_RETRIES = 3;

export default function EditImageUpload({
  existingImageUrl,
  selectedImage,
  onImageSelect,
  onImageRemove,
  onUploadError,
  onUploadSuccess,
  isUploading = false,
  error,
  disabled = false,
}: EditImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | undefined>(undefined);
  const [retryCount, setRetryCount] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = useCallback(async (file: File): Promise<File> => {
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        fileType: "image/webp",
        quality: 0.85,
        initialQuality: 0.9,
      };

      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.warn("Image compression failed, using original:", error);
      return file;
    }
  }, []);

  const handleFileSelect = useCallback(
    async (file: File) => {
      setUploadError(undefined);
      setRetryCount(0);

      if (file.size > MAX_FILE_SIZE) {
        const errorMsg = `File terlalu besar. Maksimal ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB`;
        setUploadError(errorMsg);
        onUploadError?.(errorMsg);
        return;
      }

      if (!ACCEPTED_FORMATS.includes(file.type)) {
        const errorMsg =
          "Format file tidak didukung. Gunakan JPEG, PNG, atau WebP";
        setUploadError(errorMsg);
        onUploadError?.(errorMsg);
        return;
      }

      try {
        setIsCompressing(true);

        const compressedFile = await compressImage(file);

        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(compressedFile);

        onImageSelect(compressedFile);
        onUploadSuccess?.();
      } catch (error) {
        const errorMsg = "Gagal memproses gambar. Coba lagi.";
        setUploadError(errorMsg);
        onUploadError?.(errorMsg);
      } finally {
        setIsCompressing(false);
      }
    },
    [compressImage, onImageSelect, onUploadError, onUploadSuccess],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect],
  );

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect],
  );

  const handleRemoveImage = useCallback(() => {
    setPreview(null);
    onImageRemove();
    setUploadError(undefined);
  }, [onImageRemove]);

  const handleRetry = useCallback(() => {
    setRetryCount((prev) => prev + 1);
    setUploadError(undefined);
  }, []);

  const displayError = error || uploadError;
  const hasImage = selectedImage || existingImageUrl;

  return (
    <div className="space-y-3">
      <FormLabel className="text-base font-semibold text-neutral-900 flex items-center gap-2">
        <Upload className="h-4 w-4 text-neutral-600" />
        Foto Jalan Rusak *
      </FormLabel>

      {!hasImage ? (
        <Card
          className={`border-2 border-dashed transition-all duration-200 ${
            dragOver
              ? "border-neutral-400 bg-neutral-50"
              : "border-neutral-300 hover:border-neutral-400"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleUploadClick}
        >
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center">
                {isCompressing ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-600"></div>
                ) : (
                  <Upload className="h-8 w-8 text-neutral-600" />
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-neutral-900 tracking-tight">
                  {isCompressing
                    ? "Memproses gambar..."
                    : "Drag foto jalan rusak ke sini"}
                </h3>
                <p className="text-base text-neutral-600">
                  {isCompressing
                    ? "Mengompres dan mengoptimalkan gambar"
                    : "atau klik untuk memilih file dari perangkat"}
                </p>
                <p className="text-sm text-neutral-600 mt-3">
                  Format: JPEG, PNG, WebP • Maksimal 10MB • Otomatis dikompres
                  ke WebP
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="mt-6 px-6 py-3 text-base font-medium transition-all duration-150"
                disabled={disabled || isCompressing}
                onClick={(e) => {
                  e.stopPropagation();
                  handleUploadClick();
                }}
              >
                <ImageIcon className="mr-3 h-5 w-5" />
                {isCompressing ? "Memproses..." : "Pilih Foto"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative">
              {(preview || existingImageUrl) && (
                <div className="relative">
                  <img
                    src={preview || existingImageUrl || ""}
                    alt="Foto jalan rusak"
                    className="w-full h-72 object-cover"
                  />

                  {(isUploading || isCompressing) && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-600 mx-auto mb-3"></div>
                        <p className="text-base font-medium text-neutral-900">
                          {isCompressing
                            ? "Memproses gambar..."
                            : "Mengunggah foto..."}
                        </p>
                        <p className="text-sm text-neutral-600 mt-1">
                          Mohon tunggu sebentar
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="p-4 bg-neutral-50 border-t border-neutral-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <ImageIcon className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">
                        {selectedImage ? selectedImage.name : "Foto saat ini"}
                      </p>
                      <p className="text-xs text-neutral-600">
                        {selectedImage
                          ? `${(selectedImage.size / 1024 / 1024).toFixed(1)} MB • Foto baru`
                          : "Foto yang sudah ada • Klik untuk mengganti"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleUploadClick}
                      disabled={disabled || isUploading || isCompressing}
                      className="text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 border-neutral-300"
                    >
                      <Camera className="h-4 w-4 mr-1" />
                      Ganti
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveImage}
                      disabled={disabled || isUploading || isCompressing}
                      className="text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-md p-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {displayError && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800 font-medium">
            <div className="flex items-center justify-between">
              <span>{displayError}</span>
              {retryCount < MAX_RETRIES && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  disabled={isCompressing}
                  className="ml-3 h-8 px-3 text-xs border-red-300 text-red-700 hover:bg-red-100"
                >
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Coba Lagi ({retryCount + 1}/{MAX_RETRIES})
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_FORMATS.join(",")}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      <p className="text-sm text-neutral-600">
        Unggah foto yang jelas untuk membantu komunitas mengidentifikasi lokasi
        jalan rusak.
      </p>
    </div>
  );
}
