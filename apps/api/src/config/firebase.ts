import admin from 'firebase-admin'
import { env } from './env'

let firebaseApp: admin.app.App | null = null

export const initializeFirebase = (): admin.app.App => {
  if (firebaseApp) {
    return firebaseApp
  }

  try {
    const serviceAccountJson = env.FIREBASE_SERVICE_ACCOUNT_JSON
    
    if (!serviceAccountJson) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON environment variable is required')
    }

    const serviceAccount = JSON.parse(serviceAccountJson)
    
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    })

    console.log('✅ Firebase Admin initialized successfully')
    return firebaseApp
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error)
    throw error
  }
}

export const getFirebaseAuth = (): admin.auth.Auth => {
  const app = initializeFirebase()
  return admin.auth(app)
} 