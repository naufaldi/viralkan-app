import { Hono } from 'hono'
import type { Context } from 'hono'
import { sql } from '@/db/connection'

const meRouter = new Hono()

meRouter.get('/profile', async (c: Context) => {
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
})

meRouter.get('/reports', async (c: Context) => {
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
})

export { meRouter } 