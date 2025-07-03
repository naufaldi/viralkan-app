import type { Sql } from 'postgres'
import type { CreateUser, DbUser } from './types'

/**
 * Creates a new user in the database
 * Data layer - handles database operations only
 */
export const createUser = async (
  sql: Sql,
  userData: CreateUser
): Promise<DbUser> => {
  const insertUser = `
    INSERT INTO users(firebase_uid, email, name, avatar_url, provider)
    VALUES($1, $2, $3, $4, $5)
    RETURNING id, firebase_uid, email, name, avatar_url, provider, created_at;
  `
  
  const result = await sql.unsafe(insertUser, [
    userData.firebase_uid,
    userData.email,
    userData.name,
    userData.avatar_url || null,
    userData.provider
  ])

  if (!result[0]) {
    throw new Error('Failed to create user')
  }

  return result[0] as unknown as DbUser
}

/**
 * Finds user by Firebase UID
 * Data layer - database query only
 */
export const findUserByFirebaseUid = async (
  sql: Sql,
  firebaseUid: string
): Promise<DbUser | null> => {
  const findUser = `
    SELECT id, firebase_uid, email, name, avatar_url, provider, created_at
    FROM users 
    WHERE firebase_uid = $1;
  `
  
  const result = await sql.unsafe(findUser, [firebaseUid])
  
  return result[0] ? (result[0] as unknown as DbUser) : null
}

/**
 * Finds user by ID
 * Data layer - database query only
 */
export const findUserById = async (
  sql: Sql,
  userId: number
): Promise<DbUser | null> => {
  const findUser = `
    SELECT id, firebase_uid, email, name, avatar_url, provider, created_at
    FROM users 
    WHERE id = $1;
  `
  
  const result = await sql.unsafe(findUser, [userId])
  
  return result[0] ? (result[0] as unknown as DbUser) : null
}

/**
 * Finds user by email
 * Data layer - database query only
 */
export const findUserByEmail = async (
  sql: Sql,
  email: string
): Promise<DbUser | null> => {
  const findUser = `
    SELECT id, firebase_uid, email, name, avatar_url, provider, created_at
    FROM users 
    WHERE email = $1;
  `
  
  const result = await sql.unsafe(findUser, [email])
  
  return result[0] ? (result[0] as unknown as DbUser) : null
}

/**
 * Updates existing user data
 * Data layer - database update operation
 */
export const updateUser = async (
  sql: Sql,
  firebaseUid: string,
  updateData: Partial<CreateUser>
): Promise<DbUser> => {
  const updateUser = `
    UPDATE users 
    SET email = $2, name = $3, avatar_url = $4
    WHERE firebase_uid = $1
    RETURNING id, firebase_uid, email, name, avatar_url, provider, created_at;
  `
  
  const result = await sql.unsafe(updateUser, [
    firebaseUid,
    updateData.email || '',
    updateData.name || '',
    updateData.avatar_url || null
  ])

  if (!result[0]) {
    throw new Error('Failed to update user')
  }

  return result[0] as unknown as DbUser
}

/**
 * Upserts user (insert or update)
 * Data layer - complex database operation with transaction handling
 */
export const upsertUser = async (
  sql: Sql,
  userData: CreateUser
): Promise<DbUser> => {
  const upsertUser = `
    INSERT INTO users(firebase_uid, email, name, avatar_url, provider)
    VALUES($1, $2, $3, $4, $5)
    ON CONFLICT (firebase_uid) DO UPDATE
    SET email = EXCLUDED.email,
        name = EXCLUDED.name,
        avatar_url = EXCLUDED.avatar_url
    RETURNING id, firebase_uid, email, name, avatar_url, provider, created_at;
  `
  
  const result = await sql.unsafe(upsertUser, [
    userData.firebase_uid,
    userData.email,
    userData.name,
    userData.avatar_url || null,
    userData.provider
  ])

  if (!result[0]) {
    throw new Error('Failed to upsert user')
  }

  return result[0] as unknown as DbUser
}

/**
 * Soft deletes a user (marks as deleted)
 * Data layer - database update operation
 */
export const softDeleteUser = async (
  sql: Sql,
  userId: number
): Promise<boolean> => {
  const deleteUser = `
    UPDATE users 
    SET deleted_at = NOW()
    WHERE id = $1 AND deleted_at IS NULL;
  `
  
  const result = await sql.unsafe(deleteUser, [userId])
  
  return result.count > 0
}

/**
 * Checks if user exists by Firebase UID
 * Data layer - existence check query
 */
export const userExistsByFirebaseUid = async (
  sql: Sql,
  firebaseUid: string
): Promise<boolean> => {
  const checkUser = `
    SELECT 1 FROM users 
    WHERE firebase_uid = $1 
    LIMIT 1;
  `
  
  const result = await sql.unsafe(checkUser, [firebaseUid])
  
  return result.length > 0
}

/**
 * Checks if user exists by email
 * Data layer - existence check query
 */
export const userExistsByEmail = async (
  sql: Sql,
  email: string
): Promise<boolean> => {
  const checkUser = `
    SELECT 1 FROM users 
    WHERE email = $1 
    LIMIT 1;
  `
  
  const result = await sql.unsafe(checkUser, [email])
  
  return result.length > 0
}

/**
 * Gets user statistics
 * Data layer - aggregation query
 */
export const getUserStats = async (
  sql: Sql,
  userId: number
): Promise<{ reportCount: number; joinDate: Date }> => {
  const getStats = `
    SELECT 
      (SELECT COUNT(*) FROM reports WHERE user_id = $1) as report_count,
      u.created_at as join_date
    FROM users u 
    WHERE u.id = $1;
  `
  
  const result = await sql.unsafe(getStats, [userId])
  
  if (!result[0]) {
    throw new Error('User not found')
  }

  return {
    reportCount: parseInt(result[0].report_count as string) || 0,
    joinDate: result[0].join_date as Date
  }
} 