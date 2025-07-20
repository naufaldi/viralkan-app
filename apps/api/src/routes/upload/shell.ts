import { createSuccess, createError, AppResult } from '@/types';
import type { UploadResult, R2Config } from './types';
import {
  validateUploadedFile,
  generateStorageKey,
  generatePublicUrl,
  canUserUpload,
} from './core';
import { createR2Client, uploadToR2 } from './data';

// Rate limiting configuration (for future implementation)
// const UPLOAD_RATE_LIMIT = 10; // uploads per hour
// const RATE_LIMIT_WINDOW = 60; // minutes

/**
 * Process file upload with complete business logic orchestration
 * @param userId - Authenticated user ID
 * @param file - Uploaded file object
 * @param r2Config - R2 storage configuration
 * @returns Promise<UploadResult>
 */
export const processFileUpload = async (
  userId: number,
  file: any,
  r2Config: R2Config
): Promise<UploadResult> => {
  // 1. Validate user permissions
  if (!canUserUpload(userId)) {
    return createError('User not authorized to upload files', 403);
  }

  // 2. For MVP, we skip database-based rate limiting
  // Rate limiting will be implemented at the API gateway/middleware level
  // or in a future version with proper caching (Redis/memory store)

  // 3. Validate uploaded file
  const validationResult = validateUploadedFile(file);
  if (!validationResult.success) {
    return createError(validationResult.error, validationResult.statusCode);
  }

  const { file: validatedFile, metadata } = validationResult.data;

  // 4. Generate storage key and public URL
  const storageKey = generateStorageKey(userId, validatedFile.name);
  const publicUrl = generatePublicUrl(storageKey, r2Config.publicUrl);

  // 5. Convert file to buffer for R2 upload
  let fileBuffer: Buffer;
  try {
    if (validatedFile instanceof File) {
      // Browser File object
      const arrayBuffer = await validatedFile.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    } else if (
      validatedFile &&
      typeof validatedFile === 'object' &&
      'stream' in validatedFile
    ) {
      // Hono file object with stream
      const chunks: Uint8Array[] = [];
      const reader = (validatedFile as any).stream().getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }

      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;

      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }

      fileBuffer = Buffer.from(result);
    } else if (Buffer.isBuffer(validatedFile)) {
      // Already a buffer
      fileBuffer = validatedFile;
    } else {
      return createError('Invalid file format', 400);
    }
  } catch (error) {
    console.error('Error converting file to buffer:', error);
    return createError('Failed to process file', 500);
  }

  // 6. Upload to R2 storage
  const r2Client = createR2Client(r2Config);
  const uploadResult = await uploadToR2(
    r2Client,
    r2Config.bucketName,
    storageKey,
    fileBuffer,
    metadata.type
  );

  if (!uploadResult.success) {
    console.error(
      `Upload failed for user ${userId}, file: ${validatedFile.name}, error: ${uploadResult.error}`
    );
    return createError(uploadResult.error, uploadResult.statusCode);
  }

  // Log successful upload for monitoring
  console.log(
    `Upload successful for user ${userId}, file: ${validatedFile.name}, size: ${metadata.size} bytes, key: ${storageKey}`
  );

  // 7. For MVP, we don't record upload metadata separately
  // The report creation process will handle storing image_url and image_key
  // This keeps the upload endpoint simple and stateless

  // 8. Return success response
  return createSuccess({
    imageUrl: publicUrl,
    imageKey: storageKey,
  });
};

/**
 * Validate upload request before processing
 * @param userId - User ID from authentication
 * @param file - File from request
 * @returns Promise<AppResult<boolean>>
 */
export const validateUploadRequest = async (
  userId: number,
  file: any
): Promise<AppResult<boolean>> => {
  // Check user authorization
  if (!canUserUpload(userId)) {
    return createError('User not authorized to upload files', 403);
  }

  // Validate file
  const validationResult = validateUploadedFile(file);
  if (!validationResult.success) {
    return createError(validationResult.error, validationResult.statusCode);
  }

  return createSuccess(true);
};

/**
 * Get R2 configuration from environment variables
 * @returns R2Config object
 */
export const getR2Config = (): R2Config => {
  // Import env configuration
  const { env } = require('@/config/env');

  const config: R2Config = {
    bucketName: env.R2_BUCKET_NAME,
    endpoint: env.R2_ENDPOINT,
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    publicUrl: env.R2_PUBLIC_URL,
  };

  // Validate required configuration
  const requiredFields = Object.entries(config);
  const missingFields = requiredFields
    .filter(([_, value]) => !value)
    .map(([key, _]) => key);

  if (missingFields.length > 0) {
    throw new Error(`Missing R2 configuration: ${missingFields.join(', ')}`);
  }

  return config;
};
