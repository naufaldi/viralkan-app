import type { FirebaseToken, CreateUser, DbUser, UserResponse } from './types'

/**
 * Validates Firebase token structure and required fields
 * Pure business logic - no external dependencies
 */
export const validateFirebaseToken = (decodedToken: any): FirebaseToken => {
  if (!decodedToken) {
    throw new Error('Decoded token is required')
  }

  const { uid, email, name, picture, email_verified } = decodedToken

  if (!uid || typeof uid !== 'string' || uid.trim().length === 0) {
    throw new Error('Firebase UID is required and must be a non-empty string')
  }

  if (!email || typeof email !== 'string' || !isValidEmail(email)) {
    throw new Error('Valid email is required')
  }

  return {
    uid: uid.trim(),
    email: email.toLowerCase().trim(),
    name: name && typeof name === 'string' ? name.trim() : undefined,
    picture: picture && typeof picture === 'string' ? picture.trim() : undefined,
    email_verified: typeof email_verified === 'boolean' ? email_verified : undefined
  }
}

/**
 * Transforms Firebase token data to user creation format
 * Pure business logic for data transformation
 */
export const transformTokenToUserData = (
  firebaseToken: FirebaseToken,
  provider: string = 'google'
): CreateUser => {
  return {
    firebase_uid: firebaseToken.uid,
    email: firebaseToken.email,
    name: firebaseToken.name || extractNameFromEmail(firebaseToken.email),
    avatar_url: firebaseToken.picture,
    provider: validateProvider(provider)
  }
}

/**
 * Transforms database user to API response format
 * Pure business logic for data transformation
 */
export const transformDbUserToResponse = (dbUser: DbUser): UserResponse => {
  return {
    id: dbUser.id,
    firebase_uid: dbUser.firebase_uid,
    email: dbUser.email,
    name: dbUser.name,
    avatar_url: dbUser.avatar_url,
    provider: dbUser.provider,
    created_at: dbUser.created_at.toISOString()
  }
}

/**
 * Validates user data before database operations
 * Pure business logic for validation
 */
export const validateUserData = (userData: CreateUser): void => {
  if (!userData.firebase_uid || userData.firebase_uid.trim().length === 0) {
    throw new Error('Firebase UID is required')
  }

  if (!userData.email || !isValidEmail(userData.email)) {
    throw new Error('Valid email is required')
  }

  if (!userData.name || userData.name.trim().length === 0) {
    throw new Error('Name is required')
  }

  if (userData.avatar_url && !isValidUrl(userData.avatar_url)) {
    throw new Error('Avatar URL must be a valid URL')
  }
}

/**
 * Checks if user is authorized based on business rules
 * Pure business logic for authorization
 */
export const checkUserAuthorization = (user: DbUser, requiredProvider?: string): boolean => {
  if (!user.id || user.id <= 0) {
    return false
  }

  if (requiredProvider && user.provider !== requiredProvider) {
    return false
  }

  return true
}

/**
 * Generates user display name from various sources
 * Pure business logic for name generation
 */
export const generateUserDisplayName = (
  firebaseToken: FirebaseToken
): string => {
  if (firebaseToken.name && firebaseToken.name.trim().length > 0) {
    return firebaseToken.name.trim()
  }

  return extractNameFromEmail(firebaseToken.email)
}

// Private helper functions (pure utilities)

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

const extractNameFromEmail = (email: string): string => {
  const localPart = email.split('@')[0]
  
  // Remove numbers and special characters, capitalize first letter
  const cleanName = localPart
    .replace(/[0-9_.-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  
  if (cleanName.length === 0) {
    return 'User'
  }

  return cleanName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

const validateProvider = (provider: string): 'google' | 'facebook' | 'email' => {
  const validProviders = ['google', 'facebook', 'email'] as const
  
  if (!validProviders.includes(provider as any)) {
    return 'google' // Default provider
  }
  
  return provider as 'google' | 'facebook' | 'email'
} 