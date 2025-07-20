import { z } from '@hono/zod-openapi';
import { AppResult } from '@/types';

// Zod schemas for validation
export const UploadFileSchema = z.object({
  file: z.instanceof(File).or(z.any()), // Will be validated in core layer
});

export const UploadResponseSchema = z.object({
  imageUrl: z.string().url(),
  imageKey: z.string(),
});

export const UploadErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    timestamp: z.string(),
  }),
});

// TypeScript types derived from schemas
export type UploadFileInput = z.infer<typeof UploadFileSchema>;
export type UploadResponse = z.infer<typeof UploadResponseSchema>;
export type UploadErrorResponse = z.infer<typeof UploadErrorResponseSchema>;

// File validation configuration
export interface FileValidationConfig {
  maxSize: number; // in bytes
  allowedTypes: string[];
  allowedExtensions: string[];
}

// R2 storage configuration
export interface R2Config {
  bucketName: string;
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicUrl: string;
}

// Upload result types
export type UploadResult = AppResult<UploadResponse>;
export type FileValidationResult = AppResult<{
  isValid: true;
  file: File;
  metadata: {
    size: number;
    type: string;
    extension: string;
  };
}>;

// Database entity interfaces
export interface DbUploadRecord {
  id: number;
  user_id: number;
  image_key: string;
  image_url: string;
  file_size: number;
  file_type: string;
  created_at: Date;
}
