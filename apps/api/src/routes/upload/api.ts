import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { firebaseAuthMiddleware } from "../../middleware/auth";
import { UploadResponseSchema, UploadErrorResponseSchema } from "./types";
import * as shell from "./shell";

type Env = {
  Variables: {
    user_id: string; // Changed from number to string (UUID v7)
  };
};

// Create router for upload endpoints
export const uploadRouter = new OpenAPIHono<Env>();

// Global middleware for all routes
uploadRouter.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "https://viralkan.com"],
    credentials: true,
    allowMethods: ["POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

// --- Route Definitions ---

const uploadImageRoute = createRoute({
  method: "post",
  path: "/",
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: z.object({
            file: z.any().openapi({
              type: "string",
              format: "binary",
              description: "Image file to upload (JPEG, PNG, WebP, max 10MB)",
            }),
          }),
        },
      },
    },
  },
  middleware: [firebaseAuthMiddleware],
  summary: "Upload image file",
  description:
    "Upload an image file to Cloudflare R2 storage for use in reports",
  tags: ["Upload"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Image uploaded successfully",
      content: {
        "application/json": { schema: UploadResponseSchema },
      },
    },
    400: {
      description: "Invalid file or validation error",
      content: { "application/json": { schema: UploadErrorResponseSchema } },
    },
    401: {
      description: "User not authenticated",
      content: { "application/json": { schema: UploadErrorResponseSchema } },
    },
    403: {
      description: "User not authorized to upload",
      content: { "application/json": { schema: UploadErrorResponseSchema } },
    },
    429: {
      description: "Rate limit exceeded",
      content: { "application/json": { schema: UploadErrorResponseSchema } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: UploadErrorResponseSchema } },
    },
  },
});

// --- Route Handlers ---

uploadRouter.openapi(uploadImageRoute, async (c) => {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    // Enhanced authentication error handling
    const userId = c.get("user_id");

    if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
      console.warn(
        `Authentication failed - invalid user ID: ${userId} [${requestId}]`,
      );
      return c.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message:
              "Authentication required. Please provide a valid authorization token.",
            timestamp: new Date().toISOString(),
            requestId,
          },
        },
        401,
      );
    }

    // Enhanced request parsing with error handling
    let body: any;
    let file: any;

    try {
      body = await c.req.parseBody();
      file = body.file;
    } catch (parseError: any) {
      console.error(
        `Request parsing failed for user ${userId}:`,
        parseError.message,
        `[${requestId}]`,
      );
      return c.json(
        {
          error: {
            code: "INVALID_REQUEST",
            message:
              "Failed to parse multipart form data. Ensure request is properly formatted.",
            timestamp: new Date().toISOString(),
            requestId,
          },
        },
        400,
      );
    }

    if (!file) {
      console.warn(
        `No file provided in request for user ${userId} [${requestId}]`,
      );
      return c.json(
        {
          error: {
            code: "MISSING_FILE",
            message:
              "No file provided in request. Please select an image file to upload.",
            timestamp: new Date().toISOString(),
            requestId,
          },
        },
        400,
      );
    }

    // Enhanced R2 configuration handling
    let r2Config;
    try {
      r2Config = shell.getR2Config();
    } catch (configError: any) {
      console.error(
        `R2 configuration error for user ${userId}:`,
        configError.message,
        `[${requestId}]`,
      );
      return c.json(
        {
          error: {
            code: "CONFIGURATION_ERROR",
            message:
              "Storage service temporarily unavailable. Please try again later.",
            timestamp: new Date().toISOString(),
            requestId,
          },
        },
        500,
      );
    }

    // Process file upload with enhanced error context
    console.log(
      `Processing upload for user ${userId}, file: ${file.name || "unknown"} [${requestId}]`,
    );
    const result = await shell.processFileUpload(userId, file, r2Config);

    if (result.success) {
      const processingTime = Date.now() - startTime;
      console.log(
        `Upload successful for user ${userId} in ${processingTime}ms [${requestId}]`,
      );
      return c.json(result.data, 200);
    }

    // Enhanced error mapping and logging
    const statusCode = result.statusCode as 400 | 403 | 429 | 500;
    const errorCode = getErrorCode(statusCode, result.error);

    console.warn(`Upload failed for user ${userId}:`, {
      error: result.error,
      statusCode,
      errorCode,
      requestId,
    });

    return c.json(
      {
        error: {
          code: errorCode,
          message: result.error,
          timestamp: new Date().toISOString(),
          requestId,
        },
      },
      statusCode,
    );
  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error(`Unexpected error in upload endpoint:`, {
      error: error.message,
      stack: error.stack,
      userId: c.get("user_id"),
      processingTime,
      requestId,
    });

    return c.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message:
            "An unexpected error occurred while processing your upload. Please try again.",
          timestamp: new Date().toISOString(),
          requestId,
        },
      },
      500,
    );
  }
});

/**
 * Map error messages to appropriate error codes with comprehensive error categorization
 * @param statusCode - HTTP status code
 * @param errorMessage - Error message from business logic
 * @returns Appropriate error code string
 */
function getErrorCode(statusCode: number, errorMessage: string): string {
  const message = errorMessage.toLowerCase();

  switch (statusCode) {
    case 400:
      // File validation errors
      if (
        message.includes("file size") ||
        message.includes("exceeds") ||
        message.includes("mb")
      ) {
        return "FILE_TOO_LARGE";
      }
      if (message.includes("file type") || message.includes("mime type")) {
        return "INVALID_FILE_TYPE";
      }
      if (
        message.includes("extension") ||
        message.includes("allowed extensions")
      ) {
        return "INVALID_FILE_EXTENSION";
      }
      if (message.includes("empty") || message.includes("corrupted")) {
        return "INVALID_FILE_CONTENT";
      }
      if (
        message.includes("filename") ||
        message.includes("illegal characters")
      ) {
        return "INVALID_FILENAME";
      }
      if (message.includes("buffer") || message.includes("format")) {
        return "FILE_PROCESSING_ERROR";
      }
      if (message.includes("user id") || message.includes("invalid user")) {
        return "INVALID_USER";
      }
      return "VALIDATION_ERROR";

    case 401:
      return "UNAUTHORIZED";

    case 403:
      if (message.includes("permissions") || message.includes("authorized")) {
        return "INSUFFICIENT_PERMISSIONS";
      }
      return "FORBIDDEN";

    case 429:
      if (
        message.includes("rate limit") ||
        message.includes("uploads per hour")
      ) {
        return "RATE_LIMIT_EXCEEDED";
      }
      return "TOO_MANY_REQUESTS";

    case 500:
      // Storage-related errors
      if (
        message.includes("r2") ||
        message.includes("storage") ||
        message.includes("bucket")
      ) {
        return "STORAGE_ERROR";
      }
      if (message.includes("database") || message.includes("sql")) {
        return "DATABASE_ERROR";
      }
      if (message.includes("configuration") || message.includes("config")) {
        return "CONFIGURATION_ERROR";
      }
      if (message.includes("client") || message.includes("connection")) {
        return "SERVICE_UNAVAILABLE";
      }
      if (message.includes("timeout")) {
        return "TIMEOUT_ERROR";
      }
      if (
        message.includes("access denied") ||
        message.includes("credentials")
      ) {
        return "STORAGE_ACCESS_ERROR";
      }
      return "INTERNAL_ERROR";

    default:
      return "UNKNOWN_ERROR";
  }
}
