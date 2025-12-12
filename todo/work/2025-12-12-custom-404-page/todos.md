# Custom 404 (Not Found) page for Viralkan Web

## Tasks

### Task IDs (kebab-case with date prefix)

**2025-12-12-research-web-routing**

- Status: completed
- Description: Confirm Next.js App Router structure and existing report search params
- Blocked by: None
- Blocking: 2025-12-12-add-not-found-entrypoint

**2025-12-12-add-not-found-entrypoint**

- Status: completed
- Description: Add `apps/web/app/not-found.tsx` and wire it to the header + content
- Blocked by: 2025-12-12-research-web-routing
- Blocking: 2025-12-12-add-not-found-client

**2025-12-12-add-not-found-client**

- Status: completed
- Description: Add `apps/web/components/common/not-found-content.tsx` with search + navigation
- Blocked by: 2025-12-12-add-not-found-entrypoint
- Blocking: 2025-12-12-manual-validate-404

**2025-12-12-manual-validate-404**

- Status: completed
- Description: Validate invalid route renders custom 404 and search redirects to `/laporan?search=...`
- Blocked by: 2025-12-12-add-not-found-client
- Blocking: 2025-12-12-run-mandatory-checks

**2025-12-12-run-mandatory-checks**

- Status: completed
- Description: Run `bun run format && bun test && bun run lint` and ensure all green
- Blocked by: 2025-12-12-manual-validate-404
- Blocking: None

## Dependencies Graph

```
2025-12-12-research-web-routing
    ↓
2025-12-12-add-not-found-entrypoint
    ↓
2025-12-12-add-not-found-client
    ↓
2025-12-12-manual-validate-404
    ↓
2025-12-12-run-mandatory-checks
```
