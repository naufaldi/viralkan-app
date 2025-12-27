# Frontend Development Guide

This file provides frontend-specific guidance for the web application. For universal workflow and project context, see the root `AGENTS.md`.

## Frontend Development Guidelines

**For creating execution plans or planning tasks**, check `.agent/PLANS.md` for comprehensive requirements on how to create ExecPlans. This is especially important when:

- Planning new features or significant changes
- Creating implementation specifications
- Breaking down complex work into milestones
- Documenting design decisions and rationale

**Always check `.cursor/rules/frontend-rule.mdc` before implementing frontend features** for comprehensive technical standards.

### Component Architecture

- Components are built with the shared UI library (`@repo/ui`)
- Follow existing patterns with Radix UI primitives
- Export from `packages/ui/src/index.ts`
- Use TypeScript for all components
- Install shadcn/ui components using: `bunx shadcn@latest add <component-name>`
- Check component availability in shadcn/ui before creating custom implementations
- Always wrap shadcn components in `packages/ui` before using in `apps/web`

### Styling

- Tailwind CSS v4 for styling
- Custom component library with Radix UI primitives
- Follow styling guidelines in `.cursor/rules/frontend-rule.mdc`

### Code Organization

- **Services**: API calls and external service integrations go in `apps/web/services/`
- **Custom Hooks**: Reusable React hooks go in `apps/web/hooks/`
- **Types**: Shared TypeScript types go in `apps/web/lib/types/`
- **Utils**: Utility functions go in `apps/web/lib/utils/`

### Frontend Best Practices

**Framework Preference Order:**

1. **Next.js built-in functions** (Link, useRouter, etc.) - Always prefer these first
2. **React patterns** (hooks, components) - Second choice
3. **Vanilla JavaScript** - Only as last resort
4. Never use ternary inside ternary
5. Prefer Server Side for Auth, instead of client side

**Navigation:**

- Use `Link` from `next/link` for client-side navigation
- Use `useRouter` from `next/navigation` for programmatic navigation
- NEVER use `window.location.href` unless absolutely necessary

**State Management:**

- Use React hooks (useState, useEffect) for component state
- Use Context API for shared state
- Avoid over-engineering with external state libraries unless truly needed

**Forms:**

- React Hook Form for form handling

**Code Quality:**

- Follow existing patterns in the codebase
- Use TypeScript types consistently
- Prefer functional components over class components
- Keep components small and focused

### Frontend TypeScript/JavaScript Rules

#### FORBIDDEN - NEVER DO THESE:

- **NO `any` types** - use proper TypeScript types!
- **NO `setTimeout()` for synchronization** - use Promises and async/await!
- **NO** keeping old and new code together
- **NO** migration functions or compatibility layers
- **NO** versioned function names (processV2, handleNew)
- **NO** TODOs in final code
- **NO** `console.log` in production code - use proper logging

#### Required Standards:

- **Delete** old code when replacing it
- **Meaningful names**: `userId` not `id`
- **Early returns** to reduce nesting
- **Proper types**: Use TypeScript interfaces and types consistently
- **Async/await**: Use modern async patterns, avoid callback hell
- **Error handling**: Use proper error boundaries and error responses

#### Code Style Principles:

- **Code Comments**: Only add comments for function/component documentation, not for obvious code
- **Event Handlers**: Use "handle" prefix for event handlers (e.g., `handleClick`, `handleKeyDown`, `handleSubmit`)
- **Const vs Function**: Prefer const arrow functions over function declarations (e.g., `const getUserById = () => {}` instead of `function getUserById() {}`)

### Frontend Commands

All commands should be run from the `apps/web` directory unless otherwise specified:

```bash
# Change to web directory
cd apps/web

# Start web app (with Turbopack, port 5173)
bun run dev

# Build web app
bun run build

# Start production server
bun run start

# Type checking
bun run check-types

# Linting (with max warnings 0)
bun run lint
```

Commands from root directory (using turbo):

```bash
# From root directory - Start all apps
bun run dev

# From root directory - Start only web app
turbo dev --filter=web

# From root directory - Build all apps
bun run build

# From root directory - Build only web app
turbo build --filter=web

# From root directory - Lint all apps
bun run lint

# From root directory - Check types for all apps
bun run check-types
```

Code formatting (from root directory):

```bash
# Format all files (from root)
bun run format
```
