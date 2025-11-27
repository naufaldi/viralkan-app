# Fix current-location administrative auto-fill for report form

This ExecPlan is a living document. Maintain all sections (`Progress`, `Surprises & Discoveries`, `Decision Log`, `Outcomes & Retrospective`) as work proceeds. Follow repository planning rules in `.agent/PLANS.md`. Tasks for this plan live in `todo/work/2025-11-26-location-sync/todos.md` and must stay aligned.

## Purpose / Big Picture

Users clicking “Gunakan Lokasi Saat Ini” should see province, city/regency, and district auto-filled to match the geocoded location without manual picking. Today the toast shows the location name, but the administrative selects remain empty/disabled, blocking submission. The goal is to diagnose and fix the sync between geocoding results and the administrative selects so the form is ready to submit after location is acquired.

## Progress

- [x] (2025-11-26 00:00Z) Created plan skeleton and captured purpose.
- [x] (2025-11-26 12:30Z) Reviewed form contexts, location fields/buttons, administrative select flow, and use-report-location geocoding/admin sync.
- [x] (2025-11-26 13:15Z) Implemented ISO province fallback in geocoding parser to surface province name (e.g., ID-JK -> DKI Jakarta); added parent-code injection for dynamic options in location hook.
- [ ] (2025-11-26 00:00Z) Validate manually (current-location flow) and document outcomes.

## Surprises & Discoveries

- None yet.

## Decision Log

- Decision: Administrative dynamic options must include parent codes to populate combobox queries keyed by province/regency codes; added debug logging (non-prod) and fallback option injection when geocoding sets values.
  Rationale: Without province_code/regency_code the options were cached under an undefined key, so selects never saw the geocoded values.
  Date/Author: 2025-11-26 / Codex

## Outcomes & Retrospective

- To be written after validation.

## Context and Orientation

Relevant files for the report form:

- `apps/web/components/reports/create-report-form.tsx` wires the form.
- `apps/web/components/reports/report-form/report-form-provider.tsx` and `report-form-context.tsx` expose form, image, location, and actions contexts.
- `apps/web/hooks/reports/use-report-form.ts` bundles image, location, submit hooks.
- `apps/web/hooks/reports/use-report-location.ts` handles geolocation, reverse geocoding, administrative application, and toast messaging.
- `apps/web/lib/services/geocoding.ts` provides reverse/forward geocoding; `processNominatimAddressWithAPI` in `apps/web/lib/utils/enhanced-geocoding-handler.ts` enriches administrative mapping.
- UI selects live in `apps/web/components/reports/administrative-select.tsx`, which uses `useAdministrative` (data fetcher) and `useAdministrativeSync` (fuzzy mapping) and is consumed via `ReportAddressFields`.

Known symptoms:

- Toast after “Gunakan Lokasi Saat Ini” shows a district/city string (e.g., Tanah Abang, Jakarta Pusat), but province/city/district selects remain empty/disabled.
- Previous change added dynamic option insertion, but behavior still missing, suggesting values may not be set, codes don’t match available options, or select activation gating prevents display.

## Plan of Work

Milestone 1: Trace data flow end-to-end for current-location click. Inspect `use-report-location` geolocation handler, what it sets on the form (`lat`, `lon`, `province`, `province_code`, etc.), and whether `applyAdministrativeSearchResults` or `applyGeocodingAdministrativeFallbacks` writes both names and codes. Confirm `ReportAddressFields` passes context props to `AdministrativeSelect` and that `AdministrativeSelect` enables when form activated.

Milestone 2: Inspect option sources and sync: check `useAdministrative` responses and query keys, and ensure the dynamic option insertion runs after geocode values are set. Verify select `value` props use codes, and options contain matching codes. Validate form activation state doesn’t disable selects after geolocation.

Milestone 3: Implement targeted fixes: e.g., ensure `applyGeocodingAdministrativeFallbacks` sets names/codes consistently; trigger `processGeocoding` / `applyToForm` or manual addDynamicOption with codes/names; ensure administrative selects re-render with values; confirm `isFormActivated` gating is satisfied post-location; and avoid double `useAdministrative` calls. Keep changes minimal and in aligned layers (hooks vs UI).

Milestone 4: Validation: run scoped lint on touched files, run `bun run lint --filter=web` if feasible, and manually exercise “Gunakan Lokasi Saat Ini” to confirm selects are populated with the geocoded administrative levels.

## Concrete Steps

All commands run from repo root unless stated.

1. Read flow files: `apps/web/hooks/reports/use-report-location.ts`, `apps/web/components/reports/administrative-select.tsx`, `apps/web/lib/utils/enhanced-geocoding-handler.ts`, `apps/web/hooks/reports/use-report-form.ts`, `apps/web/components/reports/report-form/fields/report-address-fields.tsx`.
2. Instrument/inspect state changes (via code review; no logging in production) to locate missing updates.
3. Apply code fixes per findings (hooks/UI as needed).
4. Run lint for touched area: `cd apps/web && bunx next lint --max-warnings 0 --file components/reports/administrative-select.tsx` and consider `bun run lint --filter=web`.
5. Manual check: start web (`bun run dev` at root or `turbo dev --filter=web`), go to create report, click “Gunakan Lokasi Saat Ini”, observe province/city/district pre-filled.

## Validation and Acceptance

Acceptance: After clicking “Gunakan Lokasi Saat Ini”, the administrative selects show the province, city/regency, and district matching the toast message (codes/names aligned), fields are enabled for edits, and form passes client-side validation without manual administrative selection. Lint for modified files passes.

## Idempotence and Recovery

Repeated geolocation attempts should update the same fields safely. If a geocoding call fails, selects remain user-editable. Changes will be confined to hooks/components; no migrations or destructive steps.

## Artifacts and Notes

- Capture any relevant lint output and manual test notes in this plan’s `Surprises & Discoveries` or `Outcomes` once available.

## Interfaces and Dependencies

- `use-report-location` must set `province`, `province_code`, `city` (regency name), `regency_code`, `district`, `district_code` when geocoding succeeds.
- `AdministrativeSelect` expects options with matching codes and uses `form.watch` values to set combobox `value`; dynamic options must be inserted when codes/names aren’t present in fetched lists yet.
- `useAdministrative` provides province/regency/district options keyed by codes; ensure only one instance is used in the select component to avoid duplicate calls.

---

Revision note: Initial creation of plan (2025-11-26) to investigate/fix administrative auto-fill after current-location use.
