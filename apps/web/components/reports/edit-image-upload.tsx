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
import Image from "next/image";
// Dynamic imports for browser-only libraries
// import imageCompression from "browser-image-compression";
// import heic2any from "heic2any";

interface EditImageUploadProps {
  existingImageUrl?: string | null;
  selectedImage: File | null;
  onImageSelect: (file: File) => void;
  onImageRemove: () => void;
  isUploading: boolean;
  error?: string;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];
const MAX_RETRIES = 3;

export default function EditImageUpload({
  existingImageUrl,
  selectedImage,
  onImageSelect,
  onImageRemove,
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

  const convertHeicToJpeg = useCallback(async (file: File): Promise<File> => {
    try {
      console.log("Converting HEIC to JPEG:", file.name);

      // Dynamic import for browser-only library
      const heic2any = (await import("heic2any")).default;

      const convertedBlob = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.9,
      });

      // Handle both single blob and array of blobs
      const blob = Array.isArray(convertedBlob)
        ? convertedBlob[0]
        : convertedBlob;

      if (!blob) {
        throw new Error(
          "Gagal mengkonversi file HEIC. Hasil konversi tidak valid.",
        );
      }

      // Create a new File object with the converted data
      const originalName = file.name;
      const nameWithoutExt = originalName.substring(
        0,
        originalName.lastIndexOf("."),
      );
      const newFileName = nameWithoutExt
        ? `${nameWithoutExt}.jpg`
        : `converted_${Date.now()}.jpg`;

      const convertedFile = new File([blob], newFileName, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });

      console.log("HEIC conversion successful:", {
        original: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        converted: `${(convertedFile.size / 1024 / 1024).toFixed(2)}MB`,
      });

      return convertedFile;
    } catch (error) {
      console.error("HEIC conversion failed:", error);
      throw new Error(
        "Gagal mengkonversi file HEIC. Silakan gunakan format JPEG, PNG, atau WebP.",
      );
    }
  }, []);

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

      // Dynamic import for browser-only library
      const imageCompression = (await import("browser-image-compression"))
        .default;

      const compressedFile = await imageCompression(file, options);

      // Ensure the compressed file has the correct filename with .webp extension
      const originalName = file.name;
      const nameWithoutExt = originalName.substring(
        0,
        originalName.lastIndexOf("."),
      );
      const newFileName = nameWithoutExt
        ? `${nameWithoutExt}.webp`
        : `compressed_${Date.now()}.webp`;

      // Create a new File object with the correct filename
      const fileWithCorrectName = new File([compressedFile], newFileName, {
        type: "image/webp",
        lastModified: Date.now(),
      });

      return fileWithCorrectName;
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

        return;
      }

      // Check if file is HEIC/HEIF and convert it
      let processedFile = file;
      if (
        file.type === "image/heic" ||
        file.type === "image/heif" ||
        file.name.toLowerCase().endsWith(".heic") ||
        file.name.toLowerCase().endsWith(".heif")
      ) {
        try {
          setIsCompressing(true);
          processedFile = await convertHeicToJpeg(file);
        } catch (error: unknown) {
          const errorMsg =
            error instanceof Error && error.message
              ? error.message
              : "Gagal mengkonversi file HEIC. Silakan gunakan format JPEG, PNG, atau WebP.";
          setUploadError(errorMsg);

          setIsCompressing(false);
          return;
        }
      }

      // Validate file type after HEIC conversion
      if (
        !ACCEPTED_FORMATS.includes(processedFile.type) &&
        processedFile.type !== "image/jpeg"
      ) {
        const errorMsg =
          "Format file tidak didukung. Gunakan JPEG, PNG, WebP, atau HEIC";
        setUploadError(errorMsg);

        setIsCompressing(false);
        return;
      }

      try {
        setIsCompressing(true);

        const compressedFile = await compressImage(processedFile);

        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(compressedFile);

        onImageSelect(compressedFile);
      } catch (error: unknown) {
        const errorMsg = "Gagal memproses gambar. Coba lagi.";
        setUploadError(errorMsg);

        if (process.env.NODE_ENV !== "production") {
          console.warn("[EditImageUpload] Failed to process image", error);
        }
      } finally {
        setIsCompressing(false);
      }
    },
    [compressImage, onImageSelect, convertHeicToJpeg],
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
      if (files.length > 0 && files[0]) {
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
      <FormLabel className="flex items-center gap-2 text-base font-semibold text-neutral-900">
        <Upload className="h-4 w-4 text-neutral-600" />
        Foto Jalan Rusak *
      </FormLabel>

      {!hasImage ? (
        <Card
          className={`border-2 border-dashed transition-all duration-200 ${
            dragOver
              ? "border-neutral-400 bg-neutral-50"
              : "border-neutral-300 hover:border-neutral-400"
          } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleUploadClick}
        >
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                {isCompressing ? (
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-neutral-600"></div>
                ) : (
                  <Upload className="h-8 w-8 text-neutral-600" />
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold tracking-tight text-neutral-900">
                  {isCompressing
                    ? "Memproses gambar..."
                    : "Drag foto jalan rusak ke sini"}
                </h3>
                <p className="text-base text-neutral-600">
                  {isCompressing
                    ? "Mengompres dan mengoptimalkan gambar"
                    : "atau klik untuk memilih file dari perangkat"}
                </p>
                <p className="mt-3 text-sm text-neutral-600">
                  Format: JPEG, PNG, WebP, HEIC • Maksimal 10MB • Otomatis
                  dikompres ke WebP
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
                  <div className="relative h-72 w-full">
                    <Image
                      src={preview || existingImageUrl || ""}
                      alt="Foto jalan rusak"
                      fill
                      sizes="100vw"
                      className="object-cover"
                    />
                  </div>

                  {(isUploading || isCompressing) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                      <div className="text-center">
                        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-b-2 border-neutral-600"></div>
                        <p className="text-base font-medium text-neutral-900">
                          {isCompressing
                            ? "Memproses gambar..."
                            : "Mengunggah foto..."}
                        </p>
                        <p className="mt-1 text-sm text-neutral-600">
                          Mohon tunggu sebentar
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="border-t border-neutral-200 bg-neutral-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                      <ImageIcon className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-neutral-900">
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
                      className="border-neutral-300 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
                    >
                      <Camera className="mr-1 h-4 w-4" />
                      Ganti
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveImage}
                      disabled={disabled || isUploading || isCompressing}
                      className="rounded-md p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
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
          <AlertDescription className="font-medium text-red-800">
            <div className="flex items-center justify-between">
              <span>{displayError}</span>
              {retryCount < MAX_RETRIES && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  disabled={isCompressing}
                  className="ml-3 h-8 border-red-300 px-3 text-xs text-red-700 hover:bg-red-100"
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
        accept={ACCEPTED_FORMATS.join(",") + ",.heic,.heif"}
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
