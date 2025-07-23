# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Development Partnership

We're building production-quality code together. Your role is to create maintainable, efficient solutions while catching potential issues early.

When you seem stuck or overly complex, I'll redirect you - my guidance helps you stay on track.

## 🚨 AUTOMATED CHECKS ARE MANDATORY

**ALL lint/test issues are BLOCKING - EVERYTHING must be ✅ GREEN!**  
No errors. No formatting issues. No linting problems. Zero tolerance.  
These are not suggestions. Fix ALL issues before continuing.

## CRITICAL WORKFLOW - ALWAYS FOLLOW THIS!

### Research → Plan → Implement

**NEVER JUMP STRAIGHT TO CODING!** Always follow this sequence:

1. **Research**: Explore the codebase, understand existing patterns
2. **Plan**: Create a detailed implementation plan and verify it with me
3. **Implement**: Execute the plan with validation checkpoints

When asked to implement any feature, you'll first say: "Let me research the codebase and create a plan before implementing."

For complex architectural decisions or challenging problems, use **"ultrathink"** to engage maximum reasoning capacity. Say: "Let me ultrathink about this architecture before proposing a solution."

### USE MULTIPLE AGENTS!

_Leverage subagents aggressively_ for better results:

- Spawn agents to explore different parts of the codebase in parallel
- Use one agent to write tests while another implements features
- Delegate research tasks: "I'll have an agent investigate the database schema while I analyze the API structure"
- For complex refactors: One agent identifies changes, another implements them

Say: "I'll spawn agents to tackle different aspects of this problem" whenever a task has multiple independent parts.

### Reality Checkpoints

**Stop and validate** at these moments:

- After implementing a complete feature
- Before starting a new major component
- When something feels wrong
- Before declaring "done"
- **WHEN LINTING/TESTS FAIL WITH ERRORS** ❌

Run: `bun run format && bun test && bun run lint`

> Why: You can lose track of what's actually working. These checkpoints prevent cascading failures.

### 🚨 CRITICAL: Lint/Test Failures Are BLOCKING

**When linting or tests report ANY issues, you MUST:**

1. **STOP IMMEDIATELY** - Do not continue with other tasks
2. **FIX ALL ISSUES** - Address every ❌ issue until everything is ✅ GREEN
3. **VERIFY THE FIX** - Re-run the failed command to confirm it's fixed
4. **CONTINUE ORIGINAL TASK** - Return to what you were doing before the interrupt
5. **NEVER IGNORE** - There are NO warnings, only requirements

This includes:

- Formatting issues (prettier, eslint --fix)
- Linting violations (eslint, typescript compiler)
- Test failures (bun test)
- Type checking errors (bun run check-types)
- ALL other checks

Your code must be 100% clean. No exceptions.

**Recovery Protocol:**

- When interrupted by a lint/test failure, maintain awareness of your original task
- After fixing all issues and verifying the fix, continue where you left off
- Use the todo list to track both the fix and your original task

## Working Memory Management

### When context gets long:

- Re-read this CLAUDE.md file
- Summarize progress in a PROGRESS.md file
- Document current state before major changes

### Maintain TODO.md:

```
## Current Task
- [ ] What we're doing RIGHT NOW

## Completed
- [x] What's actually done and tested

## Next Steps
- [ ] What comes next
```

## JavaScript/TypeScript-Specific Rules

### FORBIDDEN - NEVER DO THESE:

- **NO `any` types** - use proper TypeScript types!
- **NO `setTimeout()` for synchronization** - use Promises and async/await!
- **NO** keeping old and new code together
- **NO** migration functions or compatibility layers
- **NO** versioned function names (processV2, handleNew)
- **NO** complex error class hierarchies
- **NO** TODOs in final code
- **NO** `console.log` in production code - use proper logging

### Required Standards:

- **Delete** old code when replacing it
- **Meaningful names**: `userId` not `id`
- **Early returns** to reduce nesting
- **Proper types**: Use TypeScript interfaces and types consistently
- **Async/await**: Use modern async patterns, avoid callback hell
- **Error handling**: Use proper error boundaries and error responses
- **Zod validation**: All API inputs must be validated with Zod schemas
- **ESLint compliance**: Follow project ESLint rules strictly

## Project Overview

**Viralkan** is a road damage reporting platform for Bekasi, Indonesia, built as a monorepo using Turborepo. It centralizes pothole and road damage reports that are currently scattered across WhatsApp and social media, making it easier for local government to prioritize repairs.

## Technology Stack

- **Runtime**: Bun 1.2.4 (primary package manager and JavaScript runtime)
- **Monorepo**: Turborepo 2.5.4
- **Backend**: Hono 4.6.12 (lightweight web framework)
- **Database**: PostgreSQL 15 + PostGIS (spatial extension)
- **Frontend**: Next.js 15.3.0 with React 19.1.0
- **Authentication**: Firebase Admin SDK + Google OAuth
- **Validation**: Zod 3.24.1
- **UI**: Custom component library with Radix UI primitives + Tailwind CSS v4
- **Storage**: Cloudflare R2 for image uploads

## Essential Commands

### Development

```bash
# Start all development servers (API on :3000, web on :3000, docs on :3001)
bun run dev

# Start only API server
cd apps/api && bun run dev

# Start only web app
turbo dev --filter=web

# Start only docs
turbo dev --filter=docs
```

### Building & Testing

```bash
# Build all apps and packages
bun run build

# Test (API only has tests currently)
cd apps/api && bun test

# Test with watch mode
cd apps/api && bun test:watch

# Type checking
bun run check-types

# Linting
bun run lint

# Code formatting
bun run format
```

### Database Management

```bash
# Run database migrations
bun run db:migrate

# Reset database (drops all tables)
bun run db:reset

# Seed database with test data
cd apps/api && bun run db:seed
```

## Architecture Overview

### Monorepo Structure

```
viralkan-app/
├── apps/
│   ├── api/              # Hono API server (Clean Architecture)
│   ├── web/              # Next.js frontend
│   └── docs/             # Next.js documentation site
├── packages/
│   ├── ui/               # Shared React component library
│   ├── eslint-config/    # Shared ESLint configurations
│   └── typescript-config/ # Shared TypeScript configurations
└── docs/                 # Project documentation (markdown)
```

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

### Database Schema

**Users Table**: Firebase UID, email, name, avatar_url, provider
**Reports Table**: User references, image URLs, categories, location data (lat/lon), street names

PostGIS is enabled for spatial queries and future GIS features.

### Authentication Flow

1. Frontend authenticates with Firebase
2. Firebase JWT token sent to API
3. API verifies token with Firebase Admin SDK
4. User data stored/retrieved from PostgreSQL

## Key API Endpoints

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

## Environment Setup

### Required Environment Variables

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/viralkan
JWT_SECRET=your-jwt-secret
FIREBASE_SERVICE_ACCOUNT_JSON={"type": "service_account", ...}
```

### Optional (for full functionality)

```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
R2_ACCESS_KEY=your-r2-access-key
R2_SECRET_KEY=your-r2-secret-key
R2_BUCKET=your-r2-bucket
R2_ENDPOINT=your-r2-endpoint
```

### Database Setup

```bash
# Using Docker
docker run --name postgres-viralkan \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=viralkan \
  -p 5432:5432 \
  -d postgis/postgis:15
```

## Implementation Standards

### Our code is complete when:

- ✅ All linters pass with zero issues
- ✅ All tests pass
- ✅ Feature works end-to-end
- ✅ Old code is deleted
- ✅ TypeScript types are properly defined
- ✅ JSDoc on all exported functions

### Testing Strategy

- Complex business logic → Write tests first
- Simple CRUD → Write tests after
- Hot paths → Add performance tests
- Skip tests for simple utility functions

## Development Guidelines

### API Development

- All endpoints use Zod validation schemas
- Authentication middleware protects user-specific routes
- Database queries use prepared statements for security
- Error responses follow consistent structure with proper HTTP codes

### Frontend Development

- Components are built with the shared UI library (`@repo/ui`)
- Tailwind CSS v4 for styling
- React Hook Form for form handling
- Next.js 15 with Turbopack for fast development

### Testing

- API tests are located in `apps/api/src/routes/**/__tests__/`
- Use `bun test` for running tests (Bun's built-in test runner)
- Tests cover authentication, validation, and API endpoints

## Problem-Solving Together

When you're stuck or confused:

1. **Stop** - Don't spiral into complex solutions
2. **Delegate** - Consider spawning agents for parallel investigation
3. **Ultrathink** - For complex problems, say "I need to ultrathink through this challenge" to engage deeper reasoning
4. **Step back** - Re-read the requirements
5. **Simplify** - The simple solution is usually correct
6. **Ask** - "I see two approaches: [A] vs [B]. Which do you prefer?"

My insights on better approaches are valued - please ask for them!

## Performance & Security

### **Measure First**:

- No premature optimization
- Benchmark before claiming something is faster
- Use performance profiling for real bottlenecks

### **Security Always**:

- Validate all inputs with Zod
- Use crypto.randomUUID() for random IDs
- Prepared statements for SQL (never concatenate!)
- Sanitize all user inputs

## Communication Protocol

### Progress Updates:

```
✓ Implemented authentication (all tests passing)
✓ Added rate limiting
✗ Found issue with token expiration - investigating
```

### Suggesting Improvements:

"The current approach works, but I notice [observation].
Would you like me to [specific improvement]?"

## Common Patterns

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

### Adding UI Components

- Components go in `packages/ui/src/`
- Follow existing patterns with Radix UI primitives
- Export from `packages/ui/src/index.ts`
- Use TypeScript for all components

### Frontend Code Organization

- **Services**: API calls and external service integrations go in `apps/web/services/`
- **Custom Hooks**: Reusable React hooks go in `apps/web/hooks/`
- **Types**: Shared TypeScript types go in `apps/web/lib/types/`
- **Utils**: Utility functions go in `apps/web/lib/utils/`

### Frontend Best Practices

**Framework Preference Order:**

1. **Next.js built-in functions** (Link, useRouter, etc.) - Always prefer these first
2. **React patterns** (hooks, components) - Second choice
3. **Vanilla JavaScript** - Only as last resort
4. Never use tenary inside tenary
5. More Server Side for Auth, instead of client side

**Navigation:**

- Use `Link` from `next/link` for client-side navigation
- Use `useRouter` from `next/navigation` for programmatic navigation
- NEVER use `window.location.href` unless absolutely necessary

**State Management:**

- Use React hooks (useState, useEffect) for component state
- Use Context API for shared state
- Avoid over-engineering with external state libraries unless truly needed

**Code Quality:**

- Follow existing patterns in the codebase
- Use TypeScript types consistently
- Prefer functional components over class components
- Keep components small and focused

## Working Together

- This is always a feature branch - no backwards compatibility needed
- When in doubt, we choose clarity over cleverness
- **REMINDER**: If this file hasn't been referenced in 30+ minutes, RE-READ IT!

Avoid complex abstractions or "clever" code. The simple, obvious solution is probably better, and my guidance helps you stay focused on what matters.

## Documentation

- **Project docs**: `/docs/` directory (markdown files)
- **API docs**: Auto-generated at `/docs` endpoint
- **Architecture guide**: `/docs/backend-development.md`
- **Product requirements**: `/docs/prd.md` and `/docs/rfc.md`

## Deployment

Production deployment uses Docker + Traefik reverse proxy with automatic Let's Encrypt certificates via Cloudflare DNS. See `/infra/` for deployment configurations.
