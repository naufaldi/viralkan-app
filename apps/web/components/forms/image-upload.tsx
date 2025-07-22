"use client";

import { useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  onImageRemove: () => void;
  selectedImage: File | null;
  isUploading?: boolean;
  error?: string;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB - matches backend limit
const ACCEPTED_FORMATS = ["image/jpeg", "image/png", "image/webp"];

export default function ImageUpload({
  onImageSelect,
  onImageRemove,
  selectedImage,
  isUploading = false,
  error,
  disabled = false,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    (file: File) => {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return;
      }

      // Validate file type
      if (!ACCEPTED_FORMATS.includes(file.type)) {
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      onImageSelect(file);
    },
    [onImageSelect],
  );

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

  return (
    <div className="space-y-4">
      {!selectedImage ? (
        <Card
          className={`border-2 border-dashed transition-all duration-150 cursor-pointer rounded-lg ${
            dragOver
              ? "border-primary-500 bg-primary-50"
              : "border-neutral-200 hover:border-primary-400 hover:bg-neutral-25"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleUploadClick}
        >
          <CardContent className="p-12 text-center">
            <div className="space-y-6">
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto border border-primary-100">
                <Upload className="h-8 w-8 text-primary-600" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-neutral-900 tracking-tight">
                  Drag foto jalan rusak ke sini
                </h3>
                <p className="text-base text-neutral-700">
                  atau klik untuk memilih file dari perangkat
                </p>
                <p className="text-sm text-neutral-500 mt-3">
                  Format: JPEG, PNG, WebP • Maksimal 10MB
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="mt-6 px-6 py-3 text-base font-medium border-neutral-200 hover:bg-neutral-25 hover:border-primary-300 transition-all duration-150"
                disabled={disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  handleUploadClick();
                }}
              >
                <ImageIcon className="mr-3 h-5 w-5" />
                Pilih Foto
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-neutral-200 bg-surface shadow-card rounded-lg overflow-hidden">
          <CardContent className="p-0">
            <div className="relative">
              {preview && (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Preview foto jalan rusak"
                    className="w-full h-72 object-cover"
                  />

                  {isUploading && (
                    <div className="absolute inset-0 bg-neutral-900 bg-opacity-60 flex items-center justify-center backdrop-blur-sm">
                      <div className="text-white text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-2 border-white border-t-transparent mx-auto mb-3"></div>
                        <p className="text-base font-medium">
                          Mengunggah foto...
                        </p>
                        <p className="text-sm text-neutral-200 mt-1">
                          Mohon tunggu sebentar
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="p-4 bg-neutral-25 border-t border-neutral-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <ImageIcon className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">
                        {selectedImage.name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {(selectedImage.size / 1024 / 1024).toFixed(1)} MB •
                        Foto siap digunakan
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveImage}
                    disabled={disabled || isUploading}
                    className="text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-md p-2 transition-colors duration-150"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
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
