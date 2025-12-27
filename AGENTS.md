This file provides guidance to AI when working with code in this repository.

# Development Partnership

We're building production-quality code together. Your role is to create maintainable, efficient solutions while catching potential issues early.

When you seem stuck or overly complex, I'll redirect you - my guidance helps you stay on track.

## 📚 Technical Rules Reference

This document provides general guidance, workflow, and project context. For detailed technical rules:

- **Backend Development**: See `apps/api/AGENTS.md` and `.cursor/rules/backend.mdc` for comprehensive backend rules
- **Frontend Development**: See `apps/web/AGENTS.md` and `.cursor/rules/frontend-rule.mdc` for comprehensive frontend rules

**Always check these files before implementing backend or frontend features** to ensure compliance with detailed technical standards.

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

**For creating execution plans or planning tasks**, check `.agent/PLANS.md` for comprehensive requirements on how to create ExecPlans.

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

For detailed architecture information:

- **API Architecture**: See `apps/api/AGENTS.md`
- **Frontend Architecture**: See `apps/web/AGENTS.md`

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
- **Execution Plans**: See `.agent/PLANS.md` for requirements on creating ExecPlans

## Deployment

Production deployment uses Docker + Traefik reverse proxy with automatic Let's Encrypt certificates via Cloudflare DNS. See `/infra/` for deployment configurations.
