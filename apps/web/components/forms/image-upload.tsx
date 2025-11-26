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
  FolderOpen,
  CheckCircle2,
} from "lucide-react";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
// Remove top-level import - will be imported dynamically
import { CameraCapture } from "./camera-capture";

interface ImageUploadProps {
  onImageSelect: (file: File, originalFile?: File) => void;
  onImageRemove: () => void;
  selectedImage: File | null;
  isUploading?: boolean;
  error?: string;
  disabled?: boolean;
  onUploadError?: (error: string) => void;
  onUploadSuccess?: () => void;
  enableCameraMode?: boolean;
  onFormActivation?: () => void;
  initialImageUrl?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB - matches backend limit
const ACCEPTED_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];
const MAX_RETRIES = 3;

export default function ImageUpload({
  onImageSelect,
  onImageRemove,
  selectedImage,
  isUploading = false,
  error,
  disabled = false,
  onUploadError,
  onUploadSuccess,
  enableCameraMode = true,
  onFormActivation,
  initialImageUrl,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(
    initialImageUrl || null,
  );
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | undefined>(undefined);
  const [retryCount, setRetryCount] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const [cameraMode, setCameraMode] = useState<"camera" | "gallery">("camera");
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = useCallback(async (file: File): Promise<File> => {
    // Only run on client side
    if (typeof window === "undefined") {
      throw new Error("Image compression is only available in the browser");
    }

    try {
      // Dynamically import imageCompression only on client side
      const imageCompression = (await import("browser-image-compression"))
        .default;

      const options = {
        maxSizeMB: 1, // Target ~1MB
        maxWidthOrHeight: 1200, // Only resize if larger
        useWebWorker: true, // Better performance
        fileType: "image/webp", // Convert to WebP
        quality: 0.85, // High quality
        initialQuality: 0.9, // Start with high quality
      };

      const compressedFile = await imageCompression(file, options);
      console.log("Image compressed:", {
        original: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        compressed: `${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`,
        reduction: `${(((file.size - compressedFile.size) / file.size) * 100).toFixed(1)}%`,
      });

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
      return file; // Fallback to original file
    }
  }, []);

  const convertHeicToJpeg = useCallback(async (file: File): Promise<File> => {
    // Only run on client side
    if (typeof window === "undefined") {
      throw new Error("HEIC conversion is only available in the browser");
    }

    try {
      console.log("Converting HEIC to JPEG:", file.name);

      // Dynamically import heic2any only on client side
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

  const handleFileSelect = useCallback(
    async (file: File) => {
      // Clear previous errors
      setUploadError(undefined);
      setRetryCount(0);

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        const errorMsg = `File terlalu besar. Maksimal ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB`;
        setUploadError(errorMsg);
        onUploadError?.(errorMsg);
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
        } catch (error: any) {
          const errorMsg =
            error.message ||
            "Gagal mengkonversi file HEIC. Silakan gunakan format JPEG, PNG, atau WebP.";
          setUploadError(errorMsg);
          onUploadError?.(errorMsg);
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
        onUploadError?.(errorMsg);
        setIsCompressing(false);
        return;
      }

      try {
        setIsCompressing(true);

        // Compress image (only if not already compressed from HEIC conversion)
        const compressedFile = await compressImage(processedFile);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(compressedFile);

        // Pass both compressed file for upload and original file for EXIF extraction
        onImageSelect(compressedFile, file);
        onUploadSuccess?.();

        // Trigger form activation when image is successfully selected
        onFormActivation?.();
      } catch (error) {
        console.error("File processing error:", error);
        const errorMsg = "Gagal memproses gambar. Silakan coba lagi.";
        setUploadError(errorMsg);
        onUploadError?.(errorMsg);
      } finally {
        setIsCompressing(false);
      }
    },
    [
      onImageSelect,
      onUploadError,
      onUploadSuccess,
      compressImage,
      onFormActivation,
      convertHeicToJpeg,
    ],
  );

  const handleRetry = useCallback(() => {
    if (retryCount < MAX_RETRIES && selectedImage) {
      setRetryCount((prev) => prev + 1);
      setUploadError(undefined);
      handleFileSelect(selectedImage);
    }
  }, [retryCount, selectedImage, handleFileSelect]);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setDragOver(true);
      }
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files && files[0]) {
        handleFileSelect(files[0]);
      }
    },
    [disabled, handleFileSelect],
  );

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
    setUploadError(undefined);
    setRetryCount(0);
    onImageRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onImageRemove]);

  const handleUploadClick = useCallback(() => {
    if (disabled) return;

    if (enableCameraMode && cameraMode === "camera") {
      setShowCamera(true);
    } else if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled, cameraMode, enableCameraMode]);

  const handleCameraModeToggle = useCallback((mode: "camera" | "gallery") => {
    setCameraMode(mode);
  }, []);

  // Show error from parent component or internal upload error
  const displayError = error || uploadError;

  return (
    <div className="space-y-6">
      {!selectedImage && !initialImageUrl ? (
        <div className="space-y-4">
          {/* Civic Monochrome Camera Mode Toggle */}
          {enableCameraMode && (
            <div className="mx-auto flex max-w-xs rounded-lg border border-neutral-200 bg-neutral-100 p-1">
              <button
                type="button"
                onClick={() => handleCameraModeToggle("camera")}
                className={`flex flex-1 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  cameraMode === "camera"
                    ? "border border-neutral-200 bg-white text-neutral-800 shadow-sm"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800"
                }`}
                disabled={disabled}
              >
                <Camera className="mr-2 h-4 w-4" />
                Kamera
              </button>
              <button
                type="button"
                onClick={() => handleCameraModeToggle("gallery")}
                className={`flex flex-1 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  cameraMode === "gallery"
                    ? "border border-neutral-200 bg-white text-neutral-800 shadow-sm"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800"
                }`}
                disabled={disabled}
              >
                <FolderOpen className="mr-2 h-4 w-4" />
                Galeri
              </button>
            </div>
          )}

          {/* Luxury Civic Upload Zone */}
          <Card
            className={`cursor-pointer rounded-lg border-2 border-dashed shadow-sm transition-all duration-200 ${
              dragOver
                ? "bg-neutral-25 -translate-y-0.5 transform border-neutral-300 shadow-md"
                : "hover:bg-neutral-25 border-neutral-200 hover:-translate-y-0.5 hover:transform hover:border-neutral-300 hover:shadow-md"
            } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleUploadClick}
          >
            <CardContent className="p-8 text-center sm:p-12">
              <div className="space-y-6">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-sm">
                  {isCompressing ? (
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-neutral-600"></div>
                  ) : cameraMode === "camera" ? (
                    <Camera className="h-8 w-8 text-neutral-600" />
                  ) : (
                    <Upload className="h-8 w-8 text-neutral-600" />
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold tracking-tight text-neutral-800">
                    {isCompressing
                      ? "Memproses gambar..."
                      : cameraMode === "camera"
                        ? "Ambil foto jalan rusak"
                        : "Pilih foto jalan rusak"}
                  </h3>
                  <p className="mx-auto max-w-sm text-base text-neutral-600">
                    {isCompressing
                      ? "Mengompres dan mengoptimalkan gambar"
                      : cameraMode === "camera"
                        ? "Ambil foto langsung menggunakan kamera browser"
                        : "Drag foto ke sini atau klik untuk memilih dari galeri"}
                  </p>
                  <p className="mt-4 text-sm text-neutral-500">
                    Format: JPEG, PNG, WebP, HEIC • Maksimal 10MB • Otomatis
                    dikompres ke WebP
                  </p>
                </div>

                <Button
                  type="button"
                  size="lg"
                  className="mt-8 border-0 bg-neutral-800 px-8 py-3 text-base font-medium text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:transform hover:bg-neutral-700 hover:shadow-lg"
                  disabled={disabled || isCompressing}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUploadClick();
                  }}
                >
                  {isCompressing ? (
                    <>
                      <div className="mr-3 h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                      Memproses...
                    </>
                  ) : cameraMode === "camera" ? (
                    <>
                      <Camera className="mr-3 h-5 w-5" />
                      Ambil Foto
                    </>
                  ) : (
                    <>
                      <ImageIcon className="mr-3 h-5 w-5" />
                      Pilih Foto
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="overflow-hidden border border-neutral-200 shadow-md">
          <CardContent className="flex items-center justify-center p-0">
            <div className="relative">
              {(preview || initialImageUrl) && (
                <div className="group relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview || initialImageUrl || ""}
                    alt="Preview foto jalan rusak"
                    className="h-72 w-full object-cover sm:h-80"
                  />

                  {/* Civic Monochrome Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/40 opacity-0 transition-all duration-200 group-hover:opacity-100">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleUploadClick}
                      disabled={disabled || isUploading || isCompressing}
                      className="border border-white/20 bg-white/95 text-neutral-800 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:transform hover:bg-white hover:shadow-xl"
                    >
                      {cameraMode === "camera" ? (
                        <>
                          <Camera className="mr-2 h-4 w-4" />
                          Ambil Foto Baru
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Ganti Foto
                        </>
                      )}
                    </Button>
                  </div>

                  {(isUploading || isCompressing) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm">
                      <div className="text-center">
                        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-neutral-600"></div>
                        <p className="text-base font-semibold text-neutral-800">
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

              {/* Civic Success Status Card */}
              <div className="border-t border-neutral-200 bg-white p-4">
                {/* Mobile Layout - Stack vertically */}
                <div className="space-y-4 sm:hidden">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-green-200 bg-green-50">
                      <CheckCircle2 className="h-5 w-5 text-green-700" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="line-clamp-1 text-sm font-semibold text-neutral-800"
                        title={selectedImage?.name || "Foto Laporan"}
                      >
                        {selectedImage
                          ? selectedImage.name.length > 25
                            ? `${selectedImage.name.substring(0, 22)}...${selectedImage.name.split(".").pop()}`
                            : selectedImage.name
                          : "Foto Laporan"}
                      </p>
                      <p className="text-xs font-medium text-green-700">
                        {selectedImage
                          ? `${(selectedImage.size / 1024 / 1024).toFixed(1)} MB • Foto siap digunakan`
                          : "Foto tersimpan"}
                      </p>
                    </div>
                  </div>

                  {/* Mobile Action Buttons - Civic Style */}
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleUploadClick}
                      disabled={disabled || isUploading || isCompressing}
                      className="h-10 flex-1 border-neutral-300 text-sm text-neutral-700 transition-all duration-200 hover:border-neutral-400 hover:bg-neutral-50"
                    >
                      {cameraMode === "camera" ? (
                        <>
                          <Camera className="mr-2 h-4 w-4" />
                          Ambil Foto Baru
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Ganti Foto
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveImage}
                      disabled={disabled || isUploading || isCompressing}
                      className="h-10 w-10 flex-shrink-0 rounded-md text-neutral-500 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Desktop Layout - Horizontal */}
                <div className="hidden items-center justify-between sm:flex">
                  <div className="flex min-w-0 flex-1 items-center space-x-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-green-200 bg-green-50">
                      <CheckCircle2 className="h-5 w-5 text-green-700" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-sm font-semibold text-neutral-800"
                        title={selectedImage?.name || "Foto Laporan"}
                      >
                        {selectedImage?.name || "Foto Laporan"}
                      </p>
                      <p className="text-xs font-medium text-green-700">
                        {selectedImage
                          ? `${(selectedImage.size / 1024 / 1024).toFixed(1)} MB • Foto siap digunakan`
                          : "Foto tersimpan"}
                      </p>
                    </div>
                  </div>

                  <div className="ml-6 flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleUploadClick}
                      disabled={disabled || isUploading || isCompressing}
                      className="h-9 border-neutral-300 px-4 text-xs text-neutral-700 transition-all duration-200 hover:border-neutral-400 hover:bg-neutral-50"
                    >
                      {cameraMode === "camera" ? (
                        <>
                          <Camera className="mr-2 h-3 w-3" />
                          Ambil Foto Baru
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-3 w-3" />
                          Ganti
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveImage}
                      disabled={disabled || isUploading || isCompressing}
                      className="h-9 w-9 rounded-md text-neutral-500 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
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
        <Alert
          variant="destructive"
          className="border-red-200 bg-red-50 shadow-sm"
        >
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
                  className="ml-3 h-8 border-red-300 px-3 text-xs text-red-700 transition-all duration-200 hover:bg-red-100"
                >
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Coba Lagi ({retryCount + 1}/{MAX_RETRIES})
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Standard file input for gallery mode */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_FORMATS.join(",") + ",.heic,.heif"}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Camera Capture Dialog */}
      <Dialog open={showCamera} onOpenChange={setShowCamera}>
        <DialogContent
          className="h-[95vh] max-h-none w-[95vw] max-w-none overflow-hidden p-0 sm:h-auto sm:max-h-[90vh] sm:max-w-[500px] sm:overflow-y-auto sm:p-6"
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
          <DialogHeader className="space-y-4 p-6 sm:p-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
                <Camera className="h-5 w-5 text-neutral-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-neutral-900">
                  Ambil Foto Jalan Rusak
                </DialogTitle>
                <DialogDescription className="mt-1 text-neutral-600">
                  Gunakan kamera untuk mengambil foto langsung dari browser.
                  Foto akan otomatis diproses dan dikompres.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 sm:mt-6">
            <CameraCapture
              onPhotoCapture={(file) => {
                handleFileSelect(file);
                setShowCamera(false);
              }}
              onClose={() => setShowCamera(false)}
              disabled={disabled}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
