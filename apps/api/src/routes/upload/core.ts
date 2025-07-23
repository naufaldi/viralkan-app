import { createSuccess, createError, ValidationError } from "@/types";
import type { FileValidationResult, FileValidationConfig } from "./types";

// File validation configuration
export const FILE_VALIDATION_CONFIG: FileValidationConfig = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ["image/jpeg", "image/png", "image/webp"],
  allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
};

/**
 * Pure function to validate uploaded file with comprehensive error handling
 * @param file - The uploaded file to validate
 * @returns FileValidationResult with validation status and metadata
 */
export const validateUploadedFile = (file: any): FileValidationResult => {
  try {
    // Check if file exists
    if (!file) {
      return createError("No file provided in request", 400);
    }

    // Extract file metadata with null safety
    const size = file.size || 0;
    const type = file.type || "";
    const name = file.name || "";

    // Validate filename
    if (!name || name.trim() === "") {
      return createError("File must have a valid filename", 400);
    }

    // Check for potentially dangerous filenames
    if (name.includes("..") || name.includes("/") || name.includes("\\")) {
      return createError("Invalid filename: contains illegal characters", 400);
    }

    const extension = name.toLowerCase().substring(name.lastIndexOf("."));

    // Validate file has extension
    if (!extension || extension === name.toLowerCase()) {
      return createError("File must have a valid extension", 400);
    }

    // Validate file size
    if (size === 0) {
      return createError("File is empty or corrupted", 400);
    }

    if (size > FILE_VALIDATION_CONFIG.maxSize) {
      const maxSizeMB = Math.round(
        FILE_VALIDATION_CONFIG.maxSize / (1024 * 1024),
      );
      return createError(
        `File size (${Math.round(size / (1024 * 1024))}MB) exceeds maximum allowed size of ${maxSizeMB}MB`,
        400,
      );
    }

    // Validate file type with detailed error messages
    if (!type) {
      return createError("File type could not be determined", 400);
    }

    if (!FILE_VALIDATION_CONFIG.allowedTypes.includes(type)) {
      return createError(
        `Invalid file type '${type}'. Only image files are allowed: ${FILE_VALIDATION_CONFIG.allowedTypes.join(", ")}`,
        400,
      );
    }

    // Validate file extension matches type
    if (!FILE_VALIDATION_CONFIG.allowedExtensions.includes(extension)) {
      return createError(
        `Invalid file extension '${extension}'. Allowed extensions: ${FILE_VALIDATION_CONFIG.allowedExtensions.join(", ")}`,
        400,
      );
    }

    // Cross-validate MIME type and extension for security
    const typeExtensionMap: Record<string, string[]> = {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    };

    const expectedExtensions = typeExtensionMap[type];
    if (expectedExtensions && !expectedExtensions.includes(extension)) {
      return createError(
        `File extension '${extension}' does not match MIME type '${type}'`,
        400,
      );
    }

    return createSuccess({
      isValid: true,
      file,
      metadata: {
        size,
        type,
        extension,
        name: name.trim(),
      },
    });
  } catch (error) {
    // Handle unexpected errors during validation
    console.error("Unexpected error during file validation:", error);
    return createError("Failed to validate file due to unexpected error", 500);
  }
};

/**
 * Generate unique storage key for uploaded file
 * @param userId - The authenticated user's ID
 * @param filename - Original filename
 * @returns Unique storage key
 */
export const generateStorageKey = (
  userId: string, // Changed from number to string (UUID v7)
  filename: string,
): string => {
  const timestamp = Date.now();
  const uuid = crypto.randomUUID();
  const extension = filename.toLowerCase().substring(filename.lastIndexOf("."));

  return `${userId}/${uuid}_${timestamp}${extension}`;
};

/**
 * Generate public URL for stored image
 * @param storageKey - The R2 storage key
 * @param publicBaseUrl - Base URL for public access
 * @returns Public URL for the image
 */
export const generatePublicUrl = (
  storageKey: string,
  publicBaseUrl: string,
): string => {
  return `${publicBaseUrl}/${storageKey}`;
};

/**
 * Validate user permissions for upload with enhanced checks
 * @param userId - The user ID to validate
 * @returns Boolean indicating if user can upload
 */
export const canUserUpload = (userId: string): boolean => {
  // Changed from number to string (UUID v7)
  // Enhanced validation
  if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
    return false;
  }

  // UUID string validation - should be valid UUID format
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    return false;
  }

  // Additional business rules can be added here
  // For example: check user status, subscription level, etc.

  return true;
};

/**
 * Validate R2 configuration completeness
 * @param config - R2 configuration object
 * @returns Validation result with specific error messages
 */
export const validateR2Config = (
  config: any,
): { isValid: boolean; error?: string } => {
  if (!config) {
    return { isValid: false, error: "R2 configuration is missing" };
  }

  const requiredFields = [
    "bucketName",
    "endpoint",
    "accessKeyId",
    "secretAccessKey",
    "publicUrl",
  ];
  const missingFields = requiredFields.filter(
    (field) => !config[field] || config[field].trim() === "",
  );

  if (missingFields.length > 0) {
    return {
      isValid: false,
      error: `Missing required R2 configuration fields: ${missingFields.join(", ")}`,
    };
  }

  // Validate URL formats
  try {
    new URL(config.endpoint);
    new URL(config.publicUrl);
  } catch (error) {
    return { isValid: false, error: "Invalid URL format in R2 configuration" };
  }

  return { isValid: true };
};

/**
 * Calculate upload priority based on file characteristics
 * @param fileSize - Size of the file in bytes
 * @param fileType - MIME type of the file
 * @returns Priority level (1-5, where 1 is highest priority)
 */
export const calculateUploadPriority = (
  fileSize: number,
  fileType: string,
): number => {
  // Smaller files get higher priority
  if (fileSize < 1024 * 1024) return 1; // < 1MB
  if (fileSize < 5 * 1024 * 1024) return 2; // < 5MB

  // WebP files get slightly higher priority due to better compression
  if (fileType === "image/webp") return Math.max(1, 2);

  return 3; // Default priority
};
