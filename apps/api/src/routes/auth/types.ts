import { z } from 'zod'

// Firebase token validation schema
export const FirebaseTokenSchema = z.object({
  uid: z.string().min(1),
  email: z.string().email(),
  name: z.string().optional(),
  picture: z.string().url().optional(),
  email_verified: z.boolean().optional()
})

// User creation schema
export const CreateUserSchema = z.object({
  firebase_uid: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1),
  avatar_url: z.string().url().optional(),
  provider: z.enum(['google', 'facebook', 'email']).default('google')
})

// User response schema
export const UserResponseSchema = z.object({
  id: z.number(),
  firebase_uid: z.string(),
  email: z.string(),
  name: z.string(),
  avatar_url: z.string().nullable(),
  provider: z.string(),
  created_at: z.string()
})

// Auth verification response schema
export const AuthVerificationResponseSchema = z.object({
  message: z.string(),
  user_id: z.number(),
  user: UserResponseSchema
})

// Logout response schema
export const LogoutResponseSchema = z.object({
  message: z.string(),
  note: z.string()
})

// Error response schema
export const ErrorResponseSchema = z.object({
  error: z.string(),
  statusCode: z.number(),
  timestamp: z.string()
})

// TypeScript types from Zod schemas
export type FirebaseToken = z.infer<typeof FirebaseTokenSchema>
export type CreateUser = z.infer<typeof CreateUserSchema>
export type UserResponse = z.infer<typeof UserResponseSchema>
export type AuthVerificationResponse = z.infer<typeof AuthVerificationResponseSchema>
export type LogoutResponse = z.infer<typeof LogoutResponseSchema>
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>

// Database user interface
export interface DbUser {
  id: number
  firebase_uid: string
  email: string
  name: string
  avatar_url: string | null
  provider: string
  created_at: Date
}

// AppResult type for error handling
export type AppResult<T> = {
  success: true
  data: T
} | {
  success: false
  error: string
  statusCode: number
}

// Helper functions for AppResult
export const createSuccess = <T>(data: T): AppResult<T> => ({
  success: true,
  data
})

export const createError = (error: string, statusCode: number): AppResult<never> => ({
  success: false,
  error,
  statusCode
})

// Custom error classes
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400)
    this.name = 'ValidationError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401)
    this.name = 'UnauthorizedError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409)
    this.name = 'ConflictError'
  }
} 