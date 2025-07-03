import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Context } from 'hono'
import { sql } from '../../db/connection'
import * as shell from './shell'
import type { ErrorResponse } from './types'

// Create auth router with middleware
export const authRouter = new Hono()

// CORS middleware
authRouter.use('*', cors({
  origin: ['http://localhost:3000', 'https://viralkan.app'], // Add your frontend domains
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}))

/**
 * Health check endpoint for auth service
 * No authentication required
 */
authRouter.get('/health', async (c: Context) => {
  try {
    return c.json({ 
      message: 'Auth service is running',
      timestamp: new Date().toISOString(),
      status: 'healthy'
    })
  } catch (error) {
    console.error('Health check error:', error)
    const errorResponse: ErrorResponse = {
      error: 'Health check failed',
      statusCode: 500,
      timestamp: new Date().toISOString()
    }
    return c.json(errorResponse, 500)
  }
})

/**
 * Firebase token verification endpoint
 * Verifies Firebase ID token and creates/updates user
 */
authRouter.post('/verify', async (c: Context) => {
  try {
    const authHeader = c.req.header('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const errorResponse: ErrorResponse = {
        error: 'Missing or invalid Authorization header',
        statusCode: 401,
        timestamp: new Date().toISOString()
      }
      return c.json(errorResponse, 401)
    }

    const idToken = authHeader.substring(7) // Remove 'Bearer ' prefix
    
    if (!idToken) {
      const errorResponse: ErrorResponse = {
        error: 'ID token is required',
        statusCode: 401,
        timestamp: new Date().toISOString()
      }
      return c.json(errorResponse, 401)
    }

    // Use shell layer for business logic orchestration
    const result = await shell.verifyTokenAndGetUser(sql, idToken)
    
    if (result.success) {
      return c.json(result.data, 200)
    } else {
      const errorResponse: ErrorResponse = {
        error: result.error,
        statusCode: result.statusCode,
        timestamp: new Date().toISOString()
      }
      return c.json(errorResponse, result.statusCode as 400 | 401 | 403 | 404 | 409 | 500)
    }

  } catch (error) {
    console.error('Token verification endpoint error:', error)
    const errorResponse: ErrorResponse = {
      error: 'Authentication failed',
      statusCode: 500,
      timestamp: new Date().toISOString()
    }
    return c.json(errorResponse, 500)
  }
})

/**
 * Get current user profile endpoint
 * Requires authentication (user_id in context)
 */
authRouter.get('/me', async (c: Context) => {
  try {
    const userId = c.get('user_id') as number
    
    if (!userId) {
      const errorResponse: ErrorResponse = {
        error: 'Authentication required',
        statusCode: 401,
        timestamp: new Date().toISOString()
      }
      return c.json(errorResponse, 401)
    }

    // Use shell layer for business logic
    const result = await shell.getUserById(sql, userId, userId)
    
    if (result.success) {
      return c.json(result.data, 200)
    } else {
      const errorResponse: ErrorResponse = {
        error: result.error,
        statusCode: result.statusCode,
        timestamp: new Date().toISOString()
      }
      return c.json(errorResponse, result.statusCode as 400 | 401 | 403 | 404 | 409 | 500)
    }

  } catch (error) {
    console.error('Get user profile endpoint error:', error)
    const errorResponse: ErrorResponse = {
      error: 'Failed to get user profile',
      statusCode: 500,
      timestamp: new Date().toISOString()
    }
    return c.json(errorResponse, 500)
  }
})

/**
 * Get user statistics endpoint
 * Requires authentication (user_id in context)
 */
authRouter.get('/me/stats', async (c: Context) => {
  try {
    const userId = c.get('user_id') as number
    
    if (!userId) {
      const errorResponse: ErrorResponse = {
        error: 'Authentication required',
        statusCode: 401,
        timestamp: new Date().toISOString()
      }
      return c.json(errorResponse, 401)
    }

    // Use shell layer for business logic
    const result = await shell.getUserStats(sql, userId, userId)
    
    if (result.success) {
      return c.json(result.data, 200)
    } else {
      const errorResponse: ErrorResponse = {
        error: result.error,
        statusCode: result.statusCode,
        timestamp: new Date().toISOString()
      }
      return c.json(errorResponse, result.statusCode as 400 | 401 | 403 | 404 | 409 | 500)
    }

  } catch (error) {
    console.error('Get user stats endpoint error:', error)
    const errorResponse: ErrorResponse = {
      error: 'Failed to get user statistics',
      statusCode: 500,
      timestamp: new Date().toISOString()
    }
    return c.json(errorResponse, 500)
  }
})

/**
 * Logout endpoint
 * Firebase handles this client-side, but we provide confirmation
 */
authRouter.post('/logout', async (c: Context) => {
  try {
    const userId = c.get('user_id') as number
    
    if (!userId) {
      const errorResponse: ErrorResponse = {
        error: 'Authentication required',
        statusCode: 401,
        timestamp: new Date().toISOString()
      }
      return c.json(errorResponse, 401)
    }

    // Use shell layer for business logic
    const result = await shell.handleUserLogout(sql, userId)
    
    if (result.success) {
      return c.json(result.data, 200)
    } else {
      const errorResponse: ErrorResponse = {
        error: result.error,
        statusCode: result.statusCode,
        timestamp: new Date().toISOString()
      }
      return c.json(errorResponse, result.statusCode as 400 | 401 | 403 | 404 | 409 | 500)
    }

  } catch (error) {
    console.error('Logout endpoint error:', error)
    const errorResponse: ErrorResponse = {
      error: 'Failed to process logout',
      statusCode: 500,
      timestamp: new Date().toISOString()
    }
    return c.json(errorResponse, 500)
  }
})

/**
 * Global error handler for auth routes
 */
authRouter.onError((err, c) => {
  console.error('Auth router error:', err)
  
  const errorResponse: ErrorResponse = {
    error: 'Internal server error',
    statusCode: 500,
    timestamp: new Date().toISOString()
  }
  
  return c.json(errorResponse, 500)
}) 