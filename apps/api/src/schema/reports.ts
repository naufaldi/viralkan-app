import { z } from 'zod';


// Zod Schemas for Validation (specific to reports)
export const CreateReportSchema = z.object({
  image_url: z.string().url('Invalid image URL format'),
  category: z.enum(['berlubang', 'retak', 'lainnya'], {
    errorMap: () => ({ message: 'Category must be berlubang, retak, or lainnya' })
  }),
  street_name: z.string().min(1, 'Street name is required').max(255, 'Street name too long'),
  location_text: z.string().min(1, 'Location text is required').max(500, 'Location text too long'),
  lat: z.number().min(-90).max(90).optional(),
  lon: z.number().min(-180).max(180).optional()
});

export const ReportQuerySchema = z.object({
  page: z.string().optional().default('1').transform(val => Math.max(1, parseInt(val) || 1)),
  limit: z.string().optional().default('20').transform(val => Math.min(100, Math.max(1, parseInt(val) || 20))),
  category: z.enum(['berlubang', 'retak', 'lainnya']).optional(),
  user_id: z.string().optional()
});

export const ReportParamsSchema = z.object({
  id: z.string().transform(val => {
    const id = parseInt(val);
    if (isNaN(id) || id <= 0) {
      throw new Error('Invalid report ID');
    }
    return id;
  })
});