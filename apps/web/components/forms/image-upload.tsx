"use client";

import { useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Upload, X, Image as ImageIcon, AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import imageCompression from "browser-image-compression";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  onImageRemove: () => void;
  selectedImage: File | null;
  isUploading?: boolean;
  error?: string;
  disabled?: boolean;
  onUploadError?: (error: string) => void;
  onUploadSuccess?: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB - matches backend limit
const ACCEPTED_FORMATS = ["image/jpeg", "image/png", "image/webp"];
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
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | undefined>(undefined);
  const [retryCount, setRetryCount] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = useCallback(async (file: File): Promise<File> => {
    try {
      const options = {
        maxSizeMB: 1, // Target ~1MB
        maxWidthOrHeight: 1200, // Only resize if larger
        useWebWorker: true, // Better performance
        fileType: 'image/webp', // Convert to WebP
        quality: 0.85, // High quality
        initialQuality: 0.9, // Start with high quality
      };

      const compressedFile = await imageCompression(file, options);
      console.log('Image compressed:', {
        original: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        compressed: `${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`,
        reduction: `${((file.size - compressedFile.size) / file.size * 100).toFixed(1)}%`
      });
      
      return compressedFile;
    } catch (error) {
      console.warn('Image compression failed, using original:', error);
      return file; // Fallback to original file
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

      // Validate file type
      if (!ACCEPTED_FORMATS.includes(file.type)) {
        const errorMsg = "Format file tidak didukung. Gunakan JPEG, PNG, atau WebP";
        setUploadError(errorMsg);
        onUploadError?.(errorMsg);
        return;
      }

      try {
        setIsCompressing(true);
        
        // Compress image
        const compressedFile = await compressImage(file);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(compressedFile);

        onImageSelect(compressedFile);
        onUploadSuccess?.();
      } catch (error) {
        console.error('File processing error:', error);
        const errorMsg = "Gagal memproses gambar. Silakan coba lagi.";
        setUploadError(errorMsg);
        onUploadError?.(errorMsg);
      } finally {
        setIsCompressing(false);
      }
    },
    [onImageSelect, onUploadError, onUploadSuccess, compressImage],
  );

  const handleRetry = useCallback(() => {
    if (retryCount < MAX_RETRIES && selectedImage) {
      setRetryCount(prev => prev + 1);
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
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  // Show error from parent component or internal upload error
  const displayError = error || uploadError;

  return (
    <div className="space-y-4">
      {!selectedImage ? (
        <Card
          className={`border-2 border-dashed transition-all duration-150 cursor-pointer rounded-lg ${
            dragOver
              ? "border-primary bg-muted"
              : "border-muted hover:border-border hover:bg-muted/50"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleUploadClick}
        >
          <CardContent className="p-12 text-center">
            <div className="space-y-6">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto border border-border">
                {isCompressing ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                ) : (
                  <Upload className="h-8 w-8 text-muted-foreground" />
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground tracking-tight">
                  {isCompressing ? "Memproses gambar..." : "Drag foto jalan rusak ke sini"}
                </h3>
                <p className="text-base text-muted-foreground">
                  {isCompressing ? "Mengompres dan mengoptimalkan gambar" : "atau klik untuk memilih file dari perangkat"}
                </p>
                <p className="text-sm text-muted-foreground mt-3">
                  Format: JPEG, PNG, WebP • Maksimal 10MB • Otomatis dikompres ke WebP
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
              {preview && (
                <div className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Preview foto jalan rusak"
                    className="w-full h-72 object-cover"
                  />

                  {/* Overlay Change Photo Button - Both Desktop and Mobile */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleUploadClick}
                      disabled={disabled || isUploading || isCompressing}
                      className="bg-white/90 text-neutral-800 hover:bg-white border-0 shadow-lg"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Ganti Foto
                    </Button>
                  </div>

                  {(isUploading || isCompressing) && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center">
                        <div className="spinner mx-auto mb-3"></div>
                        <p className="text-base font-medium text-foreground">
                          {isCompressing ? "Memproses gambar..." : "Mengunggah foto..."}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Mohon tunggu sebentar
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="p-4 bg-muted/30 border-t border-border">
                {/* Mobile Layout - Stack vertically */}
                <div className="sm:hidden space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <ImageIcon className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-1" title={selectedImage.name}>
                        {selectedImage.name.length > 25 
                          ? `${selectedImage.name.substring(0, 22)}...${selectedImage.name.split('.').pop()}`
                          : selectedImage.name
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedImage.size / 1024 / 1024).toFixed(1)} MB • Foto siap digunakan
                      </p>
                    </div>
                  </div>
                  
                  {/* Mobile Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleUploadClick}
                      disabled={disabled || isUploading || isCompressing}
                      className="flex-1 h-9 text-sm border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Ganti Foto
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveImage}
                      disabled={disabled || isUploading || isCompressing}
                      className="flex-shrink-0 h-9 w-9 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-150"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Desktop Layout - Horizontal */}
                <div className="hidden sm:flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <ImageIcon className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate" title={selectedImage.name}>
                        {selectedImage.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedImage.size / 1024 / 1024).toFixed(1)} MB • Foto siap digunakan
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleUploadClick}
                      disabled={disabled || isUploading || isCompressing}
                      className="h-8 px-3 text-xs border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                    >
                      <Upload className="mr-1 h-3 w-3" />
                      Ganti
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveImage}
                      disabled={disabled || isUploading || isCompressing}
                      className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-150"
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
    </div>
  );
}
