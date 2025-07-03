import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Context, Next } from 'hono';
import { describeRoute } from 'hono-openapi';
import { resolver, validator as zValidator } from 'hono-openapi/zod';
import { z } from 'zod';

import { firebaseAuthMiddleware } from '../../middleware/auth';
import { 
  CreateReportSchema, 
  ReportQuerySchema, 
  ReportParamsSchema,
  ReportResponseSchema,
  ReportWithUserResponseSchema,
  PaginatedReportsResponseSchema,
  ErrorResponseSchema
} from './types';
import * as shell from './shell';

interface AuthContext extends Context {
  get: (key: 'user_id') => number
  set: (key: 'user_id', value: number) => void
}

// Create router for reports
export const reportsRouter = new Hono();

// Global middleware for all routes
reportsRouter.use('*', cors({
  origin: ['http://localhost:3000', 'https://viralkan.com'],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// GET /reports - Get all reports with pagination
reportsRouter.get(
  '/',
  describeRoute({
    description: 'Get all reports with pagination and filtering',
    summary: 'List all road damage reports',
    tags: ['Reports'],
    responses: {
      200: {
        description: 'Successfully retrieved paginated reports',
        content: {
          'application/json': {
            schema: resolver(PaginatedReportsResponseSchema)
          }
        }
      },
      400: {
        description: 'Invalid query parameters',
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
  zValidator('query', ReportQuerySchema),
  async (c) => {
    try {
      const queryData = c.req.valid('query');
      const result = await shell.getReportsWithPagination(queryData);

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
  }
);

// GET /reports/enriched - Get reports with enriched data
reportsRouter.get(
  '/enriched',
  describeRoute({
    description: 'Get reports with enriched user data',
    summary: 'List reports with additional user information',
    tags: ['Reports'],
    responses: {
      200: {
        description: 'Successfully retrieved enriched reports',
        content: {
          'application/json': {
            schema: resolver(PaginatedReportsResponseSchema)
          }
        }
      },
      400: {
        description: 'Invalid query parameters',
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
  zValidator('query', ReportQuerySchema),
  async (c) => {
    try {
      const queryData = c.req.valid('query');
      const result = await shell.getReportsWithEnrichedData(queryData);

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
  }
);

// GET /reports/:id - Get specific report by ID
reportsRouter.get(
  '/:id',
  describeRoute({
    description: 'Get a specific report by its ID',
    summary: 'Get report details',
    tags: ['Reports'],
    responses: {
      200: {
        description: 'Successfully retrieved report',
        content: {
          'application/json': {
            schema: resolver(ReportWithUserResponseSchema)
          }
        }
      },
      400: {
        description: 'Invalid report ID',
        content: {
          'application/json': {
            schema: resolver(ErrorResponseSchema)
          }
        }
      },
      404: {
        description: 'Report not found',
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
  zValidator('param', ReportParamsSchema),
  async (c) => {
    try {
      const paramData = c.req.valid('param');
      const result = await shell.getReportById(paramData);

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
  }
);

// POST /reports - Create new report (requires authentication)
reportsRouter.post(
  '/',
  describeRoute({
    description: 'Create a new road damage report',
    summary: 'Create new report',
    tags: ['Reports'],
    security: [{ bearerAuth: [] }],
    responses: {
      201: {
        description: 'Report created successfully',
        content: {
          'application/json': {
            schema: resolver(ReportResponseSchema)
          }
        }
      },
      400: {
        description: 'Invalid request data',
        content: {
          'application/json': {
            schema: resolver(ErrorResponseSchema)
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
  firebaseAuthMiddleware,
  zValidator('json', CreateReportSchema),
  async (c: AuthContext) => {
    try {
      const userId = c.get('user_id');
      
      if (!userId) {
        return c.json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
            timestamp: new Date().toISOString()
          }
        }, 401);
      }

      const reportData = c.req.valid('json');
      const result = await shell.createNewReport(userId, reportData);

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
  }
);

// PUT /reports/:id - Update existing report (requires authentication and ownership)
reportsRouter.put(
  '/:id',
  describeRoute({
    description: 'Update an existing report (requires ownership)',
    summary: 'Update report',
    tags: ['Reports'],
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'Report updated successfully',
        content: {
          'application/json': {
            schema: resolver(ReportResponseSchema)
          }
        }
      },
      400: {
        description: 'Invalid request data',
        content: {
          'application/json': {
            schema: resolver(ErrorResponseSchema)
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
      403: {
        description: 'Access forbidden - not the owner',
        content: {
          'application/json': {
            schema: resolver(ErrorResponseSchema)
          }
        }
      },
      404: {
        description: 'Report not found',
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
  firebaseAuthMiddleware,
  zValidator('param', ReportParamsSchema),
  zValidator('json', CreateReportSchema.partial()),
  async (c) => {
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

      const paramData = c.req.valid('param');
      const updateData = c.req.valid('json');
      const result = await shell.updateExistingReport(paramData.id, userId, updateData);

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
  }
);

// DELETE /reports/:id - Delete report (requires authentication and ownership)
reportsRouter.delete(
  '/:id',
  describeRoute({
    description: 'Delete a report (requires ownership)',
    summary: 'Delete report',
    tags: ['Reports'],
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'Report deleted successfully',
        content: {
          'application/json': {
            schema: resolver(z.object({
              success: z.boolean().openapi({ example: true })
            }))
          }
        }
      },
      400: {
        description: 'Invalid report ID',
        content: {
          'application/json': {
            schema: resolver(ErrorResponseSchema)
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
      403: {
        description: 'Access forbidden - not the owner',
        content: {
          'application/json': {
            schema: resolver(ErrorResponseSchema)
          }
        }
      },
      404: {
        description: 'Report not found',
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
  firebaseAuthMiddleware,
  zValidator('param', ReportParamsSchema),
  async (c) => {
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

      const paramData = c.req.valid('param');
      const result = await shell.deleteExistingReport(paramData.id, userId);

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
  }
);

// GET /reports/me - Get current user's reports (requires authentication)
reportsRouter.get(
  '/me',
  describeRoute({
    description: 'Get reports created by the authenticated user',
    summary: 'Get my reports',
    tags: ['Reports'],
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'Successfully retrieved user reports',
        content: {
          'application/json': {
            schema: resolver(PaginatedReportsResponseSchema)
          }
        }
      },
      400: {
        description: 'Invalid query parameters',
        content: {
          'application/json': {
            schema: resolver(ErrorResponseSchema)
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
  firebaseAuthMiddleware,
  zValidator('query', ReportQuerySchema.pick({ page: true, limit: true, category: true })),
  async (c) => {
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

      const queryData = c.req.valid('query');
      const result = await shell.getUserReports(userId, queryData);

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
  }
);

// GET /reports/:id/ownership - Validate report ownership (requires authentication)
reportsRouter.get(
  '/:id/ownership',
  describeRoute({
    description: 'Check if the authenticated user owns the specified report',
    summary: 'Validate report ownership',
    tags: ['Reports'],
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'Ownership validation successful',
        content: {
          'application/json': {
            schema: resolver(z.object({
              canEdit: z.boolean().openapi({ example: true }),
              report: ReportResponseSchema
            }))
          }
        }
      },
      400: {
        description: 'Invalid report ID',
        content: {
          'application/json': {
            schema: resolver(ErrorResponseSchema)
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
      403: {
        description: 'Access forbidden - not the owner',
        content: {
          'application/json': {
            schema: resolver(ErrorResponseSchema)
          }
        }
      },
      404: {
        description: 'Report not found',
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
  firebaseAuthMiddleware,
  zValidator('param', ReportParamsSchema),
  async (c) => {
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

      const paramData = c.req.valid('param');
      const result = await shell.validateReportOwnership(paramData.id, userId);

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
  }
); 