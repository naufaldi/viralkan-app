# Create Report UX Simplification (Single Flow, Clear Guidance)

This ExecPlan is a living document maintained per .agent/PLANS.md and paired with todo/work/2025-11-26-create-report-ux/todos.md. Update all sections as work proceeds.

## Purpose / Big Picture

Make the create report form feel effortless and non-redundant by removing the auto/manual mode toggle, consolidating guidance, and applying ux-principle.md. After the change, users see one clear flow: upload/take a photo, system auto-attempts location from EXIF/device, and the form guides them to fill/confirm address and description with minimal clutter.

## Progress

- [x] (2025-11-26 03:00Z) Captured current UX pain: duplicate captions, legacy tabs, overloaded helper text, unclear activation states. Confirmed need for single-flow layout aligned with ux-principle.md.
- [x] (2025-11-26 04:00Z) Consolidated location assistance into single block and simplified photo step copy; prettier run clean.
- [x] (2025-11-26 04:20Z) Fixed type issue in location fields types and ensured formatting passes.
- [ ] (pending) Finalize remaining layout/content refinements and polish.
- [ ] (pending) Validate against ux-principle and test interactions.

## Surprises & Discoveries

- Observation: Report form context already derives mode from EXIF presence, but UI still shows legacy helper blocks and redundant copy. Evidence: create-report-form.tsx + screenshots.
- Observation: Location/coordinate helpers appear in multiple spots, causing cognitive overload. Evidence: report-location-fields.tsx shows multiple helper buttons stacked (get coords, get address, get current location).

## Decision Log

- Decision: Single flow, no tabs; photo-driven path first, manual address as fallback, keep coordinates hidden/secondary. Rationale: aligns with RFC and ux-principle to reduce choice overload. Date/Author: 2025-11-26 Codex.

## Outcomes & Retrospective

To be filled after implementation and validation.

## Context and Orientation

Frontend feature lives in apps/web/components/reports. Form shell: create-report-form.tsx. Context provider: report-form-provider.tsx. Fields: report-form/fields/\* (address, location, category). Current UI: legacy auto/manual tabs, multiple helper banners, duplicated instructions. UX principles in docs/ux-principle.md emphasize Hick’s Law, proximity, minimal visible choices, clear hierarchy. Goal: remove tabs, simplify helper text, reorganize layout into sections: 1) Foto, 2) Lokasi (auto attempt + manual fallback), 3) Deskripsi. Activation: form currently locked until photo selected; keep but make messaging concise.

## Plan of Work

1. Content audit and copy rewrite: create succinct helper text blocks (one for photo expectations, one for location fallback). Remove redundant captions and “mode” banners. Align tone with ux-principle.md (clear, concise).
2. Layout simplification: restructure create-report-form.tsx to a single vertical flow with section headers and lightweight dividers; move ExifWarning adjacent to location helper instead of separate block. Make action buttons (get location, get coords from address) grouped under one “Bantuan Lokasi” card.
3. Interaction rules: default to auto-attempt (EXIF/device). Show a single fallback button set: “Gunakan lokasi perangkat” and “Cari koordinat dari alamat” only when needed. Hide lat/lon inputs unless user opts to edit/override (or keep minimal with helper text).
4. Visual clean-up: adjust spacing, backgrounds, and icon usage to reduce noise; follow typography hierarchy from ux-principle (section titles, helper text). Ensure CTA “Bagikan Laporan” remains fixed location after activation.
5. QA and polish: test on mobile/desktop; verify activation flows (photo uploaded enables form), error states (missing fields), and geocoding helper visibility. Update screenshots/docs references if needed.

## Concrete Steps

- Workdir: /Users/mac/WebApps/projects/viralkan-app.
- Read docs/ux-principle.md and current form components.
- Implement layout/content changes in create-report-form.tsx and relevant field components.
- Keep device/location helper buttons within a single “Bantuan Lokasi” area.
- Run checks after edits: bun run format && bun run lint; exercise form manually if possible.

## Validation and Acceptance

Accepted when: UI shows single-flow form without tabs; helper text is concise and non-duplicative; photo upload clearly starts the flow; location assistance is grouped and unobtrusive; form passes lint/format; manual and EXIF/device paths are usable on mobile/desktop.

## Idempotence and Recovery

Edits are UI-only; can be reapplied safely. If layout issues arise, revert to previous snapshot via git. Keep helper copy centralized in components to ease future tweaks.

## Artifacts and Notes

- Plan references PLANS.md and ux-principle.md for design alignment. No code changes yet.

## Interfaces and Dependencies

- Components touched: apps/web/components/reports/create-report-form.tsx, report-form/fields/report-location-fields.tsx, report-form/fields/report-address-fields.tsx (if helper copy moves), shared UI components from @repo/ui.
