export const env = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/viralkan',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: Number(process.env.DB_PORT) || 5432,
  DB_NAME: process.env.DB_NAME || 'viralkan',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || 'password',
  
  // Server
  PORT: Number(process.env.PORT) || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  
  // Cloudflare R2
  R2_ACCESS_KEY: process.env.R2_ACCESS_KEY || '',
  R2_SECRET_KEY: process.env.R2_SECRET_KEY || '',
  R2_BUCKET: process.env.R2_BUCKET || 'viralkan-uploads',
  R2_ENDPOINT: process.env.R2_ENDPOINT || '',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret-for-development'
}

export const validateEnv = (): void => {
  const requiredEnvs = [
    'DATABASE_URL'
  ]
  
  const missing = requiredEnvs.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    console.warn(`⚠️ Missing environment variables: ${missing.join(', ')}`)
    console.warn('Using fallback values for development')
  }
} 