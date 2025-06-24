import { sql, testConnection } from './connection'

const resetDatabase = async () => {
  console.log('🔄 Resetting database...')
  
  try {
    const isConnected = await testConnection()
    if (!isConnected) {
      console.error('❌ Cannot connect to database')
      process.exit(1)
    }

    // Drop tables in correct order (reports first due to foreign key)
    await sql`DROP TABLE IF EXISTS reports CASCADE`
    await sql`DROP TABLE IF EXISTS users CASCADE`
    
    console.log('🗑️ Dropped existing tables')
    
    // Import and run migrations
    const { runMigrations } = await import('./migrate')
    await runMigrations()
    
    console.log('✅ Database reset completed')
    
  } catch (error) {
    console.error('❌ Database reset failed:', error)
    process.exit(1)
  } finally {
    await sql.end()
  }
}

// Run reset if this file is executed directly
if (import.meta.main) {
  resetDatabase()
}

export { resetDatabase } 