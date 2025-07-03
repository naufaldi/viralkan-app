import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Context, Next } from 'hono'
import { describeRoute } from 'hono-openapi'
import { resolver, validator as zValidator } from 'hono-openapi/zod'
import { z } from 'zod'
import { sql } from '../../db/connection'
import * as shell from './shell'
import {
  AuthVerificationResponseSchema,
  ErrorResponseSchema,
  LogoutResponseSchema,
  UserResponseSchema,
  UserStatsResponseSchema
} from './types'

interface AuthContext extends Context {
  get: (key: 'user_id') => number
  set: (key: 'user_id', value: number) => void
}

// Create auth router with middleware
export const authRouter = new Hono()

// CORS middleware
authRouter.use('*', cors({
  origin: ['http://localhost:3000', 'https://viralkan.app'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}))

/**
 * Health check endpoint for auth service
 * No authentication required
 */
authRouter.get(
  '/health',
  describeRoute({
    description: 'Check if the authentication service is running',
    summary: 'Health check',
    tags: ['Auth'],
    responses: {
      200: {
        description: 'Service is healthy',
        content: {
          'application/json': {
            schema: resolver(z.object({
              message: z.string().openapi({ example: 'Auth service is running' }),
              timestamp: z.string().openapi({ example: '2024-01-15T10:30:00Z' }),
              status: z.string().openapi({ example: 'healthy' })
            }))
          }
        }
      },
      500: {
        description: 'Service is unhealthy',
        content: {
          'application/json': {
            schema: resolver(ErrorResponseSchema)
          }
        }
      }
    }
  }),
  async (c) => {
    try {
      return c.json({ 
        message: 'Auth service is running',
        timestamp: new Date().toISOString(),
        status: 'healthy'
      })
    } catch (error) {
      console.error('Health check error:', error)
      return c.json({
        error: 'Health check failed',
        statusCode: 500,
        timestamp: new Date().toISOString()
      }, 500)
    }
  }
)

/**
 * Firebase token verification endpoint
 * Verifies Firebase ID token and creates/updates user
 */
authRouter.post(
  '/verify',
  describeRoute({
    description: 'Verify Firebase ID token and authenticate user',
    summary: 'Verify Firebase token',
    tags: ['Auth'],
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'Token verified successfully',
        content: {
          'application/json': {
            schema: resolver(AuthVerificationResponseSchema)
          }
        }
      },
      401: {
        description: 'Invalid or expired token',
        content: {
          'application/json': {
            schema: resolver(ErrorResponseSchema)
          }
        }
      },
      500: {
        description: 'Authentication service error',
        content: {
          'application/json': {
            schema: resolver(ErrorResponseSchema)
          }
        }
      }
    }
  }),
  async (c) => {
    try {
      const authHeader = c.req.header('Authorization')
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({
          error: 'Missing or invalid Authorization header',
          statusCode: 401,
          timestamp: new Date().toISOString()
        }, 401)
      }

      const idToken = authHeader.substring(7) // Remove 'Bearer ' prefix
      
      if (!idToken) {
        return c.json({
          error: 'ID token is required',
          statusCode: 401,
          timestamp: new Date().toISOString()
        }, 401)
      }

      // Use shell layer for business logic orchestration
      const result = await shell.verifyTokenAndGetUser(sql, idToken)
      
      if (result.success) {
        return c.json(result.data, 200)
      } else {
        return c.json({
          error: result.error,
          statusCode: result.statusCode,
          timestamp: new Date().toISOString()
        }, result.statusCode as 400 | 401 | 403 | 404 | 409 | 500)
      }

    } catch (error) {
      console.error('Token verification endpoint error:', error)
      return c.json({
        error: 'Authentication failed',
        statusCode: 500,
        timestamp: new Date().toISOString()
      }, 500)
    }
  }
)

/**
 * Get current user profile endpoint
 * Requires authentication (user_id in context)
 */
authRouter.get(
  '/me',
  describeRoute({
    description: 'Get current authenticated user profile',
    summary: 'Get user profile',
    tags: ['Auth'],
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'User profile retrieved successfully',
        content: {
          'application/json': {
            schema: resolver(UserResponseSchema)
          }
        }
      },
      401: {
        description: 'User not authenticated',
        content: {
          'application/json': {
            schema: resolver(ErrorResponseSchema)
          }
        }
      },
      404: {
        description: 'User profile not found',
        content: {
          'application/json': {
            schema: resolver(ErrorResponseSchema)
          }
        }
      },
      500: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: resolver(ErrorResponseSchema)
          }
        }
      }
    }
  }),
  async (c: AuthContext) => {
    try {
      const userId = c.get('user_id')
      
      if (!userId) {
        return c.json({
          error: 'Authentication required',
          statusCode: 401,
          timestamp: new Date().toISOString()
        }, 401)
      }

      // Use shell layer for business logic
      const result = await shell.getUserById(sql, userId, userId)
      
      if (result.success) {
        return c.json(result.data, 200)
      } else {
        return c.json({
          error: result.error,
          statusCode: result.statusCode,
          timestamp: new Date().toISOString()
        }, result.statusCode as 400 | 401 | 403 | 404 | 409 | 500)
      }

    } catch (error) {
      console.error('Get user profile endpoint error:', error)
      return c.json({
        error: 'Failed to get user profile',
        statusCode: 500,
        timestamp: new Date().toISOString()
      }, 500)
    }
  }
)

/**
 * Get user statistics endpoint
 * Requires authentication (user_id in context)
 */
authRouter.get(
  '/me/stats',
  describeRoute({
    description: 'Get current user statistics and activity summary',
    summary: 'Get user statistics',
    tags: ['Auth'],
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'User statistics retrieved successfully',
        content: {
          'application/json': {
            schema: resolver(UserStatsResponseSchema)
          }
        }
      },
      401: {
        description: 'User not authenticated',
        content: {
          'application/json': {
            schema: resolver(ErrorResponseSchema)
          }
        }
      },
      404: {
        description: 'User not found',
        content: {
          'application/json': {
            schema: resolver(ErrorResponseSchema)
          }
        }
      },
      500: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: resolver(ErrorResponseSchema)
          }
        }
      }
    }
  }),
  async (c: AuthContext) => {
    try {
      const userId = c.get('user_id')
      
      if (!userId) {
        return c.json({
          error: 'Authentication required',
          statusCode: 401,
          timestamp: new Date().toISOString()
        }, 401)
      }

      // Use shell layer for business logic
      const result = await shell.getUserStats(sql, userId, userId)
      
      if (result.success) {
        return c.json(result.data, 200)
      } else {
        return c.json({
          error: result.error,
          statusCode: result.statusCode,
          timestamp: new Date().toISOString()
        }, result.statusCode as 400 | 401 | 403 | 404 | 409 | 500)
      }

    } catch (error) {
      console.error('Get user stats endpoint error:', error)
      return c.json({
        error: 'Failed to get user statistics',
        statusCode: 500,
        timestamp: new Date().toISOString()
      }, 500)
    }
  }
)

/**
 * Logout endpoint
 * Firebase handles this client-side, but we provide confirmation
 */
authRouter.post(
  '/logout',
  describeRoute({
    description: 'Logout current user (client-side token cleanup required)',
    summary: 'Logout user',
    tags: ['Auth'],
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'Logout processed successfully',
        content: {
          'application/json': {
            schema: resolver(LogoutResponseSchema)
          }
        }
      },
      401: {
        description: 'User not authenticated',
        content: {
          'application/json': {
            schema: resolver(ErrorResponseSchema)
          }
        }
      },
      500: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: resolver(ErrorResponseSchema)
          }
        }
      }
    }
  }),
  async (c: AuthContext) => {
    try {
      const userId = c.get('user_id')
      
      if (!userId) {
        return c.json({
          error: 'Authentication required',
          statusCode: 401,
          timestamp: new Date().toISOString()
        }, 401)
      }

      // Use shell layer for business logic
      const result = await shell.handleUserLogout(sql, userId)
      
      if (result.success) {
        return c.json(result.data, 200)
      } else {
        return c.json({
          error: result.error,
          statusCode: result.statusCode,
          timestamp: new Date().toISOString()
        }, result.statusCode as 400 | 401 | 403 | 404 | 409 | 500)
      }

    } catch (error) {
      console.error('Logout endpoint error:', error)
      return c.json({
        error: 'Failed to process logout',
        statusCode: 500,
        timestamp: new Date().toISOString()
      }, 500)
    }
  }
)

