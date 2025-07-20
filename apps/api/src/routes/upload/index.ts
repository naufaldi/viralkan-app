// Public exports for the upload feature
export { uploadRouter } from './api';
export type {
  UploadResponse,
  UploadErrorResponse,
  FileValidationConfig,
  R2Config,
  DbUploadRecord,
} from './types';

// Export key business logic functions that might be needed elsewhere
export {
  validateUploadedFile,
  generateStorageKey,
  generatePublicUrl,
  canUserUpload,
  calculateUploadPriority,
  FILE_VALIDATION_CONFIG,
} from './core';

// Export shell functions for integration with other features
export { processFileUpload, validateUploadRequest, getR2Config } from './shell';
