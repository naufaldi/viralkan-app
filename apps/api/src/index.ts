import { OpenAPIHono } from '@hono/zod-openapi';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import { swaggerUI } from '@hono/swagger-ui';
import {
  reportsRouter,
  authRouter,
  uploadRouter,
  administrativeRouter,
  sharingRouter,
} from '@/routes';
import { adminRouter } from '@/routes/admin/api';
import { env, validateEnv } from '@/config/env';
import { testConnection } from '@/db/connection';
import { initializeFirebase } from '@/config/firebase';

const app = new OpenAPIHono();

// Validate environment variables
validateEnv();

// Initialize Firebase Admin SDK
try {
  initializeFirebase();
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
  if (env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

app.use('*', logger());
app.use(
  '*',
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000', // Backup port for frontend
      'https://viralkan.app',
      'https://www.viralkan.app',
    ],
    credentials: true,
  })
);

app.get('/', (c) => {
  return c.json({
    message: 'Viralkan API v1',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    documentation: '/docs',
  });
});

app.get('/health', async (c) => {
  const dbConnected = await testConnection();
  return c.json({
    status: dbConnected ? 'healthy' : 'unhealthy',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.route('/api/reports', reportsRouter);
app.route('/api/auth', authRouter);
app.route('/api/upload', uploadRouter);
app.route('/api/admin', adminRouter);
app.route('/api/administrative', administrativeRouter);
app.route('/api/sharing', sharingRouter);

// Configure OpenAPI documentation
app.openAPIRegistry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: 'Firebase JWT token for authentication',
});

app.doc('/openapi', {
  openapi: '3.0.0',
  info: {
    title: 'Viralkan API',
    version: '1.0.0',
    description:
      'API for reporting road damage and infrastructure issues in Indonesia',
    contact: {
      name: 'Viralkan Team',
      url: 'https://viralkan.app',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url:
        env.NODE_ENV === 'production'
          ? 'https://api.viralkan.app'
          : `http://localhost:${env.PORT}`,
      description:
        env.NODE_ENV === 'production'
          ? 'Production server'
          : 'Development server',
    },
  ],
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: [
    {
      name: 'Reports',
      description: 'Road damage and infrastructure issue reports',
    },
    {
      name: 'Auth',
      description: 'Authentication and user management',
    },
    {
      name: 'Upload',
      description: 'Image upload and file management',
    },
    {
      name: 'Admin',
      description: 'Admin operations for report verification and management',
    },
    {
      name: 'Administrative',
      description:
        'Indonesian administrative data (provinces, regencies, districts)',
    },
    {
      name: 'Sharing',
      description: 'Social media sharing functionality and analytics',
    },
    {
      name: 'Analytics',
      description: 'Sharing analytics and statistics',
    },
  ],
});

// Swagger UI Documentation
app.get(
  '/docs',
  swaggerUI({
    url: '/openapi',
    defaultModelsExpandDepth: -1, // Hide the schemas section completely
  })
);

app.notFound((c) => {
  return c.json(
    { error: { code: 'NOT_FOUND', message: 'Endpoint not found' } },
    404
  );
});

app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      },
    },
    500
  );
});

console.log(`🚀 Viralkan API starting on port ${env.PORT}`);
console.log(
  `📚 API Documentation available at http://localhost:${env.PORT}/docs`
);
console.log(`📄 OpenAPI Specification at http://localhost:${env.PORT}/openapi`);

serve({
  fetch: app.fetch,
  port: env.PORT,
});
