/**
 * Upload service for image file handling
 * Follows UI concept design patterns and frontend-rule.mdc
 */

import { apiClient } from "./api-client";

// Upload response interface matching backend
export interface UploadResponse {
  imageUrl: string;
  imageKey: string;
}

// Upload error interface
export interface UploadError {
  code: string;
  message: string;
  timestamp: string;
  requestId?: string;
}

// Upload result interface
export interface UploadResult {
  success: boolean;
  data?: UploadResponse;
  error?: UploadError;
}

/**
 * Upload image file to storage
 * @param file - Image file to upload (JPEG, PNG, WebP, max 10MB)
 * @param authToken - Authentication token
 * @returns Promise<UploadResult> - Upload result with proper error handling
 */
export async function uploadImage(
  file: File,
  authToken: string,
): Promise<UploadResult> {
  try {
    // Client-side validation before upload
    const validationError = validateFile(file);
    if (validationError) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: validationError,
          timestamp: new Date().toISOString(),
        },
      };
    }

    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append("file", file);

    // Make API request with authentication
    const response = await apiClient.post<UploadResponse>(
      "/api/upload",
      formData,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    console.error("Upload error:", error);

    // Handle different error types with proper TypeScript typing
    const apiError = error as { response?: { data?: { error?: UploadError } } };
    if (apiError.response?.data?.error) {
      const errorData = apiError.response.data.error;
      return {
        success: false,
        error: {
          code: errorData.code || "UPLOAD_FAILED",
          message: getUserFriendlyErrorMessage(
            errorData.code,
            errorData.message,
          ),
          timestamp: errorData.timestamp || new Date().toISOString(),
          requestId: errorData.requestId,
        },
      };
    }

    // Network or other errors
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "Gagal mengunggah gambar. Periksa koneksi internet Anda.",
        timestamp: new Date().toISOString(),
      },
    };
  }
}

/**
 * Client-side file validation before upload
 * @param file - File to validate
 * @returns string | null - Error message or null if valid
 */
function validateFile(file: File): string | null {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
  const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];

  if (!file) {
    return "File tidak ditemukan";
  }

  if (file.size === 0) {
    return "File kosong atau rusak";
  }

  if (file.size > MAX_SIZE) {
    const sizeMB = Math.round(file.size / (1024 * 1024));
    return `Ukuran file (${sizeMB}MB) melebihi batas maksimal 10MB`;
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Format file tidak didukung. Gunakan format: JPEG, PNG, WebP, atau HEIC";
  }

  const extension = file.name
    .toLowerCase()
    .substring(file.name.lastIndexOf("."));
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return `Ekstensi file tidak didukung: ${extension}`;
  }

  return null;
}

/**
 * Convert API error codes to user-friendly Indonesian messages
 * @param code - Error code from API
 * @param originalMessage - Original error message
 * @returns string - User-friendly error message
 */
function getUserFriendlyErrorMessage(
  code: string,
  originalMessage: string,
): string {
  const errorMessages: Record<string, string> = {
    FILE_TOO_LARGE: "Ukuran file terlalu besar. Maksimal 10MB.",
    INVALID_FILE_TYPE:
      "Format file tidak didukung. Gunakan JPEG, PNG, atau WebP.",
    INVALID_FILE_EXTENSION: "Ekstensi file tidak valid.",
    INVALID_FILE_CONTENT: "File rusak atau tidak valid.",
    INVALID_FILENAME: "Nama file mengandung karakter yang tidak diizinkan.",
    FILE_PROCESSING_ERROR: "Gagal memproses file. Coba file lain.",
    INSUFFICIENT_PERMISSIONS: "Tidak memiliki izin untuk mengunggah file.",
    RATE_LIMIT_EXCEEDED: "Terlalu banyak upload. Coba lagi sebentar.",
    STORAGE_ERROR: "Layanan penyimpanan sedang bermasalah. Coba lagi nanti.",
    CONFIGURATION_ERROR:
      "Konfigurasi server bermasalah. Hubungi administrator.",
    UNAUTHORIZED: "Silakan login terlebih dahulu.",
    NETWORK_ERROR: "Koneksi internet bermasalah. Periksa koneksi Anda.",
    TIMEOUT_ERROR: "Upload timeout. Coba file yang lebih kecil.",
  };

  return (
    errorMessages[code] ||
    originalMessage ||
    "Terjadi kesalahan saat mengunggah file."
  );
}

/**
 * Check if error is retryable
 * @param error - Upload error
 * @returns boolean - Whether the upload can be retried
 */
export function isRetryableError(error: UploadError): boolean {
  const retryableCodes = [
    "NETWORK_ERROR",
    "TIMEOUT_ERROR",
    "STORAGE_ERROR",
    "SERVICE_UNAVAILABLE",
  ];

  return retryableCodes.includes(error.code);
}

/**
 * Format file size for display
 * @param bytes - File size in bytes
 * @returns string - Formatted size (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
