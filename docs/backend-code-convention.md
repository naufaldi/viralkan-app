# Backend Code Convention & Development Playbook

This document outlines the code conventions, patterns, and best practices for backend API development in our monorepo. It serves as a comprehensive guide for writing consistent, maintainable, and scalable backend code.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Feature Organization](#feature-organization)
3. [Route Definition](#route-definition)
4. [Schema Definition](#schema-definition)
5. [Business Logic](#business-logic)
6. [Error Handling](#error-handling)
7. [Authentication & Authorization](#authentication--authorization)
8. [Database Patterns](#database-patterns)
9. [Plugin System](#plugin-system)
10. [Testing](#testing)
11. [Code Style Guidelines](#code-style-guidelines)
12. [Documentation Standards](#documentation-standards)

## Project Structure

### Library Organization

```
libs/api/
├── features/           # Domain-specific features
├── plugins/           # Fastify plugins for cross-cutting concerns
├── error-handling/    # Error handling utilities and types
├── health-check/      # Health check implementations
├── database/          # Database configurations and types
├── util/              # Utility functions
└── tests/             # Shared test utilities
```

### Feature Structure

Each feature follows a consistent structure:

```
libs/api/features/{feature-name}/
├── src/
│   ├── index.ts       # Export all public APIs
│   └── lib/
│       ├── api.ts     # Route definitions
│       ├── shell.ts   # Business logic
│       └── core.ts    # Helper functions (optional)
├── project.json
├── tsconfig.json
└── README.md
```

## Feature Organization

### 1. API Layer (`api.ts`)

The API layer handles HTTP concerns and route definitions:

```typescript
import '@diamond/api/plugins';
import { sendResult } from '@diamond/api/error-handling';
import { FastifyPluginAsync } from 'fastify';

export const featureRoute: FastifyPluginAsync = async function (fastify): Promise<void> {
  fastify.post<{
    Body: Schema['operation']['body'];
    Reply: Schema['operation']['response'] | ErrorResponse;
  }>(
    `${Schema.operation.path}`,
    {
      preValidation: fastify.auth([fastify.asyncVerifyJWTandLevel]),
      config: { rateLimit: { max: 10, timeWindow: '10 minutes' } },
      schema: {
        description: 'Operation description',
        tags: ['feature'],
        summary: 'Operation Summary',
        security: [{ bearer: [] }],
        body: Schema.operation.body,
        response: addErrorSchemas({ 200: Schema.operation.response }),
      },
    },
    async function (request, reply) {
      const result = await shell.operation(fastify.db, request.body);
      sendResult(result, reply, 200);
    }
  );
};
```

### 2. Business Logic Layer (`shell.ts`)

The shell layer contains pure business logic:

```typescript
import { Database } from '@diamond/api/database';
import { AppResult } from '@diamond/api/error-handling';
import { R } from '@mobily/ts-belt';
import { Kysely } from 'kysely';

export async function operation(db: Kysely<Database>, payload: Schema['operation']['body']): Promise<AppResult<Schema['operation']['response']>> {
  try {
    // Business logic implementation
    const result = await db.selectFrom('table').where('condition', '=', payload.value).selectAll().executeTakeFirst();

    if (!result) {
      throw new NotFoundException('Resource not found');
    }

    return R.Ok(result);
  } catch (error) {
    return R.Error(toError(error));
  }
}
```

### 3. Core Layer (`core.ts`) - Optional

Helper functions and utilities specific to the feature:

```typescript
export const validateSomething = (value: string): boolean => {
  // Validation logic
  return true;
};

export const transformData = (input: unknown): ProcessedData => {
  // Data transformation logic
  return processedData;
};
```

## Route Definition

### Route Conventions

1. **Use TypeScript generics** for request/response typing
2. **Always define schemas** for validation and documentation
3. **Use consistent error handling** with `sendResult`
4. **Apply authentication** where required
5. **Configure rate limiting** for public endpoints

### Route Template

```typescript
fastify.method<{
  Params?: RouteParams;
  Querystring?: QueryParams;
  Body?: RequestBody;
  Reply: ResponseType | ErrorResponse;
}>(
  `${Schema.operation.path}`,
  {
    preValidation: [/* auth handlers */],
    preHandler: [/* custom handlers */],
    config: {
      rateLimit: false | { max: number, timeWindow: string }
    },
    schema: {
      description: 'Clear description of what this endpoint does',
      tags: ['feature-name'],
      summary: 'Brief summary',
      security: [{ bearer: [] }] | [], // Empty array for public endpoints
      params: Schema.operation.params,
      querystring: Schema.operation.querystring,
      body: Schema.operation.body,
      response: addErrorSchemas({ 200: Schema.operation.response }),
    },
  },
  async function (request, reply) {
    const result = await shell.operation(/* dependencies */, request.body);
    sendResult(result, reply, 200);
  }
);
```

### HTTP Methods & Status Codes

- **GET**: Retrieve data (200)
- **POST**: Create new resource (201) or perform action (200)
- **PUT**: Update entire resource (200)
- **PATCH**: Partial update (200)
- **DELETE**: Remove resource (204 or 200)

## Schema Definition

### Schema Structure

Use TypeBox for schema definitions in `libs/shared/schema/{feature}/`:

```typescript
import { Type } from '@sinclair/typebox';
import { RecursiveStatic } from '@diamond/shared/schema';

export const FeatureSchema = {
  path: '/feature',
  operation: {
    path: '/operation',
    body: Type.Object({
      field: Type.String({ minLength: 1, maxLength: 100 }),
      email: Type.String({ format: 'email' }),
      optional: Type.Optional(Type.String()),
      enum_field: Type.Union([Type.Literal('option1'), Type.Literal('option2')]),
    }),
    response: Type.Object({
      id: Type.String({ format: 'uuid' }),
      message: Type.String(),
      data: Type.Optional(Type.Unknown()),
    }),
  },
};

export type Feature = RecursiveStatic<typeof FeatureSchema>;
```

### Schema Best Practices

1. **Use descriptive property names**
2. **Add validation constraints** (minLength, maxLength, format)
3. **Use Optional for optional fields**
4. **Use Union types for enums**
5. **Include format validation** for emails, UUIDs, dates
6. **Group related schemas** in the same file

## Business Logic

### Function Structure

```typescript
export async function operationName(db: Kysely<Database>, additionalDeps: Dependencies, payload: InputType): Promise<AppResult<OutputType>> {
  try {
    // 1. Input validation (if not covered by schema)
    if (!payload.requiredField) {
      throw new BadRequestException('Required field is missing');
    }

    // 2. Authorization checks
    const hasPermission = await checkPermission(db, payload.userId);
    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    // 3. Business logic
    const result = await performOperation(db, payload);

    // 4. Return success result
    return R.Ok(result);
  } catch (error) {
    // 5. Error handling
    return R.Error(toError(error));
  }
}
```

### Best Practices

1. **Use early returns** for validation and error cases
2. **Separate concerns** - keep functions focused on single responsibility
3. **Use transactions** for multi-table operations
4. **Log important operations** with context
5. **Handle all error cases** explicitly
6. **Use typed database queries** with Kysely

## Error Handling

### Exception Hierarchy

Use predefined exception classes:

```typescript
import { BadRequestException, NotFoundException, UnauthorizedException, ForbiddenException, ConflictException, InternalServerErrorException, toError } from '@diamond/api/error-handling';

// Usage examples
throw new BadRequestException('Invalid input data');
throw new NotFoundException('User not found');
throw new UnauthorizedException('Invalid credentials');
throw new ForbiddenException('Access denied');
throw new ConflictException('Resource already exists');
```

### Error Response Pattern

```typescript
// Always use AppResult type
export type AppResult<T> = R.Result<T, ErrorResponse>;

// In business logic functions
const result = await someOperation();
if (!result) {
  return R.Error(toError(new NotFoundException('Resource not found')));
}
return R.Ok(result);

// In route handlers
const result = await shell.operation(db, request.body);
sendResult(result, reply, 200);
```

### Error Context

Provide meaningful error messages:

```typescript
// Good: Specific and actionable
throw new BadRequestException('Email format is invalid');
throw new NotFoundException('User with ID 12345 not found');

// Bad: Generic and unclear
throw new BadRequestException('Invalid data');
throw new NotFoundException('Not found');
```

## Authentication & Authorization

### Authentication Patterns

```typescript
// Public endpoint (no auth)
{
  schema: {
    security: [],
    // ...
  }
}

// Protected endpoint (requires JWT)
{
  preValidation: fastify.auth([fastify.asyncVerifyJWTandLevel]),
  schema: {
    security: [{ bearer: [] }],
    // ...
  }
}

// Webhook endpoint
{
  preValidation: fastify.auth([fastify.asyncVerifyWebhook]),
  // ...
}
```

### Authorization in Business Logic

```typescript
export async function updateUser(db: Kysely<Database>, currentUser: User, targetUserId: string, payload: UpdateUserPayload): Promise<AppResult<User>> {
  // Role-based authorization
  if (currentUser.role !== 'admin' && currentUser.id !== targetUserId) {
    throw new ForbiddenException('Can only update own profile');
  }

  // Resource-based authorization
  const targetUser = await db.selectFrom('users').where('id', '=', targetUserId).selectAll().executeTakeFirst();

  if (!targetUser) {
    throw new NotFoundException('User not found');
  }

  // Proceed with operation
  // ...
}
```

## Database Patterns

### Query Patterns

```typescript
// Single record
const user = await db.selectFrom('users').where('id', '=', userId).selectAll().executeTakeFirst();

// Multiple records with pagination
const users = await db
  .selectFrom('users')
  .where('status', '=', 'active')
  .orderBy('created_at', 'desc')
  .limit(pageSize)
  .offset(page * pageSize)
  .selectAll()
  .execute();

// Joins
const userWithProfile = await db.selectFrom('users').leftJoin('user_profiles', 'users.id', 'user_profiles.user_id').where('users.id', '=', userId).select(['users.id', 'users.email', 'user_profiles.first_name', 'user_profiles.last_name']).executeTakeFirst();

// Transactions
await db.transaction().execute(async (trx) => {
  await trx
    .updateTable('accounts')
    .set({ balance: sql`balance - ${amount}` })
    .where('id', '=', fromAccountId)
    .execute();

  await trx
    .updateTable('accounts')
    .set({ balance: sql`balance + ${amount}` })
    .where('id', '=', toAccountId)
    .execute();
});
```

### Database Best Practices

1. **Use transactions** for multi-table operations
2. **Use indexes** for frequently queried columns
3. **Use proper types** with Kysely type definitions
4. **Handle connection pooling** properly
5. **Use parameterized queries** to prevent SQL injection
6. **Log slow queries** for performance monitoring

## Plugin System

### Plugin Structure

```typescript
// Plugin definition
import { FastifyPluginAsync } from 'fastify';

export const myPlugin: FastifyPluginAsync<PluginOptions> = async function (fastify, options) {
  // Plugin initialization
  fastify.decorate('myService', new MyService(options));

  // Add hooks
  fastify.addHook('preHandler', async (request) => {
    // Pre-handler logic
  });
};

// Plugin registration in app.ts
await app.register(myPlugin, options);
```

### Common Plugin Patterns

1. **Service Registration**: Register services for dependency injection
2. **Middleware**: Add request/response processing
3. **Decorators**: Extend Fastify instance with utilities
4. **Hooks**: Add lifecycle event handlers

## Testing

### Test Structure

```typescript
// Feature test example
describe('Feature API', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/feature/operation', () => {
    it('should create resource successfully', async () => {
      const payload = {
        field: 'test value',
        email: 'test@example.com',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/feature/operation',
        headers: {
          authorization: 'Bearer valid-token',
        },
        payload,
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
        id: expect.any(String),
        message: 'Success',
      });
    });

    it('should return 400 for invalid input', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/feature/operation',
        payload: { invalid: 'data' },
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
```

### Testing Best Practices

1. **Test happy path and error cases**
2. **Use proper test data setup/teardown**
3. **Mock external dependencies**
4. **Test authentication and authorization**
5. **Use descriptive test names**
6. **Group related tests in describe blocks**

## Code Style Guidelines

### Naming Conventions

```typescript
// Constants: UPPER_SNAKE_CASE
const API_PREFIX = '/api/v1';
const MAX_RETRY_ATTEMPTS = 3;

// Functions: camelCase with descriptive verbs
const getUserById = (id: string) => {
  /* */
};
const validateEmailFormat = (email: string) => {
  /* */
};

// Types/Interfaces: PascalCase
interface UserProfile {
  firstName: string;
  lastName: string;
}

// Files: kebab-case
// user-profile.service.ts
// email-validator.ts
```

### Function Guidelines

```typescript
// Good: Descriptive function name and parameters
const updateUserProfile = async (db: Kysely<Database>, userId: string, profileData: UserProfileUpdate): Promise<AppResult<UserProfile>> => {
  // Implementation
};

// Good: Early returns for validation
const validateUser = (user: User): boolean => {
  if (!user) return false;
  if (!user.email) return false;
  if (user.status !== 'active') return false;

  return true;
};

// Good: Single responsibility
const formatUserName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`.trim();
};
```

### Import Organization

```typescript
// 1. Node.js built-ins
import { randomUUID } from 'node:crypto';

// 2. External libraries
import { FastifyPluginAsync } from 'fastify';
import { R } from '@mobily/ts-belt';

// 3. Internal libraries (domain order)
import { Database } from '@diamond/api/database';
import { sendResult } from '@diamond/api/error-handling';
import { User } from '@diamond/api/plugins';

// 4. Shared schemas
import { UserSchema } from '@diamond/shared/schema/user';

// 5. Relative imports
import { validateUser } from './core';
import * as shell from './shell';
```

## Documentation Standards

### API Documentation

Use Swagger/OpenAPI standards in route schemas:

```typescript
{
  schema: {
    description: 'Creates a new user account with the provided information',
    tags: ['user'],
    summary: 'Create User Account',
    security: [{ bearer: [] }],
    body: UserSchema.create.body,
    response: addErrorSchemas({
      201: UserSchema.create.response,
    }),
  },
}
```

### Code Comments

```typescript
// Good: Explain complex business logic
const calculateDiscount = (price: number, userTier: string): number => {
  // Premium users get 20% discount, regular users get 10%
  const discountRate = userTier === 'premium' ? 0.2 : 0.1;
  return price * discountRate;
};

// Good: Document important side effects
const processPayment = async (orderId: string): Promise<void> => {
  // This will also trigger email notification to the user
  await paymentService.charge(orderId);
};

// Avoid: Obvious comments
const getUserId = (user: User): string => {
  // Returns the user ID
  return user.id;
};
```

### README Documentation

Each feature should have a README.md with:

1. **Purpose**: What the feature does
2. **API Endpoints**: List of available endpoints
3. **Dependencies**: External services or libraries used
4. **Configuration**: Environment variables or settings
5. **Examples**: Usage examples

## Checklist for New Features

- [ ] Feature follows the standard directory structure
- [ ] Routes are properly typed with TypeScript generics
- [ ] Schemas are defined using TypeBox
- [ ] Business logic is separated into shell functions
- [ ] Error handling uses AppResult pattern
- [ ] Authentication/authorization is properly implemented
- [ ] Rate limiting is configured for public endpoints
- [ ] Database queries use Kysely with proper typing
- [ ] Unit tests cover happy path and error cases
- [ ] API documentation is complete
- [ ] README is updated with new endpoints
- [ ] Code follows naming conventions
- [ ] Imports are properly organized

---

This playbook should be updated as new patterns and best practices emerge. Always refer to existing code for examples and maintain consistency across the codebase.
