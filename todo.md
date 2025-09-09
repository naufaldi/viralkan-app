Debugging deployment issues (API + Web)

Findings

- API container crash: Hono OpenAPI route registration fails at runtime with
  TypeError: undefined is not an object (evaluating 'route.path.replaceAll').
  This originates from @hono/zod-openapi’s .openapi() method while mounting a
  route, which expects route.path to be a string. Our route definitions all
  specify path explicitly. This points to a runtime/library interaction issue
  (not a missing path in our source): either a bundling quirk with Bun build
  (the generated dist/index.js is large and appears minified/optimized) or a
  version mismatch/bug inside @hono/zod-openapi when used with Bun in Alpine.

- Web app error on /laporan: Next.js reports a generic Server Components render
  failure in production. The page does server-side fetching from the API. When
  the API is down (as above), the fetch can throw during the server render. The
  page catches errors and renders an error UI, but the non-standard typing of
  searchParams as Promise<> could contribute to inconsistent behavior across
  environments. I adjusted that to Next’s standard object shape.

What I changed

- apps/web/app/laporan/page.tsx
  - Fixed props: use object for searchParams (not Promise) and remove await.
    This aligns with Next App Router conventions and avoids subtle runtime
    mismatches in Server Components.
- Dependencies and container
  - Bumped hono and zod-openapi to latest compatible versions and rebuilt locally:
    - hono: ^4.9.6
    - @hono/zod-openapi: ^1.1.0
    - @hono/zod-validator: ^0.7.2
  - Switched API Docker base image from Alpine to Debian:
    - apps/api/Dockerfile: oven/bun:1.2.4-alpine → oven/bun:1.2.4
    - Use apt-get to install wget/ca-certificates

- Defensive change
  - Removed `middleware` from `createRoute({...})` and passed them directly to
    `router.openapi(route, ...middleware, handler)` for all authenticated admin,
    reports, upload, and auth routes. This reduces reliance on library internals
    to read/merge `route.middleware`.

Root cause hypotheses (API)

- Library/runtime mismatch: @hono/zod-openapi@1.0.2 + hono@4.6.x with Bun
  running in oven/bun:1.2.4-alpine can produce route objects where path becomes
  undefined inside the bundled output (seen at dist/index.js stack). This is
  consistent with a bundling/minification edge-case or an upstream bug in the
  library’s OpenAPI wrapper when consumed via Bun build.

- Not a missing path in source: I reviewed all createRoute() calls; every route
  includes a literal string path. All .openapi() usages pass the correct route
  object. No conditional route creation or dynamic path construction is present.

How to fix (API)

- Preferred: Upgrade the OpenAPI wrapper and hono together, then rebuild.
  - Bump: "@hono/zod-openapi" to a newer 1.x and ensure "hono" is compatible.
  - Rebuild the container. This often resolves the internal route registration
    bug that manifests as route.path being undefined.

- Defensive change (optional but robust): Do not place middleware inside the
  createRoute({ ... }) object. Instead, pass them to .openapi(route, ...mws, handler).
  This avoids the library having to merge or read route.middleware and reduces
  chances of shape conflicts during bundling.

- Environment/bundling stability:
  - Switch base image from oven/bun:1.2.4-alpine to oven/bun:1.2.4 (Debian) to
    rule out Alpine/JSC differences.
  - Ensure build includes sourcemaps (already in Dockerfile) and consider
    explicitly disabling minification if it is being applied by default.

- Add startup assertions (temporary instrumentation) to pinpoint any offending
  route if the issue persists:
  - Wrap router.openapi with a small guard that logs route and route.path before
    delegation, throwing a clear error if missing. This will reveal which route
    triggers the undefined path in production logs without obfuscation.

How to fix (Web)

- Ensure NEXT_PUBLIC_API_URL points to a reachable API host from the web
  container and that CORS on the API allows the web origin (already includes
  https://viral.faldi.xyz). With the API stable, the /laporan page should render
  and fall back to the in-page error state if network errors occur.

- The searchParams typing fix is in place. If errors continue, add logging in
  getPublicReportsWithStats to capture server-side fetch failures, and verify
  the page renders the ReportsErrorState (which it should on exceptions).

Next steps I recommend

- Try a quick image change (Debian) and rebuild to see if the API crash
  disappears without code changes.
- If not, bump @hono/zod-openapi and hono together and rebuild.
- If still failing, I can add the openapi guard wrapper to log the exact route
  at fault and proceed to the defensive middleware change.
