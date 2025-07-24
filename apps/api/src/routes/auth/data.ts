import type { Sql } from "postgres";
import type { CreateUser, DbUser } from "./types";
import { uuidv7 } from "uuidv7";

/**
 * Creates a new user in the database
 * Data layer - handles database operations only
 */
export const createUser = async (
  sql: Sql,
  userData: CreateUser,
): Promise<DbUser> => {
  const userId = uuidv7(); // Generate UUID v7 for new user
  const insertUser = `
    INSERT INTO users(id, firebase_uid, email, name, avatar_url, provider)
    VALUES($1, $2, $3, $4, $5, $6)
    RETURNING id, firebase_uid, email, name, avatar_url, provider, role, created_at;
  `;

  const result = await sql.unsafe(insertUser, [
    userId,
    userData.firebase_uid,
    userData.email,
    userData.name,
    userData.avatar_url || null,
    userData.provider,
  ]);

  if (!result[0]) {
    throw new Error("Failed to create user");
  }

  return result[0] as unknown as DbUser;
};

/**
 * Finds user by Firebase UID
 * Data layer - database query only
 */
export const findUserByFirebaseUid = async (
  sql: Sql,
  firebaseUid: string,
): Promise<DbUser | null> => {
  const findUser = `
    SELECT id, firebase_uid, email, name, avatar_url, provider, role, created_at
    FROM users 
    WHERE firebase_uid = $1;
  `;

  const result = await sql.unsafe(findUser, [firebaseUid]);

  return result[0] ? (result[0] as unknown as DbUser) : null;
};

/**
 * Finds user by ID
 * Data layer - database query only
 */
export const findUserById = async (
  sql: Sql,
  userId: string, // Changed from number to string (UUID v7)
): Promise<DbUser | null> => {
  const findUser = `
    SELECT id, firebase_uid, email, name, avatar_url, provider, role, created_at
    FROM users 
    WHERE id = $1;
  `;

  const result = await sql.unsafe(findUser, [userId]);

  return result[0] ? (result[0] as unknown as DbUser) : null;
};

/**
 * Finds user by email
 * Data layer - database query only
 */
export const findUserByEmail = async (
  sql: Sql,
  email: string,
): Promise<DbUser | null> => {
  const findUser = `
    SELECT id, firebase_uid, email, name, avatar_url, provider, role, created_at
    FROM users 
    WHERE email = $1;
  `;

  const result = await sql.unsafe(findUser, [email]);

  return result[0] ? (result[0] as unknown as DbUser) : null;
};

/**
 * Updates existing user data
 * Data layer - database update operation
 */
export const updateUser = async (
  sql: Sql,
  firebaseUid: string,
  updateData: Partial<CreateUser>,
): Promise<DbUser> => {
  const updateUser = `
    UPDATE users 
    SET email = $2, name = $3, avatar_url = $4
    WHERE firebase_uid = $1
    RETURNING id, firebase_uid, email, name, avatar_url, provider, role, created_at;
  `;

  const result = await sql.unsafe(updateUser, [
    firebaseUid,
    updateData.email || "",
    updateData.name || "",
    updateData.avatar_url || null,
  ]);

  if (!result[0]) {
    throw new Error("Failed to update user");
  }

  return result[0] as unknown as DbUser;
};

/**
 * Upserts user (insert or update)
 * Data layer - complex database operation with transaction handling
 */
export const upsertUser = async (
  sql: Sql,
  userData: CreateUser,
): Promise<DbUser> => {
  // First, try to find existing user by firebase_uid or email
  const findExisting = `
    SELECT id, firebase_uid, email, name, avatar_url, provider, role, created_at
    FROM users 
    WHERE firebase_uid = $1 OR email = $2;
  `;

  const existingResult = await sql.unsafe(findExisting, [
    userData.firebase_uid,
    userData.email,
  ]);

  if (existingResult[0]) {
    // Update existing user
    const updateUser = `
      UPDATE users 
      SET firebase_uid = $1,
          email = $2,
          name = $3,
          avatar_url = $4,
          provider = $5
      WHERE id = $6
      RETURNING id, firebase_uid, email, name, avatar_url, provider, role, created_at;
    `;

    const result = await sql.unsafe(updateUser, [
      userData.firebase_uid,
      userData.email,
      userData.name,
      userData.avatar_url || null,
      userData.provider,
      existingResult[0].id,
    ]);

    if (!result[0]) {
      throw new Error("Failed to update existing user");
    }

    return result[0] as unknown as DbUser;
  } else {
    // Create new user
    const userId = uuidv7(); // Generate UUID v7 for new user
    const insertUser = `
      INSERT INTO users(id, firebase_uid, email, name, avatar_url, provider)
      VALUES($1, $2, $3, $4, $5, $6)
      RETURNING id, firebase_uid, email, name, avatar_url, provider, role, created_at;
    `;

    const result = await sql.unsafe(insertUser, [
      userId,
      userData.firebase_uid,
      userData.email,
      userData.name,
      userData.avatar_url || null,
      userData.provider,
    ]);

    if (!result[0]) {
      throw new Error("Failed to create new user");
    }

    return result[0] as unknown as DbUser;
  }
};

/**
 * Soft deletes a user (marks as deleted)
 * Data layer - database update operation
 */
export const softDeleteUser = async (
  sql: Sql,
  userId: number,
): Promise<boolean> => {
  const deleteUser = `
    UPDATE users 
    SET deleted_at = NOW()
    WHERE id = $1 AND deleted_at IS NULL;
  `;

  const result = await sql.unsafe(deleteUser, [userId]);

  return result.count > 0;
};

/**
 * Checks if user exists by Firebase UID
 * Data layer - existence check query
 */
export const userExistsByFirebaseUid = async (
  sql: Sql,
  firebaseUid: string,
): Promise<boolean> => {
  const checkUser = `
    SELECT 1 FROM users 
    WHERE firebase_uid = $1 
    LIMIT 1;
  `;

  const result = await sql.unsafe(checkUser, [firebaseUid]);

  return result.length > 0;
};

/**
 * Checks if user exists by email
 * Data layer - existence check query
 */
export const userExistsByEmail = async (
  sql: Sql,
  email: string,
): Promise<boolean> => {
  const checkUser = `
    SELECT 1 FROM users 
    WHERE email = $1 
    LIMIT 1;
  `;

  const result = await sql.unsafe(checkUser, [email]);

  return result.length > 0;
};

/**
 * Gets user statistics
 * Data layer - aggregation query
 */
export const getUserStats = async (
  sql: Sql,
  userId: string, // Changed from number to string (UUID v7)
): Promise<{
  total_reports: number;
  reports_by_category: { berlubang: number; retak: number; lainnya: number };
  last_report_date: Date | null;
  account_age_days: number;
}> => {
  const getStats = `
    SELECT 
      COUNT(r.id) as total_reports,
      COUNT(CASE WHEN r.category = 'berlubang' THEN 1 END) as berlubang_count,
      COUNT(CASE WHEN r.category = 'retak' THEN 1 END) as retak_count,
      COUNT(CASE WHEN r.category = 'lainnya' THEN 1 END) as lainnya_count,
      MAX(r.created_at) as last_report_date,
      u.created_at as join_date
    FROM users u 
    LEFT JOIN reports r ON r.user_id = u.id
    WHERE u.id = $1
    GROUP BY u.id, u.created_at;
  `;

  const result = await sql.unsafe(getStats, [userId]);

  if (!result[0]) {
    throw new Error("User not found");
  }

  const row = result[0] as any;
  const joinDate = new Date(row.join_date);
  const now = new Date();
  const accountAgeDays = Math.floor(
    (now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  return {
    total_reports: parseInt(row.total_reports) || 0,
    reports_by_category: {
      berlubang: parseInt(row.berlubang_count) || 0,
      retak: parseInt(row.retak_count) || 0,
      lainnya: parseInt(row.lainnya_count) || 0,
    },
    last_report_date: row.last_report_date
      ? new Date(row.last_report_date)
      : null,
    account_age_days: accountAgeDays,
  };
};
