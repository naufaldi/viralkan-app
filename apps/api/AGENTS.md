# Backend/API Development Guide

This file provides backend-specific guidance for the API application. For universal workflow and project context, see the root `AGENTS.md`.

## Backend Development Guidelines

**For creating execution plans or planning tasks**, check `.agent/PLANS.md` for comprehensive requirements on how to create ExecPlans. This is especially important when:

- Planning new features or significant changes
- Creating implementation specifications
- Breaking down complex work into milestones
- Documenting design decisions and rationale

### API Architecture (Clean Architecture Pattern)

The API follows a 4-layer architecture:

1. **API Layer** (`src/routes/`): HTTP routing, validation, middleware
2. **Shell Layer** (`src/shell/`): Business logic orchestration
3. **Core Layer** (`src/core/`): Pure business logic, domain rules
4. **Data Layer** (`src/data/`): Database operations, external APIs

Key directories:

- `src/routes/`: API endpoints and HTTP handlers
- `src/db/`: Database schemas, migrations, and connection
- `src/core/`: Business logic and domain models
- `src/shell/`: Service layer orchestrating business operations
- `src/types/`: TypeScript type definitions

> **For detailed architecture rules**: See `.cursor/rules/backend.mdc` for comprehensive 4-layer architecture guidelines, layer responsibilities (DO/DON'T lists), type organization rules, naming conventions, database patterns, route implementation patterns, and code quality standards.

### Database Schema

**Users Table**: Firebase UID, email, name, avatar_url, provider
**Reports Table**: User references, image URLs, categories, location data (lat/lon), street names

PostGIS is enabled for spatial queries and future GIS features.

### Authentication Flow

1. Frontend authenticates with Firebase
2. Firebase JWT token sent to API
3. API verifies token with Firebase Admin SDK
4. User data stored/retrieved from PostgreSQL

### Key API Endpoints

- `GET /` - API health check
- `GET /health` - Database connectivity check
- `GET /docs` - Swagger UI documentation
- `GET /openapi` - OpenAPI specification
- `POST /api/auth/verify` - Verify Firebase JWT token
- `GET /api/auth/me` - Get current user profile
- `GET /api/reports` - List all reports (paginated)
- `POST /api/reports` - Create new report (requires auth)
- `GET /api/reports/:id` - Get specific report
- `GET /api/me/reports` - Get current user's reports

### API Development Standards

- All endpoints use Zod validation schemas
- Authentication middleware protects user-specific routes
- Database queries use prepared statements for security
- Error responses follow consistent structure with proper HTTP codes

### Adding New API Endpoints

1. Create route handler in `src/routes/`
2. Add Zod validation schema
3. Implement business logic in `src/core/`
4. Add database operations in `src/data/`
5. Update OpenAPI documentation

### Database Migrations

- Migrations are in `apps/api/src/db/migrations/`
- Use `bun run db:migrate` to apply migrations
- Always test migrations with `bun run db:reset` first

### Backend TypeScript/JavaScript Rules

#### FORBIDDEN - NEVER DO THESE:

- **NO `any` types** - use proper TypeScript types!
- **NO `setTimeout()` for synchronization** - use Promises and async/await!
- **NO** keeping old and new code together
- **NO** migration functions or compatibility layers
- **NO** versioned function names (processV2, handleNew)
- **NO** complex error class hierarchies
- **NO** TODOs in final code
- **NO** `console.log` in production code - use proper logging

#### Required Standards:

- **Delete** old code when replacing it
- **Meaningful names**: `userId` not `id`
- **Early returns** to reduce nesting
- **Proper types**: Use TypeScript interfaces and types consistently
- **Async/await**: Use modern async patterns, avoid callback hell
- **Error handling**: Use proper error boundaries and error responses
- **Zod validation**: All API inputs must be validated with Zod schemas
- **ESLint compliance**: Follow project ESLint rules strictly

#### Code Style Principles:

- **Code Comments**: Only add comments for function/component documentation, not for obvious code
- **Event Handlers**: Use "handle" prefix for event handlers (e.g., `handleClick`, `handleKeyDown`, `handleSubmit`)
- **Const vs Function**: Prefer const arrow functions over function declarations (e.g., `const getUserById = () => {}` instead of `function getUserById() {}`)

### Backend Commands

All commands should be run from the `apps/api` directory unless otherwise specified:

```bash
# Change to API directory
cd apps/api

# Start API server (with hot reload)
bun run dev

# Build API
bun run build

# Start production server
bun run start

# Test (API only has tests currently)
bun test

# Test with watch mode
bun test:watch

# Type checking
bun run check-types

# Linting
bun run lint
```

Database commands (can be run from root or apps/api):

```bash
# From root directory
bun run db:migrate  # Runs: cd apps/api && bun run db:migrate
bun run db:reset    # Runs: cd apps/api && bun run db:reset

# From apps/api directory
bun run db:migrate  # Direct migration
bun run db:reset    # Direct reset
bun run db:seed     # Seed database with test data
bun run import:admin-data  # Import admin data from CSV
```

Code formatting (from root directory):

```bash
# Format all files (from root)
bun run format
```

### Testing

- API tests are located in `apps/api/src/routes/**/__tests__/`
- Use `bun test` for running tests (Bun's built-in test runner)
- Tests cover authentication, validation, and API endpoints

### Security Patterns

- Validate all inputs with Zod
- Use crypto.randomUUID() for random IDs
- Prepared statements for SQL (never concatenate!)
- Sanitize all user inputs
