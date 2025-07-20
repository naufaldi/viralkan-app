import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { cors } from 'hono/cors';
import { firebaseAuthMiddleware } from '../../middleware/auth';
import { UploadResponseSchema, UploadErrorResponseSchema } from './types';
import * as shell from './shell';

type Env = {
  Variables: {
    user_id: number;
  };
};

// Create router for upload endpoints
export const uploadRouter = new OpenAPIHono<Env>();

// Global middleware for all routes
uploadRouter.use(
  '*',
  cors({
    origin: ['http://localhost:3000', 'https://viralkan.com'],
    credentials: true,
    allowMethods: ['POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

// --- Route Definitions ---

const uploadImageRoute = createRoute({
  method: 'post',
  path: '/',
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: z.object({
            file: z
              .any()
              .describe('Image file to upload (JPEG, PNG, WebP, max 10MB)'),
          }),
        },
      },
    },
  },
  middleware: [firebaseAuthMiddleware],
  summary: 'Upload image file',
  description:
    'Upload an image file to Cloudflare R2 storage for use in reports',
  tags: ['Upload'],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Image uploaded successfully',
      content: {
        'application/json': { schema: UploadResponseSchema },
      },
    },
    400: {
      description: 'Invalid file or validation error',
      content: { 'application/json': { schema: UploadErrorResponseSchema } },
    },
    401: {
      description: 'User not authenticated',
      content: { 'application/json': { schema: UploadErrorResponseSchema } },
    },
    403: {
      description: 'User not authorized to upload',
      content: { 'application/json': { schema: UploadErrorResponseSchema } },
    },
    429: {
      description: 'Rate limit exceeded',
      content: { 'application/json': { schema: UploadErrorResponseSchema } },
    },
    500: {
      description: 'Internal server error',
      content: { 'application/json': { schema: UploadErrorResponseSchema } },
    },
  },
});

// --- Route Handlers ---

uploadRouter.openapi(uploadImageRoute, async (c) => {
  try {
    const userId = c.get('user_id');

    if (!userId) {
      return c.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
            timestamp: new Date().toISOString(),
          },
        },
        401
      );
    }

    // Get uploaded file from form data
    const body = await c.req.parseBody();
    const file = body.file;

    if (!file) {
      return c.json(
        {
          error: {
            code: 'MISSING_FILE',
            message: 'No file provided in request',
            timestamp: new Date().toISOString(),
          },
        },
        400
      );
    }

    // Get R2 configuration
    let r2Config;
    try {
      r2Config = shell.getR2Config();
    } catch (error) {
      console.error('R2 configuration error:', error);
      return c.json(
        {
          error: {
            code: 'CONFIGURATION_ERROR',
            message: 'Storage service not properly configured',
            timestamp: new Date().toISOString(),
          },
        },
        500
      );
    }

    // Process file upload
    const result = await shell.processFileUpload(userId, file, r2Config);

    if (result.success) {
      return c.json(result.data, 200);
    }

    // Map error status codes
    const statusCode = result.statusCode as 400 | 403 | 429 | 500;
    const errorCode = getErrorCode(statusCode, result.error);

    return c.json(
      {
        error: {
          code: errorCode,
          message: result.error,
          timestamp: new Date().toISOString(),
        },
      },
      statusCode
    );
  } catch (error) {
    console.error('Upload endpoint error:', error);
    return c.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to process upload',
          timestamp: new Date().toISOString(),
        },
      },
      500
    );
  }
});

/**
 * Map error messages to appropriate error codes
 * @param statusCode - HTTP status code
 * @param errorMessage - Error message from business logic
 * @returns Appropriate error code string
 */
function getErrorCode(statusCode: number, errorMessage: string): string {
  switch (statusCode) {
    case 400:
      if (errorMessage.includes('file size')) return 'FILE_TOO_LARGE';
      if (errorMessage.includes('file type')) return 'INVALID_FILE_TYPE';
      if (errorMessage.includes('extension')) return 'INVALID_FILE_EXTENSION';
      return 'VALIDATION_ERROR';
    case 403:
      return 'FORBIDDEN';
    case 429:
      return 'RATE_LIMIT_EXCEEDED';
    case 500:
      if (errorMessage.includes('storage')) return 'STORAGE_ERROR';
      if (errorMessage.includes('database')) return 'DATABASE_ERROR';
      return 'INTERNAL_ERROR';
    default:
      return 'UNKNOWN_ERROR';
  }
}
