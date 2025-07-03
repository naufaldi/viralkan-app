# Backend Code Development Guide for Hono

This document outlines the comprehensive code conventions, architectural patterns, and best practices for backend API development using Hono framework. It combines clean architecture principles with practical implementation guidelines for writing maintainable, scalable, and testable backend code.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Layer Responsibilities](#layer-responsibilities)
4. [Implementation Patterns](#implementation-patterns)
5. [Route Definition](#route-definition)
6. [Schema Definition & Validation](#schema-definition--validation)
7. [Error Handling](#error-handling)
8. [Authentication & Authorization](#authentication--authorization)
9. [Database Patterns](#database-patterns)
10. [Middleware System](#middleware-system)
11. [Testing Strategy](#testing-strategy)
12. [Code Style Guidelines](#code-style-guidelines)
13. [Documentation Standards](#documentation-standards)

## Architecture Overview

We follow a **4-Layer Clean Architecture** pattern that ensures separation of concerns and maintainability:

```
┌─────────────────────────────────────┐
│            API Layer                │  ← HTTP concerns, routing, validation
├─────────────────────────────────────┤
│           Shell Layer               │  ← Business logic orchestration
├─────────────────────────────────────┤
│            Core Layer               │  ← Pure business logic, domain rules
├─────────────────────────────────────┤
│            Data Layer               │  ← Database operations, external APIs
└─────────────────────────────────────┘
```

**Dependency Direction**: `API → Shell → Core ← Data`

This architecture ensures:
- **Testability**: Each layer can be tested independently
- **Maintainability**: Clear separation of concerns
- **Scalability**: Easy to extend and modify
- **Reusability**: Core business logic is framework-agnostic

## Project Structure

### Feature Organization

```
apps/api/src/
├── features/              # Domain-specific features
│   └── {feature-name}/
│       ├── index.ts       # Public exports
│       ├── api.ts         # HTTP routes and handlers
│       ├── shell.ts       # Business logic orchestration
│       ├── core.ts        # Pure business logic
│       ├── data.ts        # Database operations
│       └── types.ts       # Feature-specific types
├── middleware/            # Shared middleware
├── config/               # Configuration files
├── db/                   # Database setup and migrations
└── index.ts              # Application entry point
```

### Feature Structure Example

```
apps/api/src/features/auth/
├── index.ts              # Export { authRoutes, authTypes }
├── api.ts                # Hono route definitions
├── shell.ts              # Business logic (login, register, etc.)
├── core.ts               # Auth utilities (password hashing, etc.)
├── data.ts               # Database queries for auth
└── types.ts              # Auth-specific types and schemas
```

## Layer Responsibilities

### 1. API Layer (`api.ts`)

**Purpose**: Handle HTTP requests, responses, and routing with Hono

**Responsibilities**:
- Route definitions and HTTP method handlers
- Request/response validation using Zod
- Authentication/authorization middleware
- Rate limiting configuration
- Error response formatting
- OpenAPI documentation

**Should NOT**:
- Contain business logic
- Directly access database
- Perform complex data transformations

```typescript
// api.ts - Hono route definitions
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { authMiddleware } from '../middleware/auth';
import { rateLimitMiddleware } from '../middleware/rate-limit';
import * as shell from './shell';
import { CreateUserSchema, UserResponseSchema } from './types';

export const userRoutes = new Hono()
  .post(
    '/users',
    rateLimitMiddleware({ max: 10, window: '10m' }),
    zValidator('json', CreateUserSchema),
    async (c) => {
      const userData = c.req.valid('json');
      const result = await shell.createUser(c.env.DB, userData);
      
      if (result.success) {
        return c.json(result.data, 201);
      }
      return c.json({ error: result.error }, result.statusCode);
    }
  )
  .get(
    '/users/:id',
    authMiddleware(),
    zValidator('param', z.object({ id: z.string().uuid() })),
    async (c) => {
      const { id } = c.req.valid('param');
      const user = c.get('user');
      
      const result = await shell.getUserById(c.env.DB, id, user);
      
      if (result.success) {
        return c.json(result.data);
      }
      return c.json({ error: result.error }, result.statusCode);
    }
  );
```

### 2. Shell Layer (`shell.ts`)

**Purpose**: Orchestrate business workflows and coordinate between layers

**Responsibilities**:
- Business logic orchestration
- Transaction management
- Input validation and sanitization
- Error handling and result formatting
- Coordinate between core and data layers
- Handle external service integration

**Should NOT**:
- Handle HTTP concerns
- Contain pure business logic (delegate to core)
- Write direct SQL queries

```typescript
// shell.ts - Business logic orchestration
import { AppResult, createSuccess, createError } from '../types/result';
import * as core from './core';
import * as data from './data';
import { Database } from '../types/database';

export const createUser = async (
  db: Database,
  userData: CreateUserRequest
): Promise<AppResult<User>> => {
  try {
    // Validation using core business rules
    if (!core.isValidEmail(userData.email)) {
      return createError('Invalid email format', 400);
    }

    if (!core.isValidPassword(userData.password)) {
      return createError('Password does not meet requirements', 400);
    }

    // Check business constraints
    const existingUser = await data.findUserByEmail(db, userData.email);
    if (existingUser) {
      return createError('User already exists', 409);
    }

    // Orchestrate user creation
    return await db.transaction(async (trx) => {
      const hashedPassword = await core.hashPassword(userData.password);
      const user = await data.createUser(trx, {
        ...userData,
        password: hashedPassword,
      });

      // Create user profile
      await data.createUserProfile(trx, user.id, userData.profile);

      // Send welcome email (external service)
      if (process.env.ENABLE_NOTIFICATIONS === 'true') {
        await sendWelcomeEmail(user.email);
      }

      return createSuccess(user);
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return createError('Failed to create user', 500);
  }
};

export const getUserById = async (
  db: Database,
  userId: string,
  currentUser: User
): Promise<AppResult<User>> => {
  try {
    // Authorization check
    if (!core.canAccessUser(currentUser, userId)) {
      return createError('Access denied', 403);
    }

    const user = await data.findUserById(db, userId);
    if (!user) {
      return createError('User not found', 404);
    }

    // Apply business rules for data exposure
    const sanitizedUser = core.sanitizeUserData(user, currentUser);
    return createSuccess(sanitizedUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    return createError('Failed to fetch user', 500);
  }
};
```

### 3. Core Layer (`core.ts`)

**Purpose**: Pure business logic and domain rules

**Responsibilities**:
- Business rule validation
- Data transformations and calculations
- Domain-specific utilities
- Pure functions (no side effects)
- Business logic that's framework-agnostic

**Should NOT**:
- Access database or external services
- Handle HTTP requests/responses
- Have side effects or dependencies

```typescript
// core.ts - Pure business logic
import bcrypt from 'bcrypt';
import { User, UserRole } from './types';

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const canAccessUser = (currentUser: User, targetUserId: string): boolean => {
  // Users can access their own data
  if (currentUser.id === targetUserId) {
    return true;
  }
  
  // Admins can access any user
  if (currentUser.role === UserRole.ADMIN) {
    return true;
  }
  
  return false;
};

export const sanitizeUserData = (user: User, requestingUser: User): Partial<User> => {
  const baseData = {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  };

  // Return sensitive data only to the user themselves or admins
  if (user.id === requestingUser.id || requestingUser.role === UserRole.ADMIN) {
    return {
      ...baseData,
      role: user.role,
      lastLoginAt: user.lastLoginAt,
    };
  }

  return baseData;
};

export const calculateAccountAge = (createdAt: Date): number => {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - createdAt.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // days
};
```

### 4. Data Layer (`data.ts`)

**Purpose**: Database operations and external data access

**Responsibilities**:
- CRUD operations with database
- Complex queries and joins
- Database transaction handling
- External API calls
- File system operations
- Data mapping between database and application models

**Should NOT**:
- Contain business logic
- Handle HTTP concerns
- Validate business rules (only data integrity)

```typescript
// data.ts - Database operations
import { Database, Transaction } from '../types/database';
import { User, CreateUserData, UserProfile } from './types';

export const createUser = async (
  trx: Transaction,
  userData: CreateUserData
): Promise<User> => {
  const [user] = await trx
    .insertInto('users')
    .values({
      email: userData.email.toLowerCase(),
      name: userData.name,
      password: userData.password,
      role: userData.role || 'user',
      created_at: new Date(),
      updated_at: new Date(),
    })
    .returning(['id', 'email', 'name', 'role', 'created_at', 'updated_at'])
    .execute();

  if (!user) {
    throw new Error('Failed to create user');
  }

  return user;
};

export const findUserById = async (
  db: Database,
  userId: string
): Promise<User | null> => {
  const user = await db
    .selectFrom('users')
    .where('id', '=', userId)
    .where('deleted_at', 'is', null)
    .selectAll()
    .executeTakeFirst();

  return user || null;
};

export const findUserByEmail = async (
  db: Database,
  email: string
): Promise<User | null> => {
  const user = await db
    .selectFrom('users')
    .where('email', '=', email.toLowerCase())
    .where('deleted_at', 'is', null)
    .selectAll()
    .executeTakeFirst();

  return user || null;
};

export const createUserProfile = async (
  trx: Transaction,
  userId: string,
  profileData: Partial<UserProfile>
): Promise<UserProfile> => {
  const [profile] = await trx
    .insertInto('user_profiles')
    .values({
      user_id: userId,
      first_name: profileData.firstName,
      last_name: profileData.lastName,
      avatar_url: profileData.avatarUrl,
      created_at: new Date(),
      updated_at: new Date(),
    })
    .returning(['id', 'user_id', 'first_name', 'last_name', 'avatar_url'])
    .execute();

  return profile;
};

export const updateUser = async (
  db: Database,
  userId: string,
  updates: Partial<User>
): Promise<User | null> => {
  const user = await db
    .updateTable('users')
    .set({
      ...updates,
      updated_at: new Date(),
    })
    .where('id', '=', userId)
    .where('deleted_at', 'is', null)
    .returning(['id', 'email', 'name', 'role', 'updated_at'])
    .executeTakeFirst();

  return user || null;
};

export const getUsersWithPagination = async (
  db: Database,
  limit: number,
  offset: number,
  filters?: {
    role?: string;
    searchTerm?: string;
  }
): Promise<{ users: User[]; total: number }> => {
  let query = db.selectFrom('users').where('deleted_at', 'is', null);

  // Apply filters
  if (filters?.role) {
    query = query.where('role', '=', filters.role);
  }

  if (filters?.searchTerm) {
    query = query.where((eb) =>
      eb.or([
        eb('name', 'ilike', `%${filters.searchTerm}%`),
        eb('email', 'ilike', `%${filters.searchTerm}%`),
      ])
    );
  }

  // Get total count
  const { count } = await query
    .select(({ fn }) => fn.count<number>('id').as('count'))
    .executeTakeFirst() as { count: number };

  // Get paginated results
  const users = await query
    .selectAll()
    .orderBy('created_at', 'desc')
    .limit(limit)
    .offset(offset)
    .execute();

  return { users, total: count };
};
```

## Implementation Patterns

### Result Pattern for Error Handling

```typescript
// types/result.ts
export type AppResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
  statusCode: number;
};

export const createSuccess = <T>(data: T): AppResult<T> => ({
  success: true,
  data,
});

export const createError = (error: string, statusCode: number): AppResult<never> => ({
  success: false,
  error,
  statusCode,
});
```

### Validation Pattern with Zod

```typescript
// types.ts - Schema definitions
import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  profile: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  }).optional(),
});

export const UserResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['user', 'admin']),
  createdAt: z.date(),
});

export type CreateUserRequest = z.infer<typeof CreateUserSchema>;
export type User = z.infer<typeof UserResponseSchema>;
```

## Route Definition

### Hono Route Patterns

```typescript
// api.ts - Complete route definition example
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { authMiddleware } from '../middleware/auth';
import { rateLimitMiddleware } from '../middleware/rate-limit';
import { corsMiddleware } from '../middleware/cors';

export const userRoutes = new Hono()
  // Apply global middleware
  .use('*', corsMiddleware())
  
  // Public endpoint - Create user (registration)
  .post(
    '/users',
    rateLimitMiddleware({ max: 5, window: '1h' }),
    zValidator('json', CreateUserSchema),
    async (c) => {
      const userData = c.req.valid('json');
      const result = await shell.createUser(c.env.DB, userData);
      
      if (result.success) {
        return c.json(result.data, 201);
      }
      return c.json({ error: result.error }, result.statusCode);
    }
  )
  
  // Protected endpoint - Get user by ID
  .get(
    '/users/:id',
    authMiddleware(),
    zValidator('param', z.object({ id: z.string().uuid() })),
    async (c) => {
      const { id } = c.req.valid('param');
      const currentUser = c.get('user');
      
      const result = await shell.getUserById(c.env.DB, id, currentUser);
      
      if (result.success) {
        return c.json(result.data);
      }
      return c.json({ error: result.error }, result.statusCode);
    }
  )
  
  // Protected endpoint - Update user
  .patch(
    '/users/:id',
    authMiddleware(),
    zValidator('param', z.object({ id: z.string().uuid() })),
    zValidator('json', UpdateUserSchema),
    async (c) => {
      const { id } = c.req.valid('param');
      const updates = c.req.valid('json');
      const currentUser = c.get('user');
      
      const result = await shell.updateUser(c.env.DB, id, updates, currentUser);
      
      if (result.success) {
        return c.json(result.data);
      }
      return c.json({ error: result.error }, result.statusCode);
    }
  )
  
  // Admin only endpoint - List all users
  .get(
    '/users',
    authMiddleware(['admin']),
    zValidator('query', PaginationSchema),
    async (c) => {
      const { page, limit, search, role } = c.req.valid('query');
      
      const result = await shell.getUsers(c.env.DB, {
        page: Number(page) || 1,
        limit: Number(limit) || 20,
        search,
        role,
      });
      
      if (result.success) {
        return c.json(result.data);
      }
      return c.json({ error: result.error }, result.statusCode);
    }
  );
```

## Schema Definition & Validation

### Comprehensive Schema Examples

```typescript
// schemas/user.ts
import { z } from 'zod';

// Base schemas
export const EmailSchema = z.string().email('Invalid email format').toLowerCase();

export const PasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const UUIDSchema = z.string().uuid('Invalid UUID format');

// User schemas
export const CreateUserSchema = z.object({
  email: EmailSchema,
  name: z.string().min(2).max(100),
  password: PasswordSchema,
  profile: z.object({
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    avatarUrl: z.string().url().optional(),
  }).optional(),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  profile: z.object({
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    avatarUrl: z.string().url().optional(),
  }).optional(),
}).strict();

export const UserResponseSchema = z.object({
  id: UUIDSchema,
  email: EmailSchema,
  name: z.string(),
  role: z.enum(['user', 'admin']),
  createdAt: z.date(),
  updatedAt: z.date(),
  profile: z.object({
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    avatarUrl: z.string().nullable(),
  }).optional(),
});

// Pagination schema
export const PaginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('20'),
  search: z.string().optional(),
  role: z.enum(['user', 'admin']).optional(),
});

// Type exports
export type CreateUserRequest = z.infer<typeof CreateUserSchema>;
export type UpdateUserRequest = z.infer<typeof UpdateUserSchema>;
export type User = z.infer<typeof UserResponseSchema>;
export type PaginationQuery = z.infer<typeof PaginationSchema>;
```

## Error Handling

### Comprehensive Error System

```typescript
// middleware/error-handler.ts
import { HTTPException } from 'hono/http-exception';
import { Context } from 'hono';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

// Global error handler middleware
export const errorHandler = (error: Error, c: Context) => {
  console.error('Error occurred:', error);

  if (error instanceof AppError) {
    return c.json(
      {
        error: error.message,
        code: error.code,
        timestamp: new Date().toISOString(),
      },
      error.statusCode
    );
  }

  if (error instanceof HTTPException) {
    return c.json(
      {
        error: error.message,
        code: 'HTTP_EXCEPTION',
        timestamp: new Date().toISOString(),
      },
      error.status
    );
  }

  // Unhandled errors
  return c.json(
    {
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
    },
    500
  );
};
```

## Authentication & Authorization

### Authentication Middleware

```typescript
// middleware/auth.ts
import { Context, Next } from 'hono';
import { verify } from 'hono/jwt';
import { UnauthorizedError, ForbiddenError } from './error-handler';
import * as userService from '../features/user/shell';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export const authMiddleware = (requiredRoles?: string[]) => {
  return async (c: Context, next: Next) => {
    try {
      const authHeader = c.req.header('Authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        throw new UnauthorizedError('Missing or invalid authorization header');
      }

      const token = authHeader.substring(7);
      const payload = await verify(token, c.env.JWT_SECRET) as JWTPayload;

      // Get fresh user data
      const userResult = await userService.getUserById(c.env.DB, payload.userId);
      if (!userResult.success) {
        throw new UnauthorizedError('Invalid token');
      }

      // Check role requirements
      if (requiredRoles && !requiredRoles.includes(userResult.data.role)) {
        throw new ForbiddenError('Insufficient permissions');
      }

      // Set user in context
      c.set('user', userResult.data);
      c.set('userId', payload.userId);

      await next();
    } catch (error) {
      if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
        throw error;
      }
      throw new UnauthorizedError('Invalid token');
    }
  };
};

// Usage in routes
export const protectedRoutes = new Hono()
  .use('*', authMiddleware()) // All routes require authentication
  .use('/admin/*', authMiddleware(['admin'])); // Admin routes require admin role
```

## Database Patterns

### Database Configuration and Best Practices

```typescript
// db/connection.ts
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { Database } from './types';

export const createDatabase = (connectionString: string): Kysely<Database> => {
  const dialect = new PostgresDialect({
    pool: new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    }),
  });

  return new Kysely<Database>({
    dialect,
    log: (event) => {
      if (event.level === 'query') {
        console.log('SQL:', event.query.sql);
        console.log('Parameters:', event.query.parameters);
      }
    },
  });
};

// Transaction helper
export const withTransaction = async <T>(
  db: Kysely<Database>,
  fn: (trx: Transaction<Database>) => Promise<T>
): Promise<T> => {
  return db.transaction().execute(fn);
};
```

### Common Query Patterns

```typescript
// data/common-patterns.ts
import { Kysely, Transaction } from 'kysely';
import { Database } from '../types/database';

// Soft delete pattern
export const softDelete = async (
  db: Kysely<Database>,
  table: keyof Database,
  id: string
): Promise<void> => {
  await db
    .updateTable(table)
    .set({ deleted_at: new Date() })
    .where('id', '=', id)
    .execute();
};

// Pagination helper
export const paginate = <T>(
  query: any,
  page: number,
  limit: number
) => {
  const offset = (page - 1) * limit;
  return query.limit(limit).offset(offset);
};

// Search pattern
export const searchUsers = (
  db: Kysely<Database>,
  searchTerm: string,
  filters: { role?: string } = {}
) => {
  let query = db
    .selectFrom('users')
    .where('deleted_at', 'is', null);

  if (searchTerm) {
    query = query.where((eb) =>
      eb.or([
        eb('name', 'ilike', `%${searchTerm}%`),
        eb('email', 'ilike', `%${searchTerm}%`),
      ])
    );
  }

  if (filters.role) {
    query = query.where('role', '=', filters.role);
  }

  return query;
};
```

## Middleware System

### Common Middleware Patterns

```typescript
// middleware/rate-limit.ts
import { Context, Next } from 'hono';
import { ConflictError } from './error-handler';

interface RateLimitConfig {
  max: number;
  window: string; // e.g., '1h', '10m', '30s'
}

export const rateLimitMiddleware = (config: RateLimitConfig) => {
  return async (c: Context, next: Next) => {
    const key = `rate_limit:${c.req.header('cf-connecting-ip') || 'unknown'}`;
    
    // Implementation would depend on your storage solution
    // (Redis, KV store, etc.)
    
    await next();
  };
};

// middleware/cors.ts
import { cors } from 'hono/cors';

export const corsMiddleware = () => {
  return cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
};

// middleware/logging.ts
export const requestLogger = () => {
  return async (c: Context, next: Next) => {
    const start = Date.now();
    const method = c.req.method;
    const url = c.req.url;
    
    await next();
    
    const duration = Date.now() - start;
    const status = c.res.status;
    
    console.log(`${method} ${url} ${status} - ${duration}ms`);
  };
};
```

## Testing Strategy

### Unit Testing Patterns

```typescript
// features/user/core.test.ts
import { describe, it, expect } from 'vitest';
import * as core from './core';

describe('User Core Logic', () => {
  describe('isValidEmail', () => {
    it('should return true for valid emails', () => {
      expect(core.isValidEmail('user@example.com')).toBe(true);
      expect(core.isValidEmail('test.email+tag@domain.co.uk')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(core.isValidEmail('invalid')).toBe(false);
      expect(core.isValidEmail('user@')).toBe(false);
      expect(core.isValidEmail('@domain.com')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(core.isValidEmail('')).toBe(false);
      expect(core.isValidEmail('  user@example.com  ')).toBe(true);
    });
  });

  describe('canAccessUser', () => {
    const adminUser = { id: '1', role: 'admin' } as User;
    const regularUser = { id: '2', role: 'user' } as User;

    it('should allow users to access their own data', () => {
      expect(core.canAccessUser(regularUser, '2')).toBe(true);
    });

    it('should allow admins to access any user data', () => {
      expect(core.canAccessUser(adminUser, '2')).toBe(true);
      expect(core.canAccessUser(adminUser, '999')).toBe(true);
    });

    it('should deny regular users access to other users data', () => {
      expect(core.canAccessUser(regularUser, '1')).toBe(false);
    });
  });
});
```

### Integration Testing

```typescript
// features/user/api.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Hono } from 'hono';
import { userRoutes } from './api';
import { createTestApp, createTestUser, cleanupTest } from '../../../test/helpers';

describe('User API Integration Tests', () => {
  let app: Hono;
  let testUser: User;
  let authToken: string;

  beforeAll(async () => {
    app = createTestApp();
    app.route('/api/users', userRoutes);
    
    const result = await createTestUser();
    testUser = result.user;
    authToken = result.token;
  });

  afterAll(async () => {
    await cleanupTest();
  });

  describe('POST /api/users', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        name: 'New User',
        password: 'SecurePass123',
      };

      const response = await app.request('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      expect(response.status).toBe(201);
      
      const result = await response.json();
      expect(result.email).toBe(userData.email);
      expect(result.name).toBe(userData.name);
      expect(result.id).toBeDefined();
      expect(result.password).toBeUndefined();
    });

    it('should return 400 for invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        name: 'User',
        password: 'SecurePass123',
      };

      const response = await app.request('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      expect(response.status).toBe(400);
    });

    it('should return 409 for duplicate email', async () => {
      const userData = {
        email: testUser.email,
        name: 'Duplicate User',
        password: 'SecurePass123',
      };

      const response = await app.request('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      expect(response.status).toBe(409);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user data for authenticated request', async () => {
      const response = await app.request(`/api/users/${testUser.id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status).toBe(200);
      
      const result = await response.json();
      expect(result.id).toBe(testUser.id);
      expect(result.email).toBe(testUser.email);
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await app.request(`/api/users/${testUser.id}`);
      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await app.request('/api/users/non-existent-id', {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status).toBe(404);
    });
  });
});
```

## Code Style Guidelines

### Naming Conventions

```typescript
// Constants: UPPER_SNAKE_CASE
const API_VERSION = 'v1';
const MAX_LOGIN_ATTEMPTS = 5;
const DEFAULT_PAGE_SIZE = 20;

// Functions: camelCase with descriptive verbs
const getUserById = (id: string) => { /* */ };
const validateEmailFormat = (email: string) => { /* */ };
const createUserAccount = (userData: CreateUserRequest) => { /* */ };

// Types/Interfaces: PascalCase
interface UserProfile {
  firstName: string;
  lastName: string;
}

type DatabaseConnection = Kysely<Database>;

// Files: kebab-case
// user-profile.service.ts
// email-validator.utils.ts
// auth-middleware.ts

// Variables: camelCase
const currentUser = await getCurrentUser();
const hasPermission = checkUserPermission(user, 'read');
```

### Function Guidelines

```typescript
// Good: Descriptive function names and single responsibility
const updateUserProfile = async (
  db: Database,
  userId: string,
  profileData: UserProfileUpdate
): Promise<AppResult<UserProfile>> => {
  // Implementation
};

// Good: Early returns for validation
const validateUserInput = (userData: CreateUserRequest): string | null => {
  if (!userData.email) return 'Email is required';
  if (!userData.name) return 'Name is required';
  if (!userData.password) return 'Password is required';
  
  return null; // No errors
};

// Good: Pure functions in core layer
const calculateUserAge = (birthDate: Date): number => {
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1;
  }
  
  return age;
};
```

### Import Organization

```typescript
// 1. Node.js built-ins
import { randomUUID } from 'crypto';

// 2. External libraries
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

// 3. Internal shared modules
import { Database } from '../config/database';
import { authMiddleware } from '../middleware/auth';

// 4. Feature-specific imports
import * as shell from './shell';
import * as core from './core';
import { CreateUserSchema, UserResponseSchema } from './types';

// 5. Relative imports
import { validateUser } from './utils';
```

## Documentation Standards

### API Documentation with OpenAPI

```typescript
// Use JSDoc comments for route documentation
/**
 * @openapi
 * /api/v1/users:
 *   post:
 *     summary: Create new user account
 *     description: Creates a new user account with the provided information
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input data
 *       409:
 *         description: User already exists
 */
```

### Code Comments Best Practices

```typescript
// Good: Explain complex business logic
const calculatePremiumDiscount = (user: User, amount: number): number => {
  // Premium users get graduated discounts based on account age
  // 0-6 months: 5%, 6-12 months: 10%, 12+ months: 15%
  const accountAge = calculateAccountAge(user.createdAt);
  
  if (accountAge < 180) return amount * 0.05;
  if (accountAge < 365) return amount * 0.10;
  return amount * 0.15;
};

// Good: Document important side effects
const processPayment = async (orderId: string): Promise<void> => {
  // This will trigger email notifications and update inventory
  await paymentService.processOrder(orderId);
};

// Avoid: Obvious comments
const getUserEmail = (user: User): string => {
  return user.email; // Returns the user's email ← Unnecessary
};
```

### Feature Documentation

Each feature should include a `README.md`:

```markdown
# User Feature

## Overview
Handles user account management including registration, authentication, profile management, and user data operations.

## API Endpoints

### POST /api/v1/users
Creates a new user account.

**Authentication**: None (public endpoint)
**Rate Limit**: 5 requests per hour per IP

### GET /api/v1/users/:id
Retrieves user information by ID.

**Authentication**: Required
**Authorization**: Users can access their own data, admins can access any user data

## Business Rules
- Email addresses must be unique across the system
- Passwords must meet security requirements (8+ chars, mixed case, numbers)
- Users can only modify their own profiles unless they have admin role
- Account creation triggers welcome email notification

## Dependencies
- Database: PostgreSQL with Kysely ORM
- Authentication: JWT tokens
- Notifications: Email service for welcome messages

## Environment Variables
- `JWT_SECRET`: Secret key for JWT token signing
- `ENABLE_NOTIFICATIONS`: Enable/disable email notifications
```

## Development Checklist

### For New Features
- [ ] Feature follows 4-layer architecture (API → Shell → Core → Data)
- [ ] Routes use proper Hono patterns with middleware
- [ ] Validation schemas defined with Zod
- [ ] Error handling uses AppResult pattern
- [ ] Business logic separated into core functions
- [ ] Database operations isolated in data layer
- [ ] Authentication/authorization properly implemented
- [ ] Rate limiting configured for public endpoints
- [ ] Unit tests for core and data layers
- [ ] Integration tests for API endpoints
- [ ] Documentation updated (README, OpenAPI)
- [ ] Code follows naming conventions
- [ ] Imports properly organized

### Code Review Checklist
- [ ] No business logic in API layer
- [ ] No HTTP concerns in shell/core/data layers
- [ ] Pure functions in core layer (no side effects)
- [ ] Proper error handling throughout
- [ ] Input validation at appropriate layers
- [ ] Database queries use proper typing
- [ ] Tests cover happy path and error cases
- [ ] Security considerations addressed
- [ ] Performance implications considered
- [ ] Documentation is clear and complete

---

This guide should be treated as a living document and updated as new patterns and best practices emerge. Always refer to existing code for examples and maintain consistency across the codebase.
