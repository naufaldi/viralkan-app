import { OpenAPIHono } from '@hono/zod-openapi';

const app = new OpenAPIHono();

// Test what doc() accepts
try {
  app.doc('/test', {
    openapi: '3.0.0',
    info: {
      title: 'Test API',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
        },
      },
    },
  });
  console.log('Components are supported!');
} catch (error) {
  console.error('Error with components:', error);
}

console.log('OpenAPIHono methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(app)).filter(name => name !== 'constructor'));