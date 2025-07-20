import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { sql } from '@/db/connection';
import { createSuccess, createError, AppResult, AppError } from '@/types';
import type { UploadResult, R2Config, DbUploadRecord } from './types';

/**
 * Initialize R2 client with configuration
 * @param config - R2 configuration object
 * @returns Configured S3Client for R2
 */
export const createR2Client = (config: R2Config): S3Client => {
  return new S3Client({
    region: 'auto',
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
};

/**
 * Upload file to Cloudflare R2 storage with comprehensive error handling
 * @param client - Configured R2 client
 * @param bucketName - R2 bucket name
 * @param key - Storage key for the file
 * @param fileBuffer - File data as buffer
 * @param contentType - MIME type of the file
 * @returns Promise<AppResult<string>> with storage key on success
 */
export const uploadToR2 = async (
  client: S3Client,
  bucketName: string,
  key: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<UploadResult> => {
  try {
    // Validate inputs
    if (!client) {
      return createError('R2 client not initialized', 500);
    }

    if (!bucketName || bucketName.trim() === '') {
      return createError('R2 bucket name not configured', 500);
    }

    if (!key || key.trim() === '') {
      return createError('Storage key cannot be empty', 500);
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      return createError('File buffer is empty', 400);
    }

    if (!contentType || contentType.trim() === '') {
      return createError('Content type is required', 400);
    }

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
      // Set cache control for better performance
      CacheControl: 'public, max-age=31536000', // 1 year
      // Add metadata for debugging
      Metadata: {
        'upload-timestamp': Date.now().toString(),
        'file-size': fileBuffer.length.toString(),
      },
    });

    const response = await client.send(command);

    // Verify upload was successful
    if (!response || !response.ETag) {
      return createError('Upload completed but verification failed', 500);
    }

    console.log(
      `R2 upload successful: key=${key}, size=${fileBuffer.length}, etag=${response.ETag}`
    );

    return createSuccess({
      imageUrl: '', // Will be set by shell layer
      imageKey: key,
    });
  } catch (error: any) {
    // Enhanced error logging with context
    console.error('R2 upload error:', {
      error: error.message,
      code: error.code,
      statusCode: error.$metadata?.httpStatusCode,
      key,
      bucketName,
      fileSize: fileBuffer?.length,
      contentType,
    });

    // Handle specific AWS/R2 errors
    if (error.name === 'NoSuchBucket') {
      return createError(`R2 bucket '${bucketName}' does not exist`, 500);
    }

    if (error.name === 'AccessDenied') {
      return createError(
        'Access denied to R2 storage - check credentials',
        500
      );
    }

    if (error.name === 'InvalidBucketName') {
      return createError(`Invalid R2 bucket name: ${bucketName}`, 500);
    }

    if (error.name === 'EntityTooLarge') {
      return createError('File too large for storage service', 400);
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return createError('Cannot connect to R2 storage service', 500);
    }

    if (error.code === 'ETIMEDOUT') {
      return createError('Upload timeout - please try again', 500);
    }

    // Generic error with context
    return createError(
      `Storage upload failed: ${error.message || 'Unknown error'}`,
      500
    );
  }
};

/**
 * Record upload metadata in database with comprehensive error handling
 * @param userId - User ID who uploaded the file
 * @param imageKey - R2 storage key
 * @param imageUrl - Public URL for the image
 * @param fileSize - Size of the uploaded file
 * @param fileType - MIME type of the file
 * @returns Promise<AppResult<DbUploadRecord>>
 */
export const recordUploadMetadata = async (
  userId: number,
  imageKey: string,
  imageUrl: string,
  fileSize: number,
  fileType: string
): Promise<AppResult<DbUploadRecord>> => {
  try {
    // Validate inputs
    if (!userId || userId <= 0) {
      return createError('Invalid user ID for database record', 400);
    }

    if (!imageKey || imageKey.trim() === '') {
      return createError('Image key is required for database record', 400);
    }

    if (!imageUrl || imageUrl.trim() === '') {
      return createError('Image URL is required for database record', 400);
    }

    if (fileSize <= 0) {
      return createError('Invalid file size for database record', 400);
    }

    if (!fileType || fileType.trim() === '') {
      return createError('File type is required for database record', 400);
    }

    const result = await sql`
      INSERT INTO uploads (user_id, image_key, image_url, file_size, file_type, created_at)
      VALUES (${userId}, ${imageKey}, ${imageUrl}, ${fileSize}, ${fileType}, NOW())
      RETURNING *
    `;

    if (result.length === 0) {
      console.error('Database insert returned no rows:', {
        userId,
        imageKey,
        imageUrl,
      });
      return createError(
        'Failed to record upload metadata - no rows returned',
        500
      );
    }

    console.log(`Upload metadata recorded for user ${userId}: ${imageKey}`);
    return createSuccess(result[0] as DbUploadRecord);
  } catch (error: any) {
    console.error('Database error recording upload:', {
      error: error.message,
      code: error.code,
      userId,
      imageKey,
      imageUrl,
      fileSize,
      fileType,
    });

    // Handle specific database errors
    if (error.code === '23505') {
      // Unique constraint violation
      return createError('Upload record already exists', 409);
    }

    if (error.code === '23503') {
      // Foreign key constraint violation
      return createError('Invalid user ID - user does not exist', 400);
    }

    if (error.code === '23514') {
      // Check constraint violation
      return createError('Invalid data provided for upload record', 400);
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return createError('Database connection failed', 500);
    }

    if (error.message?.includes('timeout')) {
      return createError('Database operation timed out', 500);
    }

    return createError(
      `Database error: ${error.message || 'Unknown database error'}`,
      500
    );
  }
};

/**
 * Delete file from R2 storage (for cleanup)
 * @param client - Configured R2 client
 * @param bucketName - R2 bucket name
 * @param key - Storage key to delete
 * @returns Promise<AppResult<boolean>>
 */
export const deleteFromR2 = async (
  client: S3Client,
  bucketName: string,
  key: string
): Promise<AppResult<boolean>> => {
  try {
    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await client.send(command);
    return createSuccess(true);
  } catch (error) {
    console.error('R2 delete error:', error);
    return createError('Failed to delete file from storage', 500);
  }
};

/**
 * Get upload record by image key
 * @param imageKey - R2 storage key
 * @returns Promise<AppResult<DbUploadRecord | null>>
 */
export const getUploadByKey = async (
  imageKey: string
): Promise<AppResult<DbUploadRecord | null>> => {
  try {
    const result = await sql`
      SELECT * FROM uploads 
      WHERE image_key = ${imageKey}
      LIMIT 1
    `;

    return createSuccess((result[0] as DbUploadRecord) || null);
  } catch (error) {
    console.error('Database error fetching upload:', error);
    return createError('Failed to fetch upload record', 500);
  }
};

/**
 * Get user's upload count for rate limiting with comprehensive error handling
 * @param userId - User ID to check
 * @param timeWindowMinutes - Time window in minutes to check
 * @returns Promise<AppResult<number>>
 */
export const getUserUploadCount = async (
  userId: number,
  timeWindowMinutes: number = 60
): Promise<AppResult<number>> => {
  try {
    // Validate inputs
    if (!userId || userId <= 0) {
      return createError('Invalid user ID for rate limit check', 400);
    }

    if (timeWindowMinutes <= 0 || timeWindowMinutes > 1440) {
      // Max 24 hours
      return createError('Invalid time window for rate limit check', 400);
    }

    const result = await sql`
      SELECT COUNT(*) as count
      FROM uploads 
      WHERE user_id = ${userId}
      AND created_at > NOW() - INTERVAL '${timeWindowMinutes} minutes'
    `;

    if (!result || result.length === 0) {
      console.warn(`No rate limit data found for user ${userId}`);
      return createSuccess(0);
    }

    const count = parseInt(result[0]?.count || '0');

    if (isNaN(count)) {
      console.error(
        `Invalid count returned for user ${userId}: ${result[0]?.count}`
      );
      return createError('Invalid rate limit data', 500);
    }

    return createSuccess(count);
  } catch (error: any) {
    console.error('Database error checking upload count:', {
      error: error.message,
      code: error.code,
      userId,
      timeWindowMinutes,
    });

    // Handle specific database errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return createError(
        'Database connection failed for rate limit check',
        500
      );
    }

    if (error.message?.includes('timeout')) {
      return createError('Rate limit check timed out', 500);
    }

    return createError(
      `Rate limit check failed: ${error.message || 'Unknown error'}`,
      500
    );
  }
};
