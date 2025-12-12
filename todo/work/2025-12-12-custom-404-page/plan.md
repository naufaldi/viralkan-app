# Custom 404 (Not Found) page for Viralkan Web

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

Reference this plan against: `AGENTS.md`, `.agent/PLANS.md`, `docs/ui-concept.md`, and `docs/ux-principle.md`.

## Purpose / Big Picture

### User story

As a visitor who lands on an invalid URL, I want to clearly understand that the page does not exist and have immediate, easy options to recover (search and navigation), so I can continue using Viralkan without frustration.

### Why this matters

Today, invalid routes do not have a bespoke recovery experience. A custom 404 improves trust and usability by offering clear next actions (search reports, go home, open dashboard) consistent with Viralkan’s design system.

## Progress

- [x] (2025-12-12) Research current routing patterns in `apps/web/app` and existing search params for `/laporan`.
- [x] (2025-12-12) Add root-level 404 entrypoint at `apps/web/app/not-found.tsx`.
- [x] (2025-12-12) Add a client component for search + navigation in `apps/web/components/common/not-found-content.tsx`.
- [x] (2025-12-12) Manual validation in dev server: invalid route shows 404, search navigates to `/laporan?search=...`.
- [x] (2025-12-12) Run mandatory checks: `bun run format && bun test && bun run lint`.

## Surprises & Discoveries

- Observation: `/laporan` already supports `search` query param via `apps/web/app/laporan/page.tsx`.
  Evidence: It reads `searchParams.search` and forwards it to the API query string.

## Decision Log

- Decision: Implement 404 search as “search reports” by redirecting to `/laporan?search=<term>`.
  Rationale: This aligns with the issue requirement and existing `/laporan` search parameter support, and it provides immediate user value without introducing a new global search service.
  Date/Author: 2025-12-12 / Codex

- Decision: Include `Header` on the 404 page for consistent navigation and auth affordances.
  Rationale: Most pages render `components/layout/header`, and the header already contains the primary navigation patterns.
  Date/Author: 2025-12-12 / Codex

## Outcomes & Retrospective

Implemented a custom, design-system-aligned 404 page for the web app with:

- Search that redirects to `/laporan?search=<term>`
- Quick recovery navigation to Home, Reports, Dashboard, and browser Back

Repo-wide checks completed successfully: `bun run format && bun test && bun run lint`.

## Context and Orientation

Viralkan Web is a Next.js (App Router) application under `apps/web`.

Key files involved:

- `apps/web/app/*`: Route tree using Next.js App Router.
- `apps/web/app/laporan/page.tsx`: Public reports listing page; supports `search` query param.
- `apps/web/components/layout/header.tsx`: Global header/navigation UI used on most pages (client component).
- `packages/ui/src/components/ui/*`: Shared shadcn/ui components and Tailwind styling patterns used by web.

Next.js App Router uses a special file named `not-found.tsx` to render a 404 UI for missing routes. Placing `apps/web/app/not-found.tsx` creates a custom, app-wide Not Found experience.

## Plan of Work

1. Add `apps/web/app/not-found.tsx` as the Next.js Not Found entrypoint. This file should render:
   - The global `Header` component.
   - A centered content area that uses Viralkan’s monochrome “luxury simplicity” design (neutral background, card, clear typography).
   - A client component (see next step) that provides search and navigation actions.

2. Add `apps/web/components/common/not-found-content.tsx` as a client component that implements:
   - A search form with an input and submit button.
   - On submit, navigate to `/laporan?search=<query>` (with proper URL encoding).
   - Quick links (buttons) to:
     - Home (`/`)
     - Reports (`/laporan`)
     - Dashboard (`/dashboard`)
   - A “Back” action that uses `router.back()` for recovery to the previous page.

3. Styling and accessibility requirements:
   - Use shared UI primitives from `@repo/ui/components/ui/*` (e.g., `Card`, `Button`, `Input`).
   - Ensure the search input has an accessible label (use `sr-only` label text).
   - Maintain minimum tap targets (44px) for primary actions.
   - Avoid clutter (Hick’s Law): only show the most useful actions.

## Concrete Steps

From repo root:

1. Implement the new files:
   - Edit `apps/web/app/not-found.tsx`
   - Add `apps/web/components/common/not-found-content.tsx`

2. Run dev server and validate behavior:
   - `cd apps/web`
   - `bun run dev`
   - Visit an invalid URL like `http://localhost:3000/does-not-exist`
   - Verify the custom 404 UI appears, and search navigates to `/laporan?search=<term>`.

3. Run mandatory automated checks (repo root):
   - `bun run format && bun test && bun run lint`

## Validation and Acceptance

The implementation is accepted when:

1. Visiting any invalid route renders a custom 404 page (not the default Next.js one).
2. The 404 page contains:
   - A clear “page not found” message (in Indonesian, matching the app’s tone).
   - A search box that navigates to `/laporan?search=<term>` on submit.
   - Prominent links back to Home (`/`), Reports (`/laporan`), and Dashboard (`/dashboard`).

3. The page is responsive and visually consistent with `docs/ui-concept.md` (monochrome neutrals, generous spacing, card-based layout).
4. Accessibility basics are satisfied:
   - Search input has an accessible label.
   - Buttons are keyboard-focusable with visible focus states.

5. `bun run format && bun test && bun run lint` completes successfully with no errors.

## Idempotence and Recovery

These changes are safe to re-apply:

- Re-running format/lint is idempotent.
- Adding `app/not-found.tsx` is additive; removing the files restores default Next.js behavior.

If the 404 page renders but navigation does not work:

- Confirm the client component is marked with `"use client"`.
- Confirm navigation uses `next/navigation`’s `useRouter`.

## Artifacts and Notes

Expected user flow for search:

- User enters `sudirman`
- Submits form
- Browser navigates to `/laporan?search=sudirman`

## Interfaces and Dependencies

Use:

- Next.js App Router `app/not-found.tsx` mechanism.
- `next/navigation` router for client-side navigation.
- `@repo/ui/components/ui/button`, `@repo/ui/components/ui/card`, `@repo/ui/components/ui/input` for consistent styling.
- Optional icons from `lucide-react` (already used in other pages).
