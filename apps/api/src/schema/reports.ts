import { z } from 'zod';
import 'zod-openapi/extend';


// Zod Schemas for Validation with OpenAPI metadata
export const CreateReportSchema = z.object({
  image_url: z.string().url('Invalid image URL format').openapi({ 
    example: 'https://example.com/image.jpg',
    description: 'URL of the uploaded report image'
  }),
  category: z.enum(['berlubang', 'retak', 'lainnya'], {
    errorMap: () => ({ message: 'Category must be berlubang, retak, or lainnya' })
  }).openapi({
    example: 'berlubang',
    description: 'Type of road damage reported'
  }),
  street_name: z.string().min(1, 'Street name is required').max(255, 'Street name too long').openapi({
    example: 'Jalan Sudirman',
    description: 'Name of the street where damage was reported'
  }),
  location_text: z.string().min(1, 'Location text is required').max(500, 'Location text too long').openapi({
    example: 'Depan Mall Tunjungan Plaza, sebelah kiri arah Surabaya',
    description: 'Detailed description of the damage location'
  }),
  lat: z.number().min(-90).max(90).optional().openapi({
    example: -7.257472,
    description: 'Latitude coordinate of the damage location'
  }),
  lon: z.number().min(-180).max(180).optional().openapi({
    example: 112.752088,
    description: 'Longitude coordinate of the damage location'
  })
}).openapi({
  ref: 'CreateReportRequest',
  description: 'Data required to create a new road damage report'
});

export const ReportQuerySchema = z.object({
  page: z.string().optional().default('1').transform(val => Math.max(1, parseInt(val) || 1)).openapi({
    example: '1',
    description: 'Page number for pagination (starts from 1)'
  }),
  limit: z.string().optional().default('20').transform(val => Math.min(100, Math.max(1, parseInt(val) || 20))).openapi({
    example: '20',
    description: 'Number of reports per page (max 100)'
  }),
  category: z.enum(['berlubang', 'retak', 'lainnya']).optional().openapi({
    example: 'berlubang',
    description: 'Filter reports by damage category'
  }),
  user_id: z.string().optional().openapi({
    example: '123',
    description: 'Filter reports by user ID'
  })
}).openapi({
  ref: 'ReportQuery',
  description: 'Query parameters for filtering and paginating reports'
});

export const ReportParamsSchema = z.object({
  id: z.string().transform(val => {
    const id = parseInt(val);
    if (isNaN(id) || id <= 0) {
      throw new Error('Invalid report ID');
    }
    return id;
  }).openapi({
    example: '123',
    description: 'Unique identifier of the report'
  })
}).openapi({
  ref: 'ReportParams',
  description: 'Path parameters for report operations'
});

// Response Schemas
export const ReportResponseSchema = z.object({
  id: z.number().openapi({ example: 123 }),
  user_id: z.number().openapi({ example: 456 }),
  image_url: z.string().url().openapi({ example: 'https://example.com/image.jpg' }),
  category: z.enum(['berlubang', 'retak', 'lainnya']).openapi({ example: 'berlubang' }),
  street_name: z.string().openapi({ example: 'Jalan Sudirman' }),
  location_text: z.string().openapi({ example: 'Depan Mall Tunjungan Plaza' }),
  lat: z.number().nullable().openapi({ example: -7.257472 }),
  lon: z.number().nullable().openapi({ example: 112.752088 }),
  created_at: z.string().datetime().openapi({ example: '2024-01-15T10:30:00Z' })
}).openapi({
  ref: 'Report',
  description: 'Road damage report data'
});

export const ReportWithUserResponseSchema = ReportResponseSchema.extend({
  user_name: z.string().nullable().openapi({ example: 'John Doe' }),
  user_avatar: z.string().nullable().openapi({ example: 'https://example.com/avatar.jpg' })
}).openapi({
  ref: 'ReportWithUser',
  description: 'Road damage report data with user information'
});

export const PaginatedReportsResponseSchema = z.object({
  items: z.array(ReportWithUserResponseSchema),
  total: z.number().openapi({ example: 150 }),
  page: z.number().openapi({ example: 1 }),
  limit: z.number().openapi({ example: 20 }),
  pages: z.number().openapi({ example: 8 })
}).openapi({
  ref: 'PaginatedReports',
  description: 'Paginated list of reports with metadata'
});

export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.string().openapi({ example: 'VALIDATION_ERROR' }),
    message: z.string().openapi({ example: 'Invalid request data' }),
    details: z.any().optional(),
    timestamp: z.string().datetime().openapi({ example: '2024-01-15T10:30:00Z' })
  })
}).openapi({
  ref: 'ErrorResponse',
  description: 'Standard error response format'
});