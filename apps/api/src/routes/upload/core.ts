import { createSuccess, createError } from '@/types';
import type { FileValidationResult, FileValidationConfig } from './types';

// File validation configuration
export const FILE_VALIDATION_CONFIG: FileValidationConfig = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
};

/**
 * Pure function to validate uploaded file
 * @param file - The uploaded file to validate
 * @returns FileValidationResult with validation status and metadata
 */
export const validateUploadedFile = (file: any): FileValidationResult => {
  // Check if file exists
  if (!file) {
    return createError('No file provided', 400);
  }

  // Extract file metadata
  const size = file.size || 0;
  const type = file.type || '';
  const name = file.name || '';
  const extension = name.toLowerCase().substring(name.lastIndexOf('.'));

  // Validate file size
  if (size === 0) {
    return createError('File is empty', 400);
  }

  if (size > FILE_VALIDATION_CONFIG.maxSize) {
    const maxSizeMB = FILE_VALIDATION_CONFIG.maxSize / (1024 * 1024);
    return createError(`File size exceeds ${maxSizeMB}MB limit`, 400);
  }

  // Validate file type
  if (!FILE_VALIDATION_CONFIG.allowedTypes.includes(type)) {
    return createError(
      `Invalid file type. Allowed types: ${FILE_VALIDATION_CONFIG.allowedTypes.join(', ')}`,
      400
    );
  }

  // Validate file extension
  if (!FILE_VALIDATION_CONFIG.allowedExtensions.includes(extension)) {
    return createError(
      `Invalid file extension. Allowed extensions: ${FILE_VALIDATION_CONFIG.allowedExtensions.join(', ')}`,
      400
    );
  }

  return createSuccess({
    isValid: true,
    file,
    metadata: {
      size,
      type,
      extension,
    },
  });
};

/**
 * Generate unique storage key for uploaded file
 * @param userId - The authenticated user's ID
 * @param filename - Original filename
 * @returns Unique storage key
 */
export const generateStorageKey = (
  userId: number,
  filename: string
): string => {
  const timestamp = Date.now();
  const uuid = crypto.randomUUID();
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));

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
  publicBaseUrl: string
): string => {
  return `${publicBaseUrl}/${storageKey}`;
};

/**
 * Validate user permissions for upload
 * @param userId - The user ID to validate
 * @returns Boolean indicating if user can upload
 */
export const canUserUpload = (userId: number): boolean => {
  // Basic validation - user must have valid ID
  return userId > 0;
};

/**
 * Calculate upload priority based on file characteristics
 * @param fileSize - Size of the file in bytes
 * @param fileType - MIME type of the file
 * @returns Priority level (1-5, where 1 is highest priority)
 */
export const calculateUploadPriority = (
  fileSize: number,
  fileType: string
): number => {
  // Smaller files get higher priority
  if (fileSize < 1024 * 1024) return 1; // < 1MB
  if (fileSize < 5 * 1024 * 1024) return 2; // < 5MB

  // WebP files get slightly higher priority due to better compression
  if (fileType === 'image/webp') return Math.max(1, 2);

  return 3; // Default priority
};
