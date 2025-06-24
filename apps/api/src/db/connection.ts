import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/viralkan'

export const sql = postgres(connectionString, {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'viralkan',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 10,
  idle_timeout: 20,
  connect_timeout: 30,
  prepare: true,
  onnotice: () => {}
})

export const testConnection = async (): Promise<boolean> => {
  try {
    await sql`SELECT 1`
    console.log('✅ Database connection successful')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
} 