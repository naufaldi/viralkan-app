// Common types shared across all API features

// Application Result Pattern for consistent error handling
export type AppResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
  statusCode: number;
};

// Helper functions for AppResult
export const createSuccess = <T>(data: T): AppResult<T> => ({
  success: true,
  data,
});

export const createError = (error: string, statusCode: number): AppResult<never> => ({
  success: false,
  error,
  statusCode,
});

// Base Custom Error Classes
export class AppError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409);
    this.name = 'ConflictError';
  }
} 