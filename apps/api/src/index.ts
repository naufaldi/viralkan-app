import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serve } from '@hono/node-server'
import { swaggerUI } from '@hono/swagger-ui'
import { openAPISpecs } from 'hono-openapi'
import { reportsRouter, authRouter } from '@/routes'
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
    environment: env.NODE_ENV,
    documentation: '/docs'
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

// API Routes
app.route('/api/reports', reportsRouter)
app.route('/api/auth', authRouter)

// OpenAPI Specification Endpoint
app.get(
  '/openapi',
  openAPISpecs(app, {
    documentation: {
      info: {
        title: 'Viralkan API',
        version: '1.0.0',
        description: 'API for reporting road damage and infrastructure issues in Indonesia',
        contact: {
          name: 'Viralkan Team',
          url: 'https://viralkan.app'
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT'
        }
      },
      servers: [
        {
          url: env.NODE_ENV === 'production' ? 'https://api.viralkan.app' : `http://localhost:${env.PORT}`,
          description: env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
        }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Firebase JWT token for authentication'
          }
        }
      },
      security: [
        {
          bearerAuth: []
        }
      ],
      tags: [
        {
          name: 'Reports',
          description: 'Road damage and infrastructure issue reports'
        },
        {
          name: 'Auth',
          description: 'Authentication and user management'
        }
      ]
    }
  })
)

// Swagger UI Documentation
app.get('/docs', swaggerUI({ 
  url: '/openapi',
  defaultModelsExpandDepth: -1  // Hide the schemas section completely
}))

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
console.log(`📚 API Documentation available at http://localhost:${env.PORT}/docs`)
console.log(`📄 OpenAPI Specification at http://localhost:${env.PORT}/openapi`)

serve({
  fetch: app.fetch,
  port: env.PORT
}) 