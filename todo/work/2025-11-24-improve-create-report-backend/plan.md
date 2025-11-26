# Backend Plan – Improve Create Report Flow (Auto Location)

This ExecPlan is a living document maintained per .agent/PLANS.md and paired with todo/work/2025-11-24-improve-create-report-backend/todos.md. Update all sections as work progresses.

## Purpose / Big Picture

Enable users to submit road damage reports without touching lat/lon by letting the backend perform reverse/forward geocoding, while keeping address fields editable and allowing admins to correct coordinates later. Success means create/update flows accept photo + human address, enrich/stash coordinates when possible, and degrade gracefully when geocoding fails.

## Progress

- [x] (2025-11-24 09:50Z) Reviewed RFC (docs/report/improve-create-report.md) and current reports API/core/data to understand gaps around geocoding and validation.
- [x] (2025-11-24 10:05Z) Confirmed Nominatim as backend geocoder and requireAdmin for remediation.
- [x] (2025-11-24 10:40Z) Drafted backend wiring: added geocoding schemas/types/metadata, geocoding client scaffold, create/update shell logic with reverse/forward geocoding, and admin location update pathway (in progress to finalize/validate).
- [x] (2025-11-26 01:49Z) Fixed TypeScript errors after geocoding integration; check-types now passes.
- [x] (2025-11-26 02:05Z) Added rate-limited Nominatim client, exposed reverse/forward geocode endpoints, and admin location update handler; check-types passing.
- [x] (2025-11-26 02:20Z) Simplified create report frontend flow to single track (no tabs) that adapts based on photo EXIF vs manual address.
- [ ] (2025-11-26 08:55Z) Frontend geocoding bug triage: CreateReportSchema on web still requires lat/lon (defaults 0) so address-only submissions send 0,0 and skip backend forward geocoding; need to allow null/undefined coords and pre-submit forward geocode via backend endpoint to honor RFC.
- [x] (2025-11-26 09:10Z) Implemented nullable coords + backend forward-geocode pre-submit on web; bun run format + bun test green; bun run lint web section clean; remaining lint warnings are pre-existing in apps/api.
- [ ] (2025-11-26 10:25Z) New requirement: if forward geocode fails, attempt device geolocation automatically; if both fail, warn (do not block) while keeping coordinate inputs hidden, but encourage location permission for mapping. Implement MVP cues without new fields.
- [ ] (pending) Finalize API contract updates for create/update and new geocoding endpoints.
- [ ] (pending) Validate plan with stakeholders before implementation.

## Surprises & Discoveries

- Observation: No backend geocoding exists yet; only database migration fields reference geocoding metadata. Evidence: rg search shows only migration 006 adds geocoded_at/geocoding_source; reports data layer writes whatever address/coords are provided.
- Observation: Report updates currently require ownership; no admin override path exists for correcting locations. Evidence: apps/api/src/routes/reports/data.ts updateReport checks user_id, and core validation assumes same ownership rule.
- Observation: Frontend CreateReportSchema still treats lat/lon as required numbers with default 0, so manual address + photo submissions post lat/lon=0 and bypass backend forward geocoding. Evidence: apps/web/lib/types/api.ts uses z.number() without nullable/optional and use-report-form defaults lat/lon to 0.
- Observation: bun run lint fails in apps/web due to numerous pre-existing warnings (unused imports/icons, unescaped quotes in pages, no-html-link-for-pages, unexpected any). Evidence: turbo run lint output on 2025-11-26 shows failures before touching those files.

## Decision Log

- Decision: Align backend geocoding with existing Nominatim usage from frontend docs to stay consistent with docs/gis/rfc-geojson.md. Rationale: Shared provider simplifies parsing logic and rate limit policy. Date/Author: 2025-11-24 Codex.
- Decision: Plan includes an admin-only location correction path so lat/lon can be fixed post-submission when geocoding fails. Rationale: New RFC clause 4.5 requires admin remediation. Date/Author: 2025-11-24 Codex.
- Decision: Use requireAdmin middleware for remediation endpoints; no new role needed. Rationale: Matches current admin guard and user confirmation. Date/Author: 2025-11-24 Codex.
- Decision: Frontend must stop sending sentinel coords (0,0) when none are available; allow nullable coords and, when missing, call backend forward geocoding before submission to honor RFC auto-location flow. Rationale: Prevents reverse-geocoding garbage and lets backend enrich address-only payloads. Date/Author: 2025-11-26 Codex.
- Decision: For mapping readiness, require coords at submit time: if forward geocode fails, automatically attempt device geolocation; only block if both fail, keeping lat/lon fields hidden from the UI. Rationale: Ensures coordinates for future map features without exposing technical inputs. Date/Author: 2025-11-26 Codex.

## Outcomes & Retrospective

Planning in progress; implementation not started. Populate this after executing milestones to compare against the purpose.

## Context and Orientation

Reports feature follows 4-layer architecture. API routes live in apps/api/src/routes/reports/api.ts; business rules in core.ts; orchestration in shell.ts; persistence in data.ts; schemas in apps/api/src/schema/reports.ts. CreateReportSchema requires image_url, category, street_name, location_text, district/city/province, optional lat/lon. Core validation enforces paired lat/lon and Indonesian bounds; sanitization trims strings; no geocoding or geocoding metadata is stored. Data layer inserts provided fields only and defaults status to pending; update/delete require matching user_id. Admin middleware (requireAdmin) exists in auth routes but is not used by reports. Migration 006 adds geocoded_at and geocoding_source columns that are unused in current types.

## Plan of Work

Describe edits in prose with file paths so a novice can follow without other context.

1. Schema and type alignment (apps/api/src/schema/reports.ts and apps/api/src/routes/reports/types.ts): allow create payloads that rely on backend geocoding by making address/coordinate requirements mode-aware; add geocoding metadata fields (geocoded_at, geocoding_source, geocoding_confidence?) to types; keep backward compatibility for current clients. Define clear validation rules: if lat/lon present, reverse geocode fills missing address; if address present without coords, forward geocode best-effort; always require human-readable province/city/district/street to exist before persistence.
2. Core business rules (apps/api/src/routes/reports/core.ts): add geocoding-aware validation/sanitization helpers that enforce paired coords, acceptable bounds, and choose geocoding source precedence (exif -> nominatim -> manual). Introduce functions to merge geocoding results into payload, track failure reasons, and gate admin correction rules (admin may bypass ownership for location fixes, standard users keep current rules).
3. Geocoding services and orchestration (new module under apps/api/src/routes/reports/geocoding/ or shared services): implement Nominatim client with rate limiting, retry/backoff, and parsing to administrative fields matching frontend expectations. Shell layer (shell.ts) orchestrates create/update flows: reverse geocode when coords provided, forward geocode when only address present, set metadata (geocoded_at, geocoding_source, confidence flag), and fall back to user input when geocoding fails without blocking submission.
4. API layer adjustments (apps/api/src/routes/reports/api.ts): expose geocoding helper endpoints for the frontend (e.g., POST /api/reports/geocode/reverse and /geocode/forward) with Zod schemas; update create/update responses to surface geocoding status and parsed address so the UI can show auto-fill results; ensure error codes distinguish validation vs geocoding failure vs permission issues. Keep authentication rules: create requires auth; geocoding endpoints may require auth to manage quota.
5. Admin remediation path: add admin-specific route (apps/api/src/routes/admin/api.ts or reports/admin) guarded by requireAdmin to edit location/metadata regardless of ownership; ensure data layer update handles lat/lon/address updates and records geocoding_source as manual-admin along with verifier fields; update validation to allow null->value transitions for coordinates.
6. Testing and observability: add unit tests for core validation/merging logic and shell orchestration (success, reverse geocode fail, forward geocode fail, admin override). Add integration tests for new endpoints with mocked Nominatim responses. Update logging to structured messages without console.log. Document environment variables for geocoding base URL and rate limits.
7. Frontend alignment: update apps/web CreateReportSchema/defaults to accept nullable coords, drop 0 defaults, and pre-submit forward geocode via backend when coords are missing so address+photo flows still produce lat/lon while keeping submission resilient if geocoding fails.
8. Frontend enforcement for mapping: in apps/web (use-report-submit.ts + report-location-fields.tsx), when no coords after forward geocode, auto-attempt device geolocation; if still missing, block submission with inline error/toast. Keep lat/lon fields hidden; reuse existing location helpers where possible.

## Concrete Steps

- Workdir: /Users/mac/WebApps/projects/viralkan-app.
- Before coding: re-read .agent/PLANS.md and docs/report/improve-create-report.md to confirm scope; align with .cursor/rules/backend.mdc.
- After implementing each milestone, run reality checkpoints: `bun run format && bun test && bun run lint`.
- For geocoding client, capture expected Nominatim response samples inside tests to keep plan self-contained.
- Use multiple agents: one can own geocoding client/tests while another handles schema/core/api wiring; sync via this ExecPlan and todos.md.

## Validation and Acceptance

Feature is accepted when:

- Sending coords to POST /api/reports/geocode/reverse returns province/city/district/street parsed from Nominatim and marks geocoding_source=exif/nominatim with timestamp; when Nominatim fails, returns 200 with fallback flag and no coords mutation.
- Creating a report with only coords stores user-visible address populated from reverse geocoding; if geocoding fails, the report persists with user-provided address and geocoding_source=manual, without blocking submission.
- Creating with only address triggers forward geocoding; lat/lon are stored when available, but submission still succeeds when geocoding fails.
- Admin endpoint allows updating lat/lon/address for any report regardless of owner, records verifier fields, and passes ownership validation through requireAdmin.
- All automated checks pass (`bun run format && bun test && bun run lint`), and new tests cover success + failure paths for geocoding and admin correction.

## Idempotence and Recovery

Geocoding calls should be retry-safe and rate-limited; repeated create attempts with same payload should not duplicate geocoding metadata inconsistently. Admin correction endpoint must be deterministic and auditable (geocoded_at updates once per change). If geocoding provider is down, bypass gracefully and record failure status without rolling back the report create/update.

## Artifacts and Notes

- Initial version created 2025-11-24 to capture backend-first plan for create report improvements and admin remediation requirements.

## Interfaces and Dependencies

- Geocoding client interface (new module): function reverseGeocode(lat: number, lon: number) → { street_name, district, city, province, province_code?, regency_code?, district_code?, geocoding_source: "nominatim", geocoded_at: string, confidence?: number } | { error, geocoding_source: "nominatim" }. Similar forwardGeocode(address payload) signature.
- Core merge helper: mergeGeocodingResult(input: CreateReportInput, result) → sanitized payload with metadata.
- API schemas: new Zod schemas for geocoding endpoints; CreateReportSchema adjustments to allow backend-filled address/coord pairs while keeping human-readable fields required before DB write.
- Auth dependencies: firebaseAuthMiddleware for user create/update; requireAdmin for admin remediation route; consider rate limiting middleware for geocoding endpoints to respect provider policies.
