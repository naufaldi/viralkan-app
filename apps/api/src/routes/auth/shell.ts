import type { Sql } from "postgres";
import admin from "firebase-admin";
import { getFirebaseAuth } from "../../config/firebase";
import * as core from "./core";
import * as data from "./data";
import type {
  CreateUser,
  UserResponse,
  AuthVerificationResponse,
  LogoutResponse,
} from "./types";
import { createSuccess, createError } from "@/types";
import type { AppResult } from "@/types";

/**
 * Verifies Firebase ID token and returns user data
 * Shell layer - orchestrates token verification and user upsert
 */
export const verifyTokenAndGetUser = async (
  sql: Sql,
  idToken: string,
): Promise<AppResult<AuthVerificationResponse>> => {
  try {
    // Input validation
    if (
      !idToken ||
      typeof idToken !== "string" ||
      idToken.trim().length === 0
    ) {
      return createError("ID token is required", 400);
    }

    // External service call - Firebase token verification
    const firebaseAuth = getFirebaseAuth();
    let decodedToken: admin.auth.DecodedIdToken;

    try {
      decodedToken = await firebaseAuth.verifyIdToken(idToken.trim());
    } catch (firebaseError: any) {
      if (firebaseError.message?.includes("expired")) {
        return createError("Token expired", 401);
      }
      if (firebaseError.message?.includes("invalid signature")) {
        return createError("Invalid token signature", 401);
      }
      return createError("Token verification failed", 401);
    }

    // Business logic validation using core layer
    let validatedToken;
    try {
      validatedToken = core.validateFirebaseToken(decodedToken);
    } catch (coreError: any) {
      return createError(coreError.message || "Invalid token data", 400);
    }

    // Transform token to user data using core layer
    const userData = core.transformTokenToUserData(validatedToken, "google");

    // Validate user data using core layer
    try {
      core.validateUserData(userData);
    } catch (validationError: any) {
      return createError(validationError.message || "Invalid user data", 400);
    }

    // Database operation - upsert user
    let dbUser;
    try {
      dbUser = await data.upsertUser(sql, userData);
    } catch (dbError: any) {
      console.error("Database error during user upsert:", dbError);
      return createError("Failed to create or update user", 500);
    }

    // Business logic authorization check
    if (!core.checkUserAuthorization(dbUser)) {
      return createError("User authorization failed", 403);
    }

    // Transform database user to response format
    const userResponse = core.transformDbUserToResponse(dbUser);

    const response: AuthVerificationResponse = {
      message: "Authentication verified",
      user_id: dbUser.id,
      user: userResponse,
    };

    return createSuccess(response);
  } catch (error: any) {
    console.error("Authentication verification error:", error);
    return createError("Authentication failed", 500);
  }
};

/**
 * Gets user by ID with proper authorization
 * Shell layer - orchestrates user retrieval and authorization
 */
export const getUserById = async (
  sql: Sql,
  userId: string, // Changed from number to string (UUID v7)
  requestingUserId: string, // Changed from number to string (UUID v7)
): Promise<AppResult<UserResponse>> => {
  try {
    // Input validation
    if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
      return createError("Valid user ID is required", 400);
    }

    if (
      !requestingUserId ||
      typeof requestingUserId !== "string" ||
      requestingUserId.trim().length === 0
    ) {
      return createError("Valid requesting user ID is required", 400);
    }

    // Authorization check - users can only access their own data
    if (userId !== requestingUserId) {
      return createError("Access denied: can only access own user data", 403);
    }

    // Database operation - find user
    let dbUser;
    try {
      dbUser = await data.findUserById(sql, userId);
    } catch (dbError: any) {
      console.error("Database error during user retrieval:", dbError);
      return createError("Failed to retrieve user", 500);
    }

    if (!dbUser) {
      return createError("User not found", 404);
    }

    // Business logic authorization check
    if (!core.checkUserAuthorization(dbUser)) {
      return createError("User authorization failed", 403);
    }

    // Transform to response format
    const userResponse = core.transformDbUserToResponse(dbUser);

    return createSuccess(userResponse);
  } catch (error: any) {
    console.error("Get user error:", error);
    return createError("Failed to get user", 500);
  }
};

/**
 * Updates user profile data
 * Shell layer - orchestrates user data validation and update
 */
export const updateUserProfile = async (
  sql: Sql,
  userId: string, // Changed from number to string (UUID v7)
  updateData: Partial<CreateUser>,
): Promise<AppResult<UserResponse>> => {
  try {
    // Input validation
    if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
      return createError("Valid user ID is required", 400);
    }

    if (!updateData || typeof updateData !== "object") {
      return createError("Update data is required", 400);
    }

    // Find existing user
    let existingUser;
    try {
      existingUser = await data.findUserById(sql, userId);
    } catch (dbError: any) {
      console.error("Database error during user lookup:", dbError);
      return createError("Failed to find user", 500);
    }

    if (!existingUser) {
      return createError("User not found", 404);
    }

    // Business logic authorization check
    if (!core.checkUserAuthorization(existingUser)) {
      return createError("User authorization failed", 403);
    }

    // Validate update data using core layer
    try {
      if (updateData.email || updateData.name) {
        const testUserData: CreateUser = {
          firebase_uid: existingUser.firebase_uid,
          email: updateData.email || existingUser.email,
          name: updateData.name || existingUser.name,
          avatar_url: updateData.avatar_url,
          provider: existingUser.provider as "google" | "facebook" | "email",
        };
        core.validateUserData(testUserData);
      }
    } catch (validationError: any) {
      return createError(validationError.message || "Invalid update data", 400);
    }

    // Database operation - update user
    let updatedUser;
    try {
      updatedUser = await data.updateUser(
        sql,
        existingUser.firebase_uid,
        updateData,
      );
    } catch (dbError: any) {
      console.error("Database error during user update:", dbError);
      return createError("Failed to update user", 500);
    }

    // Transform to response format
    const userResponse = core.transformDbUserToResponse(updatedUser);

    return createSuccess(userResponse);
  } catch (error: any) {
    console.error("Update user error:", error);
    return createError("Failed to update user", 500);
  }
};

/**
 * Handles user logout (primarily client-side with Firebase)
 * Shell layer - provides logout confirmation and cleanup if needed
 */
export const handleUserLogout = async (
  sql: Sql,
  userId: string, // Changed from number to string (UUID v7)
): Promise<AppResult<LogoutResponse>> => {
  try {
    // Input validation
    if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
      return createError("Valid user ID is required", 400);
    }

    // Verify user exists and is authorized
    let user;
    try {
      user = await data.findUserById(sql, userId);
    } catch (dbError: any) {
      console.error("Database error during logout:", dbError);
      return createError("Failed to process logout", 500);
    }

    if (!user) {
      return createError("User not found", 404);
    }

    // Business logic authorization check
    if (!core.checkUserAuthorization(user)) {
      return createError("User authorization failed", 403);
    }

    // Note: Firebase handles token invalidation client-side
    // Any server-side cleanup (like invalidating refresh tokens) would go here

    const response: LogoutResponse = {
      message: "Logout successful",
      note: "Client should call Firebase Auth signOut() method",
    };

    return createSuccess(response);
  } catch (error: any) {
    console.error("Logout error:", error);
    return createError("Failed to process logout", 500);
  }
};

/**
 * Gets user statistics and profile summary
 * Shell layer - orchestrates multiple data operations
 */
export const getUserStats = async (
  sql: Sql,
  userId: string, // Changed from number to string (UUID v7)
  requestingUserId: string, // Changed from number to string (UUID v7)
): Promise<
  AppResult<{
    total_reports: number;
    reports_by_category: { berlubang: number; retak: number; lainnya: number };
    last_report_date: string | null;
    account_age_days: number;
  }>
> => {
  try {
    // Input validation
    if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
      return createError("Valid user ID is required", 400);
    }

    if (
      !requestingUserId ||
      typeof requestingUserId !== "string" ||
      requestingUserId.trim().length === 0
    ) {
      return createError("Valid requesting user ID is required", 400);
    }

    // Authorization check - users can only access their own stats
    if (userId !== requestingUserId) {
      return createError("Access denied: can only access own user stats", 403);
    }

    // Verify user exists first
    let user;
    try {
      user = await data.findUserById(sql, userId);
    } catch (dbError: any) {
      console.error("Database error during user verification:", dbError);
      return createError("Failed to verify user", 500);
    }

    if (!user) {
      return createError("User not found", 404);
    }

    // Business logic authorization check
    if (!core.checkUserAuthorization(user)) {
      return createError("User authorization failed", 403);
    }

    // Get user statistics
    let stats;
    try {
      stats = await data.getUserStats(sql, userId);
    } catch (dbError: any) {
      console.error("Database error during stats retrieval:", dbError);
      return createError("Failed to retrieve user stats", 500);
    }

    // Transform data for response (convert Date to ISO string)
    const responseStats = {
      total_reports: stats.total_reports,
      reports_by_category: stats.reports_by_category,
      last_report_date: stats.last_report_date
        ? stats.last_report_date.toISOString()
        : null,
      account_age_days: stats.account_age_days,
    };

    return createSuccess(responseStats);
  } catch (error: any) {
    console.error("Get user stats error:", error);
    return createError("Failed to get user stats", 500);
  }
};
