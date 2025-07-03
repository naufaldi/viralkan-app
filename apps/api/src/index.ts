import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serve } from '@hono/node-server'
import { reportsRouter, authRouter, meRouter } from '@/routes'
import { env, validateEnv } from '@/config/env'
import { testConnection } from '@/db/connection'
import { initializeFirebase } from '@/config/firebase'

const app = new Hono()

// Validate environment variables
validateEnv()

// Initialize Firebase Admin SDK
try {
  initializeFirebase()
} catch (error) {
  console.error('Failed to initialize Firebase:', error)
  if (env.NODE_ENV === 'production') {
    process.exit(1)
  }
}

app.use('*', logger())
app.use('*', cors({
  origin: ['http://localhost:5173', 'https://viralkan.app', 'https://www.viralkan.app'],
  credentials: true
}))

app.get('/', (c) => {
  return c.json({
    message: 'Viralkan API v1',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV
  })
})

app.get('/health', async (c) => {
  const dbConnected = await testConnection()
  return c.json({
    status: dbConnected ? 'healthy' : 'unhealthy',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  })
})

app.route('/api/reports', reportsRouter)
app.route('/api/auth', authRouter)
app.route('/api/me', meRouter)

app.notFound((c) => {
  return c.json({ error: { code: 'NOT_FOUND', message: 'Endpoint not found' } }, 404)
})

app.onError((err, c) => {
  console.error('Server error:', err)
  return c.json({ 
    error: { 
      code: 'INTERNAL_ERROR', 
      message: 'Internal server error' 
    } 
  }, 500)
})

console.log(`🚀 Viralkan API starting on port ${env.PORT}`)

serve({
  fetch: app.fetch,
  port: env.PORT
}) 