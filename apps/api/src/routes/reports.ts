import { Hono } from 'hono'
import type { Context } from 'hono'
import { z } from 'zod'
import { sql } from '@/db/connection'

const reportsRouter = new Hono()

const createReportSchema = z.object({
  image_url: z.string().url(),
  category: z.enum(['berlubang', 'retak', 'lainnya']),
  street_name: z.string().min(1),
  location_text: z.string().min(1),
  lat: z.number().optional(),
  lon: z.number().optional()
})

const querySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  category: z.enum(['berlubang', 'retak', 'lainnya']).optional()
})

reportsRouter.get('/', async (c: Context) => {
  try {
    const query = querySchema.parse(c.req.query())
    const page = Math.max(1, parseInt(query.page))
    const limit = Math.min(100, Math.max(1, parseInt(query.limit)))
    const offset = (page - 1) * limit

    let whereClause = ''
    const params: any[] = [limit, offset]
    
    if (query.category) {
      whereClause = 'WHERE category = $3'
      params.push(query.category)
    }

    const reportsQuery = sql`
      SELECT 
        r.id,
        r.image_url,
        r.category,
        r.street_name,
        r.location_text,
        r.lat,
        r.lon,
        r.created_at,
        u.name as user_name,
        u.avatar_url as user_avatar
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.id
      ${whereClause ? sql.unsafe(whereClause) : sql``}
      ORDER BY r.created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `

    const countQuery = sql`
      SELECT COUNT(*) as total
      FROM reports
      ${whereClause ? sql.unsafe(whereClause.replace('$3', '$1')) : sql``}
    `

    const [reports, countResult] = await Promise.all([
      reportsQuery,
      countQuery
    ])

    const total = Number(countResult[0]?.total || 0)

    return c.json({
      items: reports,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return c.json({ error: { code: 'FETCH_ERROR', message: 'Failed to fetch reports' } }, 500)
  }
})

reportsRouter.get('/:id', async (c: Context) => {
  try {
    const id = parseInt(c.req.param('id'))
    
    if (isNaN(id)) {
      return c.json({ error: { code: 'INVALID_ID', message: 'Invalid report ID' } }, 400)
    }

    const reports = await sql`
      SELECT 
        r.id,
        r.image_url,
        r.category,
        r.street_name,
        r.location_text,
        r.lat,
        r.lon,
        r.created_at,
        u.name as user_name,
        u.avatar_url as user_avatar
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.id = ${id}
    `

    if (reports.length === 0) {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Report not found' } }, 404)
    }

    return c.json(reports[0])
  } catch (error) {
    console.error('Error fetching report:', error)
    return c.json({ error: { code: 'FETCH_ERROR', message: 'Failed to fetch report' } }, 500)
  }
})

reportsRouter.post('/', async (c: Context) => {
  try {
    const body = await c.req.json()
    const data = createReportSchema.parse(body)
    
    // TODO: Get user_id from JWT token in middleware
    const user_id = 1 // Placeholder for now

    const result = await sql`
      INSERT INTO reports (user_id, image_url, category, street_name, location_text, lat, lon)
      VALUES (${user_id}, ${data.image_url}, ${data.category}, ${data.street_name}, ${data.location_text}, ${data.lat || null}, ${data.lon || null})
      RETURNING id
    `

    return c.json({ id: result[0].id }, 201)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ 
        error: { 
          code: 'VALIDATION_ERROR', 
          message: 'Invalid request data',
          details: error.errors
        } 
      }, 400)
    }
    
    console.error('Error creating report:', error)
    return c.json({ error: { code: 'CREATE_ERROR', message: 'Failed to create report' } }, 500)
  }
})

export { reportsRouter } 