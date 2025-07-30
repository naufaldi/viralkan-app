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
import imageCompression from "browser-image-compression";
import heic2any from "heic2any";

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
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB - matches backend limit
const ACCEPTED_FORMATS = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
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
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | undefined>(undefined);
  const [retryCount, setRetryCount] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const [cameraMode, setCameraMode] = useState<'camera' | 'gallery'>('camera');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const compressImage = useCallback(async (file: File): Promise<File> => {
    try {
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
    try {
      console.log("Converting HEIC to JPEG:", file.name);
      const convertedBlob = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.9,
      });
      
      // Handle both single blob and array of blobs
      const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
      
      if (!blob) {
        throw new Error("Gagal mengkonversi file HEIC. Hasil konversi tidak valid.");
      }
      
      // Create a new File object with the converted data
      const originalName = file.name;
      const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf("."));
      const newFileName = nameWithoutExt ? `${nameWithoutExt}.jpg` : `converted_${Date.now()}.jpg`;
      
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
      throw new Error("Gagal mengkonversi file HEIC. Silakan gunakan format JPEG, PNG, atau WebP.");
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
      if (file.type === "image/heic" || file.type === "image/heif" || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
        try {
          setIsCompressing(true);
          processedFile = await convertHeicToJpeg(file);
        } catch (error: any) {
          const errorMsg = error.message || "Gagal mengkonversi file HEIC. Silakan gunakan format JPEG, PNG, atau WebP.";
          setUploadError(errorMsg);
          onUploadError?.(errorMsg);
          setIsCompressing(false);
          return;
        }
      }

      // Validate file type after HEIC conversion
      if (!ACCEPTED_FORMATS.includes(processedFile.type) && processedFile.type !== "image/jpeg") {
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
    [onImageSelect, onUploadError, onUploadSuccess, compressImage, onFormActivation, convertHeicToJpeg],
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
    
    if (enableCameraMode && cameraMode === 'camera' && cameraInputRef.current) {
      cameraInputRef.current.click();
    } else if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled, cameraMode, enableCameraMode]);

  const handleCameraModeToggle = useCallback((mode: 'camera' | 'gallery') => {
    setCameraMode(mode);
  }, []);

  // Show error from parent component or internal upload error
  const displayError = error || uploadError;

  return (
    <div className="space-y-6">
      {!selectedImage ? (
        <div className="space-y-4">
          {/* Civic Monochrome Camera Mode Toggle */}
          {enableCameraMode && (
            <div className="flex p-1 bg-neutral-100 rounded-lg border border-neutral-200 max-w-xs mx-auto">
              <button
                type="button"
                onClick={() => handleCameraModeToggle('camera')}
                className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  cameraMode === 'camera'
                    ? 'bg-white text-neutral-800 shadow-sm border border-neutral-200'
                    : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50'
                }`}
                disabled={disabled}
              >
                <Camera className="w-4 h-4 mr-2" />
                Kamera
              </button>
              <button
                type="button"
                onClick={() => handleCameraModeToggle('gallery')}
                className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  cameraMode === 'gallery'
                    ? 'bg-white text-neutral-800 shadow-sm border border-neutral-200'
                    : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50'
                }`}
                disabled={disabled}
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                Galeri
              </button>
            </div>
          )}

          {/* Luxury Civic Upload Zone */}
          <Card
            className={`border-2 border-dashed transition-all duration-200 cursor-pointer rounded-lg shadow-sm ${
              dragOver
                ? "border-neutral-300 bg-neutral-25 transform -translate-y-0.5 shadow-md"
                : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-25 hover:transform hover:-translate-y-0.5 hover:shadow-md"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleUploadClick}
          >
            <CardContent className="p-8 sm:p-12 text-center">
              <div className="space-y-6">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto border border-neutral-200 shadow-sm">
                  {isCompressing ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-600"></div>
                  ) : cameraMode === 'camera' ? (
                    <Camera className="h-8 w-8 text-neutral-600" />
                  ) : (
                    <Upload className="h-8 w-8 text-neutral-600" />
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-neutral-800 tracking-tight">
                    {isCompressing
                      ? "Memproses gambar..."
                      : cameraMode === 'camera'
                      ? "Ambil foto jalan rusak"
                      : "Pilih foto jalan rusak"}
                  </h3>
                  <p className="text-base text-neutral-600 max-w-sm mx-auto">
                    {isCompressing
                      ? "Mengompres dan mengoptimalkan gambar"
                      : cameraMode === 'camera'
                      ? "Gunakan kamera perangkat untuk mengambil foto langsung"
                      : "Drag foto ke sini atau klik untuk memilih dari galeri"}
                  </p>
                  <p className="text-sm text-neutral-500 mt-4">
                    Format: JPEG, PNG, WebP, HEIC • Maksimal 10MB • Otomatis dikompres ke WebP
                  </p>
                </div>

                <Button
                  type="button"
                  size="lg"
                  className="mt-8 px-8 py-3 text-base font-medium bg-neutral-800 hover:bg-neutral-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 hover:transform hover:-translate-y-0.5"
                  disabled={disabled || isCompressing}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUploadClick();
                  }}
                >
                  {isCompressing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Memproses...
                    </>
                  ) : cameraMode === 'camera' ? (
                    <>
                      <Camera className="mr-3 h-5 w-5" />
                      Buka Kamera
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
        <Card className="overflow-hidden shadow-md border border-neutral-200">
          <CardContent className="p-0">
            <div className="relative">
              {preview && (
                <div className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Preview foto jalan rusak"
                    className="w-full h-72 sm:h-80 object-cover"
                  />

                  {/* Civic Monochrome Overlay */}
                  <div className="absolute inset-0 bg-neutral-900/40 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleUploadClick}
                      disabled={disabled || isUploading || isCompressing}
                      className="bg-white/95 text-neutral-800 hover:bg-white border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200 hover:transform hover:-translate-y-0.5"
                    >
                      {cameraMode === 'camera' ? (
                        <>
                          <Camera className="mr-2 h-4 w-4" />
                          Ambil Ulang
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
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-600 mx-auto mb-4"></div>
                        <p className="text-base font-semibold text-neutral-800">
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

              {/* Civic Success Status Card */}
              <div className="p-4 bg-white border-t border-neutral-200">
                {/* Mobile Layout - Stack vertically */}
                <div className="sm:hidden space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0 border border-green-200">
                      <CheckCircle2 className="h-5 w-5 text-green-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-semibold text-neutral-800 line-clamp-1"
                        title={selectedImage.name}
                      >
                        {selectedImage.name.length > 25
                          ? `${selectedImage.name.substring(0, 22)}...${selectedImage.name.split(".").pop()}`
                          : selectedImage.name}
                      </p>
                      <p className="text-xs text-green-700 font-medium">
                        {(selectedImage.size / 1024 / 1024).toFixed(1)} MB • Foto siap digunakan
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
                      className="flex-1 h-10 text-sm border-neutral-300 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 transition-all duration-200"
                    >
                      {cameraMode === 'camera' ? (
                        <>
                          <Camera className="mr-2 h-4 w-4" />
                          Ambil Ulang
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
                      className="flex-shrink-0 h-10 w-10 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-all duration-200"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Desktop Layout - Horizontal */}
                <div className="hidden sm:flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0 border border-green-200">
                      <CheckCircle2 className="h-5 w-5 text-green-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-semibold text-neutral-800 truncate"
                        title={selectedImage.name}
                      >
                        {selectedImage.name}
                      </p>
                      <p className="text-xs text-green-700 font-medium">
                        {(selectedImage.size / 1024 / 1024).toFixed(1)} MB • Foto siap digunakan
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-6">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleUploadClick}
                      disabled={disabled || isUploading || isCompressing}
                      className="h-9 px-4 text-xs border-neutral-300 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 transition-all duration-200"
                    >
                      {cameraMode === 'camera' ? (
                        <>
                          <Camera className="mr-2 h-3 w-3" />
                          Ambil Ulang
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
                      className="h-9 w-9 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-all duration-200"
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
        <Alert variant="destructive" className="border-red-200 bg-red-50 shadow-sm">
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
                  className="ml-3 h-8 px-3 text-xs border-red-300 text-red-700 hover:bg-red-100 transition-all duration-200"
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
      
      {/* Camera input for camera mode */}
      {enableCameraMode && (
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />
      )}
    </div>
  );
}
