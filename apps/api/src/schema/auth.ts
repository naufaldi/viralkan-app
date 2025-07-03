import { z } from 'zod'


// Zod Schemas for Validation (specific to auth)
export const FirebaseTokenSchema = z.object({
  uid: z.string().min(1),
  email: z.string().email(),
  name: z.string().optional(),
  picture: z.string().url().optional(),
  email_verified: z.boolean().optional()
})

export const CreateUserSchema = z.object({
  firebase_uid: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1),
  avatar_url: z.string().url().optional(),
  provider: z.enum(['google', 'facebook', 'email']).default('google')
})

export const UserResponseSchema = z.object({
  id: z.number(),
  firebase_uid: z.string(),
  email: z.string(),
  name: z.string(),
  avatar_url: z.string().nullable(),
  provider: z.string(),
  created_at: z.string()
})

export const AuthVerificationResponseSchema = z.object({
  message: z.string(),
  user_id: z.number(),
  user: UserResponseSchema
})

export const LogoutResponseSchema = z.object({
  message: z.string(),
  note: z.string()
})

export const ErrorResponseSchema = z.object({
  error: z.string(),
  statusCode: z.number(),
  timestamp: z.string()
})