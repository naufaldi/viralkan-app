import postgres from 'postgres'

// Secure connection using only environment variables
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required')
}

export const sql = postgres(connectionString, {
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