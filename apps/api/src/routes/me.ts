import { Hono } from 'hono'
import type { Context } from 'hono'
import { describeRoute } from 'hono-openapi'
import { resolver } from 'hono-openapi/zod'
import { z } from 'zod'
import { sql } from '@/db/connection'

const meRouter = new Hono()

// Note: This router duplicates functionality from /api/auth/me
// Consider consolidating these endpoints in the future

const UserProfileSchema = z.object({
  id: z.number().openapi({
    example: 123,
    description: 'User ID'
  }),
  email: z.string().openapi({
    example: 'user@example.com',
    description: 'User email'
  }),
  name: z.string().openapi({
    example: 'John Doe',
    description: 'User name'
  }),
  avatar_url: z.string().nullable().openapi({
    example: 'https://example.com/avatar.jpg',
    description: 'Avatar URL'
  }),
  created_at: z.string().openapi({
    example: '2024-01-15T10:30:00Z',
    description: 'Account creation date'
  })
}).openapi({
  ref: 'UserProfile',
  description: 'User profile information'
})

const UserReportSchema = z.object({
  id: z.number().openapi({ example: 456, description: 'Report ID' }),
  image_url: z.string().openapi({ example: 'https://example.com/image.jpg' }),
  category: z.string().openapi({ example: 'berlubang' }),
  street_name: z.string().openapi({ example: 'Jalan Sudirman' }),
  location_text: z.string().openapi({ example: 'Near intersection' }),
  lat: z.number().openapi({ example: -6.2088 }),
  lon: z.number().openapi({ example: 106.8456 }),
  created_at: z.string().openapi({ example: '2024-01-15T10:30:00Z' })
}).openapi({
  ref: 'UserReport',
  description: 'User report information'
})

const UserReportsResponseSchema = z.object({
  items: z.array(UserReportSchema),
  total: z.number().openapi({
    example: 10,
    description: 'Total number of reports'
  })
}).openapi({
  ref: 'UserReportsResponse',
  description: 'List of user reports'
})

const ErrorSchema = z.object({
  error: z.object({
    code: z.string().openapi({ example: 'NOT_FOUND' }),
    message: z.string().openapi({ example: 'User not found' })
  })
}).openapi({
  ref: 'MeError',
  description: 'Error response'
})

meRouter.get(
  '/profile',
  describeRoute({
    description: 'Get current user profile (deprecated - use /api/auth/me instead)',
    summary: 'Get user profile',
    tags: ['Me (Deprecated)'],
    deprecated: true,
    responses: {
      200: {
        description: 'User profile retrieved successfully',
        content: {
          'application/json': {
            schema: resolver(UserProfileSchema)
          }
        }
      },
      404: {
        description: 'User not found',
        content: {
          'application/json': {
            schema: resolver(ErrorSchema)
          }
        }
      },
      500: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: resolver(ErrorSchema)
          }
        }
      }
    }
  }),
  async (c: Context) => {
    try {
      // TODO: Get user_id from JWT token
      const user_id = 1 // Placeholder
      
      const users = await sql`
        SELECT id, email, name, avatar_url, created_at
        FROM users
        WHERE id = ${user_id}
      `
      
      if (users.length === 0) {
        return c.json({ error: { code: 'NOT_FOUND', message: 'User not found' } }, 404)
      }
      
      return c.json(users[0])
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return c.json({ error: { code: 'FETCH_ERROR', message: 'Failed to fetch profile' } }, 500)
    }
  }
)

meRouter.get(
  '/reports',
  describeRoute({
    description: 'Get current user reports (deprecated - functionality available in /api/reports with auth)',
    summary: 'Get user reports',
    tags: ['Me (Deprecated)'],
    deprecated: true,
    responses: {
      200: {
        description: 'User reports retrieved successfully',
        content: {
          'application/json': {
            schema: resolver(UserReportsResponseSchema)
          }
        }
      },
      500: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: resolver(ErrorSchema)
          }
        }
      }
    }
  }),
  async (c: Context) => {
    try {
      // TODO: Get user_id from JWT token
      const user_id = 1 // Placeholder
      
      const reports = await sql`
        SELECT 
          id,
          image_url,
          category,
          street_name,
          location_text,
          lat,
          lon,
          created_at
        FROM reports
        WHERE user_id = ${user_id}
        ORDER BY created_at DESC
      `
      
      return c.json({ items: reports, total: reports.length })
    } catch (error) {
      console.error('Error fetching user reports:', error)
      return c.json({ error: { code: 'FETCH_ERROR', message: 'Failed to fetch reports' } }, 500)
    }
  }
)

export { meRouter } 