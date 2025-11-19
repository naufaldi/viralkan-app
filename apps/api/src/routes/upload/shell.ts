import {
  createSuccess,
  createError,
  AppResult,
  ForbiddenError,
  ValidationError,
} from "@/types";
import type { UploadResult, R2Config } from "./types";
import {
  validateUploadedFile,
  generateStorageKey,
  generatePublicUrl,
  canUserUpload,
  validateR2Config,
} from "./core";
import { createR2Client, uploadToR2, getUserUploadCount } from "./data";
import { env } from "@/config/env";

// Rate limiting configuration (for future implementation)
// const UPLOAD_RATE_LIMIT = 10; // uploads per hour
// const RATE_LIMIT_WINDOW = 60; // minutes

/**
 * Process file upload with complete business logic orchestration and comprehensive error handling
 * @param userId - Authenticated user ID
 * @param file - Uploaded file object
 * @param r2Config - R2 storage configuration
 * @returns Promise<UploadResult>
 */
export const processFileUpload = async (
  userId: string, // Changed from number to string (UUID v7)
  file: any,
  r2Config: R2Config,
): Promise<UploadResult> => {
  try {
    // 1. Validate user permissions with detailed error
    if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
      return createError("Invalid user ID provided", 400);
    }

    if (!canUserUpload(userId)) {
      return createError("User account does not have upload permissions", 403);
    }

    // 2. Check rate limiting (basic implementation for MVP)
    try {
      const uploadCountResult = await getUserUploadCount(userId, 60); // Last hour
      if (uploadCountResult.success) {
        const UPLOAD_RATE_LIMIT = 50; // 50 uploads per hour for MVP
        if (uploadCountResult.data >= UPLOAD_RATE_LIMIT) {
          return createError(
            `Upload rate limit exceeded. Maximum ${UPLOAD_RATE_LIMIT} uploads per hour allowed.`,
            429,
          );
        }
      } else {
        // Log rate limit check failure but don't block upload
        console.warn(
          `Rate limit check failed for user ${userId}: ${uploadCountResult.error}`,
        );
      }
    } catch (rateLimitError) {
      // Log but don't block upload if rate limiting fails
      console.warn(`Rate limiting error for user ${userId}:`, rateLimitError);
    }

    // 3. Validate R2 configuration before processing
    const configValidation = validateR2Config(r2Config);
    if (!configValidation.isValid) {
      console.error(
        `R2 configuration validation failed for user ${userId}: ${configValidation.error}`,
      );
      return createError(
        `Storage service configuration error: ${configValidation.error}`,
        500,
      );
    }

    // 4. Validate uploaded file with enhanced error context
    const validationResult = validateUploadedFile(file);
    if (!validationResult.success) {
      console.warn(
        `File validation failed for user ${userId}: ${validationResult.error}`,
      );
      return createError(validationResult.error, validationResult.statusCode);
    }

    const { file: validatedFile, metadata } = validationResult.data;

    // 5. Generate storage key and public URL with error handling
    let storageKey: string;
    let publicUrl: string;
    try {
      storageKey = generateStorageKey(userId, metadata.name);
      publicUrl = generatePublicUrl(storageKey, r2Config.publicUrl);
    } catch (error) {
      console.error(`Storage key generation failed for user ${userId}:`, error);
      return createError("Failed to generate storage location", 500);
    }

    // 6. Convert file to buffer for R2 upload with enhanced error handling
    let fileBuffer: Buffer;
    try {
      if (validatedFile instanceof File) {
        // Browser File object
        const arrayBuffer = await validatedFile.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuffer);
      } else if (
        validatedFile &&
        typeof validatedFile === "object" &&
        "stream" in validatedFile
      ) {
        // Hono file object with stream
        const chunks: Uint8Array[] = [];
        const reader = (validatedFile as any).stream().getReader();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }

        const totalLength = chunks.reduce(
          (acc, chunk) => acc + chunk.length,
          0,
        );
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
        console.error(
          `Unsupported file format for user ${userId}:`,
          typeof validatedFile,
        );
        return createError("Unsupported file format received", 400);
      }

      // Verify buffer size matches expected size
      if (fileBuffer.length !== metadata.size) {
        console.warn(
          `File size mismatch for user ${userId}: expected ${metadata.size}, got ${fileBuffer.length}`,
        );
        // Don't fail, but log for monitoring
      }
    } catch (error: any) {
      console.error(`File processing failed for user ${userId}:`, {
        error: error.message,
        fileName: metadata.name,
        fileSize: metadata.size,
      });
      return createError("Failed to process uploaded file", 500);
    }

    // 7. Create R2 client with error handling
    let r2Client: any;
    try {
      r2Client = createR2Client(r2Config);
    } catch (error: any) {
      console.error(
        `R2 client creation failed for user ${userId}:`,
        error.message,
      );
      return createError("Storage service unavailable", 500);
    }

    // 8. Upload to R2 storage with comprehensive error handling
    const uploadResult = await uploadToR2(
      r2Client,
      r2Config.bucketName,
      storageKey,
      fileBuffer,
      metadata.type,
    );

    if (!uploadResult.success) {
      console.error(`Upload failed for user ${userId}:`, {
        fileName: metadata.name,
        fileSize: metadata.size,
        storageKey,
        error: uploadResult.error,
        statusCode: uploadResult.statusCode,
      });
      return createError(uploadResult.error, uploadResult.statusCode);
    }

    // Log successful upload for monitoring
    console.log(`Upload successful for user ${userId}:`, {
      fileName: metadata.name,
      fileSize: metadata.size,
      storageKey,
      publicUrl,
    });

    // 9. For MVP, we don't record upload metadata separately
    // The report creation process will handle storing image_url and image_key
    // This keeps the upload endpoint simple and stateless

    // 10. Return success response
    return createSuccess({
      imageUrl: publicUrl,
      imageKey: storageKey,
    });
  } catch (error: any) {
    // Catch-all error handler for unexpected errors
    console.error(`Unexpected error in processFileUpload for user ${userId}:`, {
      error: error.message,
      stack: error.stack,
    });
    return createError("An unexpected error occurred during upload", 500);
  }
};

/**
 * Validate upload request before processing
 * @param userId - User ID from authentication
 * @param file - File from request
 * @returns Promise<AppResult<boolean>>
 */
export const validateUploadRequest = async (
  userId: string, // Changed from number to string (UUID v7)
  file: any,
): Promise<AppResult<boolean>> => {
  // Check user authorization
  if (!canUserUpload(userId)) {
    return createError("User not authorized to upload files", 403);
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
    throw new Error(`Missing R2 configuration: ${missingFields.join(", ")}`);
  }

  return config;
};
