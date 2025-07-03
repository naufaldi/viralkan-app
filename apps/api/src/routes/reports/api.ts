import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Context } from 'hono';
import { z } from 'zod';

import { firebaseAuthMiddleware } from '../../middleware/auth';
import { 
  CreateReportSchema, 
  ReportQuerySchema, 
  ReportParamsSchema,
} from './types';
import * as shell from './shell';
import { AppError } from '@/types';

// Create router for reports
export const reportsRouter = new Hono();

// Global middleware for all routes
reportsRouter.use('*', cors({
  origin: ['http://localhost:3000', 'https://viralkan.com'], // Add your frontend domains
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Global error handler middleware
reportsRouter.onError((err, c) => {
  console.error('API Error:', err);

  if (err instanceof AppError) {
    return c.json({
      error: {
        code: err.name.toUpperCase(),
        message: err.message,
        timestamp: new Date().toISOString()
      }
    }, err.statusCode);
  }

  if (err instanceof z.ZodError) {
    return c.json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: err.errors,
        timestamp: new Date().toISOString()
      }
    }, 400);
  }

  return c.json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString()
    }
  }, 500);
});

// GET /reports - Get all reports with pagination
reportsRouter.get('/', async (c: Context) => {
  try {
    const queryParams = c.req.query();
    const queryValidation = ReportQuerySchema.safeParse(queryParams);
    
    if (!queryValidation.success) {
      return c.json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details: queryValidation.error.errors,
          timestamp: new Date().toISOString()
        }
      }, 400);
    }

    const result = await shell.getReportsWithPagination(queryValidation.data);

    if (result.success) {
      return c.json(result.data);
    }

    return c.json({
      error: {
        code: 'FETCH_ERROR',
        message: result.error,
        timestamp: new Date().toISOString()
      }
    }, result.statusCode as any);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return c.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch reports',
        timestamp: new Date().toISOString()
      }
    }, 500);
  }
});

// GET /reports/enriched - Get reports with enriched data
reportsRouter.get('/enriched', async (c: Context) => {
  try {
    const queryParams = c.req.query();
    const queryValidation = ReportQuerySchema.safeParse(queryParams);
    
    if (!queryValidation.success) {
      return c.json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details: queryValidation.error.errors,
          timestamp: new Date().toISOString()
        }
      }, 400);
    }

    const result = await shell.getReportsWithEnrichedData(queryValidation.data);

    if (result.success) {
      return c.json(result.data);
    }

    return c.json({
      error: {
        code: 'FETCH_ERROR',
        message: result.error,
        timestamp: new Date().toISOString()
      }
    }, result.statusCode as any);
  } catch (error) {
    console.error('Error fetching enriched reports:', error);
    return c.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch enriched reports',
        timestamp: new Date().toISOString()
      }
    }, 500);
  }
});

// GET /reports/:id - Get specific report by ID
reportsRouter.get('/:id', async (c: Context) => {
  try {
    const paramValidation = ReportParamsSchema.safeParse({ id: c.req.param('id') });
    
    if (!paramValidation.success) {
      return c.json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid report ID',
          details: paramValidation.error.errors,
          timestamp: new Date().toISOString()
        }
      }, 400);
    }

    const result = await shell.getReportById(paramValidation.data);

    if (result.success) {
      return c.json(result.data);
    }

    return c.json({
      error: {
        code: result.statusCode === 404 ? 'NOT_FOUND' : 'FETCH_ERROR',
        message: result.error,
        timestamp: new Date().toISOString()
      }
    }, result.statusCode as any);
  } catch (error) {
    console.error('Error fetching report:', error);
    return c.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch report',
        timestamp: new Date().toISOString()
      }
    }, 500);
  }
});

// POST /reports - Create new report (requires authentication)
reportsRouter.post('/', firebaseAuthMiddleware, async (c: Context) => {
  try {
    const userId = c.get('user_id') as number;
    
    if (!userId) {
      return c.json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
          timestamp: new Date().toISOString()
        }
      }, 401);
    }

    const body = await c.req.json();
    const dataValidation = CreateReportSchema.safeParse(body);
    
    if (!dataValidation.success) {
      return c.json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid report data',
          details: dataValidation.error.errors,
          timestamp: new Date().toISOString()
        }
      }, 400);
    }

    const result = await shell.createNewReport(userId, dataValidation.data);

    if (result.success) {
      return c.json(result.data, 201);
    }

    return c.json({
      error: {
        code: 'CREATE_ERROR',
        message: result.error,
        timestamp: new Date().toISOString()
      }
    }, result.statusCode as any);
  } catch (error) {
    console.error('Error creating report:', error);
    return c.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create report',
        timestamp: new Date().toISOString()
      }
    }, 500);
  }
});

// PUT /reports/:id - Update existing report (requires authentication and ownership)
reportsRouter.put('/:id', firebaseAuthMiddleware, async (c: Context) => {
  try {
    const userId = c.get('user_id') as number;
    
    if (!userId) {
      return c.json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
          timestamp: new Date().toISOString()
        }
      }, 401);
    }

    const paramValidation = ReportParamsSchema.safeParse({ id: c.req.param('id') });
    
    if (!paramValidation.success) {
      return c.json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid report ID',
          details: paramValidation.error.errors,
          timestamp: new Date().toISOString()
        }
      }, 400);
    }

    const body = await c.req.json();
    const dataValidation = CreateReportSchema.partial().safeParse(body);
    
    if (!dataValidation.success) {
      return c.json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid update data',
          details: dataValidation.error.errors,
          timestamp: new Date().toISOString()
        }
      }, 400);
    }

    const result = await shell.updateExistingReport(paramValidation.data.id, userId, dataValidation.data);

    if (result.success) {
      return c.json(result.data);
    }

    return c.json({
      error: {
        code: result.statusCode === 403 ? 'FORBIDDEN' : 
              result.statusCode === 404 ? 'NOT_FOUND' : 'UPDATE_ERROR',
        message: result.error,
        timestamp: new Date().toISOString()
      }
    }, result.statusCode as any);
  } catch (error) {
    console.error('Error updating report:', error);
    return c.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update report',
        timestamp: new Date().toISOString()
      }
    }, 500);
  }
});

// DELETE /reports/:id - Delete report (requires authentication and ownership)
reportsRouter.delete('/:id', firebaseAuthMiddleware, async (c: Context) => {
  try {
    const userId = c.get('user_id') as number;
    
    if (!userId) {
      return c.json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
          timestamp: new Date().toISOString()
        }
      }, 401);
    }

    const paramValidation = ReportParamsSchema.safeParse({ id: c.req.param('id') });
    
    if (!paramValidation.success) {
      return c.json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid report ID',
          details: paramValidation.error.errors,
          timestamp: new Date().toISOString()
        }
      }, 400);
    }

    const result = await shell.deleteExistingReport(paramValidation.data.id, userId);

    if (result.success) {
      return c.json({ success: true }, 200);
    }

    return c.json({
      error: {
        code: result.statusCode === 403 ? 'FORBIDDEN' : 
              result.statusCode === 404 ? 'NOT_FOUND' : 'DELETE_ERROR',
        message: result.error,
        timestamp: new Date().toISOString()
      }
    }, result.statusCode as any);
  } catch (error) {
    console.error('Error deleting report:', error);
    return c.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete report',
        timestamp: new Date().toISOString()
      }
    }, 500);
  }
});

// GET /reports/me - Get current user's reports (requires authentication)
reportsRouter.get('/me', firebaseAuthMiddleware, async (c: Context) => {
  try {
    const userId = c.get('user_id') as number;
    
    if (!userId) {
      return c.json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
          timestamp: new Date().toISOString()
        }
      }, 401);
    }

    const queryParams = c.req.query();
    const queryValidation = ReportQuerySchema.pick({ page: true, limit: true, category: true }).safeParse(queryParams);
    
    if (!queryValidation.success) {
      return c.json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details: queryValidation.error.errors,
          timestamp: new Date().toISOString()
        }
      }, 400);
    }

    const result = await shell.getUserReports(userId, queryValidation.data);

    if (result.success) {
      return c.json(result.data);
    }

    return c.json({
      error: {
        code: 'FETCH_ERROR',
        message: result.error,
        timestamp: new Date().toISOString()
      }
    }, result.statusCode as any);
  } catch (error) {
    console.error('Error fetching user reports:', error);
    return c.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch user reports',
        timestamp: new Date().toISOString()
      }
    }, 500);
  }
});

// GET /reports/:id/ownership - Validate report ownership (requires authentication)
reportsRouter.get('/:id/ownership', firebaseAuthMiddleware, async (c: Context) => {
  try {
    const userId = c.get('user_id') as number;
    
    if (!userId) {
      return c.json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
          timestamp: new Date().toISOString()
        }
      }, 401);
    }

    const paramValidation = ReportParamsSchema.safeParse({ id: c.req.param('id') });
    
    if (!paramValidation.success) {
      return c.json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid report ID',
          details: paramValidation.error.errors,
          timestamp: new Date().toISOString()
        }
      }, 400);
    }

    const result = await shell.validateReportOwnership(paramValidation.data.id, userId);

    if (result.success) {
      return c.json({ canEdit: true, report: result.data });
    }

    return c.json({
      error: {
        code: result.statusCode === 403 ? 'FORBIDDEN' : 
              result.statusCode === 404 ? 'NOT_FOUND' : 'VALIDATION_ERROR',
        message: result.error,
        timestamp: new Date().toISOString()
      }
    }, result.statusCode as any);
  } catch (error) {
    console.error('Error validating report ownership:', error);
    return c.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to validate report ownership',
        timestamp: new Date().toISOString()
      }
    }, 500);
  }
}); 