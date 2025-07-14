import {
  AuthVerificationResponseSchema,
  CreateUserSchema,
  AuthErrorResponseSchema,
  FirebaseTokenSchema,
  LogoutResponseSchema,
  UserResponseSchema,
  UserStatsResponseSchema,
} from "@/schema/auth";
import { z } from "zod";

// TypeScript types from Zod schemas (specific to auth)
export type FirebaseToken = z.infer<typeof FirebaseTokenSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type AuthVerificationResponse = z.infer<
  typeof AuthVerificationResponseSchema
>;
export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;
export type ErrorResponse = z.infer<typeof AuthErrorResponseSchema>;
export type UserStatsResponse = z.infer<typeof UserStatsResponseSchema>;

// Database user interface (specific to auth)
export interface DbUser {
  id: number;
  firebase_uid: string;
  email: string;
  name: string;
  avatar_url: string | null;
  provider: string;
  created_at: Date;
}
