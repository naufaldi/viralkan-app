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

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
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
          className={`border-2 border-dashed transition-all duration-200 cursor-pointer ${
            dragOver
              ? "border-primary-400 bg-primary-50"
              : "border-neutral-300 hover:border-primary-400 hover:bg-primary-50"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleUploadClick}
        >
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                <Upload className="h-8 w-8 text-primary-600" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-neutral-900">
                  Upload Foto Jalan Rusak
                </h3>
                <p className="text-neutral-600">
                  Seret foto ke sini atau klik untuk memilih
                </p>
                <p className="text-sm text-neutral-500">
                  PNG, JPG, WEBP hingga 5MB
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                className="mt-4"
                disabled={disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  handleUploadClick();
                }}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Pilih Foto
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-neutral-200">
          <CardContent className="p-4">
            <div className="relative">
              {preview && (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />

                  {isUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                      <div className="text-white text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                        <p className="text-sm">Mengunggah...</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-2">
                  <ImageIcon className="h-4 w-4 text-neutral-600" />
                  <span className="text-sm text-neutral-600 truncate">
                    {selectedImage.name}
                  </span>
                  <span className="text-xs text-neutral-500">
                    ({(selectedImage.size / 1024 / 1024).toFixed(1)} MB)
                  </span>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveImage}
                  disabled={disabled || isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
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
