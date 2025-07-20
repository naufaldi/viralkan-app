import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { sql } from '@/db/connection';
import { createSuccess, createError, AppResult } from '@/types';
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
 * Upload file to Cloudflare R2 storage
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
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
      // Set cache control for better performance
      CacheControl: 'public, max-age=31536000', // 1 year
    });

    await client.send(command);

    return createSuccess({
      imageUrl: '', // Will be set by shell layer
      imageKey: key,
    });
  } catch (error) {
    console.error('R2 upload error:', error);
    return createError('Failed to upload file to storage', 500);
  }
};

/**
 * Record upload metadata in database
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
    const result = await sql`
      INSERT INTO uploads (user_id, image_key, image_url, file_size, file_type, created_at)
      VALUES (${userId}, ${imageKey}, ${imageUrl}, ${fileSize}, ${fileType}, NOW())
      RETURNING *
    `;

    if (result.length === 0) {
      return createError('Failed to record upload metadata', 500);
    }

    return createSuccess(result[0] as DbUploadRecord);
  } catch (error) {
    console.error('Database error recording upload:', error);
    return createError('Failed to record upload metadata', 500);
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
 * Get user's upload count for rate limiting
 * @param userId - User ID to check
 * @param timeWindowMinutes - Time window in minutes to check
 * @returns Promise<AppResult<number>>
 */
export const getUserUploadCount = async (
  userId: number,
  timeWindowMinutes: number = 60
): Promise<AppResult<number>> => {
  try {
    const result = await sql`
      SELECT COUNT(*) as count
      FROM uploads 
      WHERE user_id = ${userId}
      AND created_at > NOW() - INTERVAL '${timeWindowMinutes} minutes'
    `;

    const count = parseInt(result[0]?.count || '0');
    return createSuccess(count);
  } catch (error) {
    console.error('Database error checking upload count:', error);
    return createError('Failed to check upload rate limit', 500);
  }
};
