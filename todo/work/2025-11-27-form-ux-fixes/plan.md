# Report Form UX & Layout Fixes (Dropdown Responsiveness & Location Button Clarity)

This ExecPlan addresses two distinct but related issues in the report form: (1) dropdown fields not being responsive due to fixed sizing, and (2) confusing location assistance UX with redundant buttons.

This is a living document. Sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept updated as work proceeds.

Reference: [../../.agent/PLANS.md](../../.agent/PLANS.md) — follow all requirements and formatting rules from that file.

---

## Purpose / Big Picture

### What users gain

**Issue 1 – Dropdown Responsiveness:**
Currently, the three administrative dropdowns (Provinsi, Kabupaten/Kota, Kecamatan) in `administrative-select.tsx` have fixed `max-w-full` width constraints that don't scale with their parent container. On responsive layouts (mobile, tablets), the dropdowns appear cramped and don't adapt to available space, breaking the form's visual rhythm.

After this change: dropdowns will be fluid, filling available space on all viewport sizes. They will scale intelligently with grid layout changes (1 column on mobile, 2 on tablet, 3 on desktop).

**Issue 2 – Location Button Redundancy:**
The "Bantuan Lokasi" (Location Assistance) section in `report-location-fields.tsx` presents two buttons with overlapping purposes:
- "Gunakan Lokasi Saat Ini" (Use Current Location) — acquires device geolocation
- "Dapatkan Alamat" (Get Address) — geocodes existing coordinates

Users don't know which to use first or why. This creates cognitive load and workflow confusion.

After this change: the UX will follow RFC guidance: "Dapatkan Alamat" only appears when user has valid coordinates AND no address has been found (empty address field). This makes the workflow contextual and clear.

---

## Progress

- [x] (2025-11-27 09:30Z) Finalized location workflow design based on user answers
- [x] (2025-11-27 09:35Z) Implemented dropdown CSS changes (max-w-full → w-full in 6 places)
  - Province wrapper: max-w-full → w-full ✓
  - Province ComboboxField: "max-w-full truncate" → "w-full" ✓
  - Regency wrapper: max-w-full → w-full ✓
  - Regency ComboboxField: "max-w-full truncate" → "w-full" ✓
  - District wrapper: max-w-full → w-full ✓
  - District ComboboxField: "max-w-full truncate" → "w-full" ✓
- [x] (2025-11-27 09:40Z) Implemented location button reorganization
  - Removed GetAddressButton from Bantuan Lokasi section ✓
  - Updated help text: "Gunakan lokasi perangkat Anda untuk mengisi alamat secara otomatis" ✓
  - Added new conditional section "Cari Alamat dari Koordinat" below textarea ✓
  - GetAddressButton now shows only when: isFormActivated && hasValidCoordinates && !location_text && handleGetAddressFromCoordinates ✓
- [x] (2025-11-27 09:50Z) Fixed location button condition (user feedback)
  - Added !form.watch("location_text") check ✓
  - Button now only shows when address field is EMPTY ✓
  - Prevents showing "Cari Alamat" after successful geolocation+geocoding ✓
- [ ] (in-progress) Test responsiveness across breakpoints (375px, 768px, 1024px+)
- [ ] (pending) Test location workflow with various scenarios (EXIF success, EXIF fail, manual coords)
- [ ] (pending) Validate form submission works end-to-end
- [ ] (pending) Final review and cleanup

---

## Surprises & Discoveries

- **Discovery 1:** The dropdown width constraints were redundant on two levels: the wrapper div had `max-w-full` AND the ComboboxField itself had `"max-w-full truncate"`. Removing both allows the grid layout to properly manage width across breakpoints.
- **Discovery 2 (User Feedback):** Initial implementation of "Cari Alamat dari Koordinat" section was missing a critical condition. The section was showing even after successful geolocation+geocoding (when address was already filled). Added `!form.watch("location_text")` check to prevent this.
- **Implementation note:** All CSS changes were straightforward text replacements. No logic changes required.
- **UX Refinement:** The additional condition check ensures progressive disclosure is truly contextual - button only appears when user actually needs it (has coordinates but address is still empty).

---

## Decision Log

### Decision 1: Location Workflow Design
**Decision:** Follow RFC guidance—show "Dapatkan Alamat" button only when:
1. User has valid coordinates (from EXIF, device geolocation, or manual entry)
2. Address field (`location_text`) is empty OR geocoding from EXIF failed
3. Form is activated

**Rationale:** This provides a contextual, progressive disclosure workflow rather than always showing both buttons. Pro: clear intent, reduces cognitive load. Con: button appears/disappears dynamically. User will see it only when it's actionable.

**Alternatives considered:**
- A) Always show both buttons → Confusing (current state)
- B) Remove "Dapatkan Alamat" entirely → Loses fallback if EXIF geocoding fails
- C) Separate coordinates section with conditional button → More complex UI, adds extra scrolling
- D) **Show button contextually based on state** ← CHOSEN (best balance of clarity + functionality)

**Date:** 2025-11-27

---

## Outcomes & Retrospective

(To be completed at the end of work)

---

## Context and Orientation

### File Structure

**Core files to modify:**
1. `apps/web/components/reports/administrative-select.tsx` — Dropdown CSS/layout
2. `apps/web/components/reports/report-form/fields/report-location-fields.tsx` — Location button reorganization
3. `apps/web/components/reports/report-form/location-button.tsx` — Label simplification (minor)

**Related files (for context, no changes):**
- `apps/web/components/reports/report-form/get-address-button.tsx` — Button component
- `apps/web/components/reports/report-form/report-form-context.tsx` — State management

### Current State Analysis

**Dropdown Issue:**
- File: `apps/web/components/reports/administrative-select.tsx` (lines ~340–450)
- Grid layout: `grid grid-cols-1 gap-6 transition-all duration-300 md:grid-cols-2 lg:grid-cols-3`
- Each field wrapper: `<div className="max-w-full">` ← Constrains width
- ComboboxField class: `className={cn(enhancedGeocodingClasses, "max-w-full truncate")}` ← Further constrains
- **Problem:** Double constraint prevents natural grid expansion

**Location Button Issue:**
- File: `apps/web/components/reports/report-form/fields/report-location-fields.tsx` (lines ~30–60)
- Current: Two buttons always shown together when `isFormActivated && shouldShowLocationButtons`
- LocationButton: `getCurrentLocation()` → gets device coords → starts geocoding
- GetAddressButton: `handleGetAddressFromCoordinates()` → requires existing coords, geocodes them
- **Problem:** User sees both equally; doesn't understand the relationship or flow
- **RFC guidance:** These are not parallel actions; they're sequential. Get coordinates first (from device or EXIF), then optionally get address from those coordinates.

### Design Principles (from RFC)

The RFC establishes that location operations should be:
1. Contextual — show actions only when relevant state exists
2. Progressive — build on prior steps (get coords → optionally get address)
3. Unified — single loading state, clear outcome

---

## Plan of Work

### Milestone 1: Fix Dropdown Responsiveness

**Goal:** Dropdowns expand to fill grid cells at all breakpoints (1 col mobile → 2 col tablet → 3 col desktop).

**Changes in `administrative-select.tsx`:**

1. Find Province field wrapper (around line 340):
   - Change: `<div className="max-w-full">` → `<div className="w-full">`
   
2. Find Province ComboboxField className (around line 375):
   - Change: `className={cn(enhancedGeocodingClasses, "max-w-full truncate")}` → `className={cn(enhancedGeocodingClasses, "w-full")}`
   
3. Repeat for Regency field (around line 425):
   - Wrapper: `max-w-full` → `w-full`
   - ComboboxField: `"max-w-full truncate"` → `"w-full"`
   
4. Repeat for District field (around line 510):
   - Wrapper: `max-w-full` → `w-full`
   - ComboboxField: `"max-w-full truncate"` → `"w-full"`

**Expected outcome:** CSS width is now driven by grid layout; dropdowns scale responsively.

### Milestone 2: Reorganize Location Button Workflow

**Goal:** Show "Dapatkan Alamat" button only when it's contextually relevant (has coordinates, address is empty).

**Current structure in `report-location-fields.tsx` (lines ~45–60):**
```tsx
{isFormActivated && shouldShowLocationButtons && (
  <div className="mt-4 space-y-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
    <p className="text-sm font-semibold text-neutral-900">Bantuan Lokasi</p>
    <p className="text-sm text-neutral-600">Coba lokasi otomatis atau cari berdasarkan alamat.</p>
    <div className="flex flex-col gap-3 md:flex-row">
      {getCurrentLocation && <LocationButton ... />}
      {handleGetAddressFromCoordinates && <GetAddressButton ... />}
    </div>
  </div>
)}
```

**New structure:**
- Always show LocationButton in "Bantuan Lokasi" section (primary action: get coordinates)
- Show GetAddressButton only when ALL conditions met:
  - Coordinates are valid (hasValidCoordinates = true)
  - Address field is empty OR geocoding from EXIF failed
  - Form is activated
- Place GetAddressButton in a secondary section below address textarea (not in Bantuan Lokasi)
- Update help text to clarify the workflow

**Changes:**

1. In "Bantuan Lokasi" section:
   - Keep only LocationButton
   - Update help text: "Gunakan lokasi perangkat Anda untuk mengisi alamat secara otomatis" (Use your device location to auto-fill address)
   - Remove GetAddressButton

2. After Deskripsi Lokasi textarea (around line 80):
   - Add new section "Cari Alamat dari Koordinat" (Find Address from Coordinates)
   - Conditionally show GetAddressButton only if:
     - hasValidCoordinates = true
     - location_text (address field) is empty OR geocodingFromExifSucceeded = false
   - Help text: "Jika Anda memiliki koordinat tetapi alamat belum diisi, gunakan tombol di bawah untuk mencari alamat"

### Milestone 3: Validation & Testing

**Goal:** Confirm dropdowns are responsive and location workflow is clear and functional.

**Test scenarios:**

1. **Dropdown Responsiveness:**
   - Mobile (375px): All 3 dropdowns in 1 column, each full width
   - Tablet (768px): 2 columns (Province + Kabupaten/Kota in row 1, Kecamatan in row 2)
   - Desktop (1024px+): 3 columns (all side by side)
   - Verify no text truncation or overflow
   - Verify options list opens without overlapping

2. **Location Workflow:**
   
   **Scenario A – EXIF geocoding succeeds:**
   - Photo has GPS EXIF data
   - Form auto-extracts EXIF → geocodes → fills address
   - Bantuan Lokasi button should be hidden (EXIF succeeded)
   - GetAddressButton should not appear
   - ✓ Workflow: Automatic, user doesn't need to click anything
   
   **Scenario B – EXIF geocoding fails:**
   - Photo has GPS EXIF data but geocoding returns no address
   - Bantuan Lokasi section shows with LocationButton
   - GetAddressButton not yet visible (no coordinates entered)
   - User clicks LocationButton → device location → geocoding → address filled
   - ✓ Workflow: One clear button, one action
   
   **Scenario C – No EXIF, manual coordinates:**
   - No EXIF data
   - Bantuan Lokasi shows with LocationButton
   - User clicks LocationButton → location acquired → coordinates and address filled
   - If somehow address is still empty, GetAddressButton appears below textarea
   - User can click to retry geocoding
   - ✓ Workflow: Clear primary button, optional secondary button
   
   **Scenario D – All manual:**
   - No EXIF, no geolocation permission
   - Bantuan Lokasi button is disabled or not shown
   - User manually enters coordinates
   - GetAddressButton appears and is enabled
   - User clicks to geocode those coordinates
   - ✓ Workflow: Button appears when data exists to act on

3. **Form submission:**
   - After all fields filled (via any workflow above), form submits successfully
   - No validation errors
   - Address, province, regency, district all captured

---

## Concrete Steps

(To be executed after approval. See todos.md for task tracking.)

1. Edit `apps/web/components/reports/administrative-select.tsx`
   - 6 text replacements (3 wrapper divs, 3 ComboboxField classNames)

2. Edit `apps/web/components/reports/report-form/fields/report-location-fields.tsx`
   - Remove GetAddressButton from Bantuan Lokasi section
   - Update help text
   - Add new conditional section for GetAddressButton below textarea

3. Open dev server and test across viewport sizes
4. Test all 4 location workflow scenarios above
5. Verify form submission works

---

## Validation and Acceptance

### Dropdown Responsiveness

- [ ] Mobile (375px): Dropdowns display in 1 column, 100% width, no truncation
- [ ] Tablet (768px): Dropdowns display in 2 columns
- [ ] Desktop (1024px+): Dropdowns display in 3 columns
- [ ] Resizing browser window: Layout reflows smoothly
- [ ] Options list: Opens without overlapping adjacent fields

### Location Workflow

- [ ] "Bantuan Lokasi" always shows LocationButton (when form activated)
- [ ] Clicking LocationButton triggers device geolocation + geocoding together
- [ ] GetAddressButton appears only when coordinates exist and address is empty/failed
- [ ] GetAddressButton is disabled/hidden when coordinates are invalid
- [ ] Clicking GetAddressButton geocodes coordinates and fills address
- [ ] All 4 scenarios above work as described
- [ ] Form submission works end-to-end

### Acceptance

✓ Acceptance = dropdowns responsive on all sizes + location workflow is clear and functional on all scenarios

---

## Idempotence and Recovery

- All changes are CSS rewrites and conditional render logic
- No state mutations or data migrations
- Revert by restoring original `max-w-full` classes and dual-button layout
- If responsive dropdowns don't work, add explicit `max-w-none` to override any Tailwind defaults
- If location button reorganization causes issues, can quickly restore dual-button layout

---

## Artifacts and Notes

### Dropdown: Before → After

**Before:**
```tsx
<div className="grid grid-cols-1 gap-6 transition-all duration-300 md:grid-cols-2 lg:grid-cols-3">
  <div className="max-w-full">
    <FormField ... render={() => (
      <FormItem>
        <ComboboxField ... className={cn(..., "max-w-full truncate")} />
```

**After:**
```tsx
<div className="grid grid-cols-1 gap-6 transition-all duration-300 md:grid-cols-2 lg:grid-cols-3">
  <div className="w-full">
    <FormField ... render={() => (
      <FormItem>
        <ComboboxField ... className={cn(..., "w-full")} />
```

### Location Buttons: Before → After

**Before:**
```tsx
{isFormActivated && shouldShowLocationButtons && (
  <div className="mt-4 space-y-3 ...">
    <p>Bantuan Lokasi</p>
    <p>Coba lokasi otomatis atau cari berdasarkan alamat.</p>
    <div className="flex flex-col gap-3 md:flex-row">
      <LocationButton ... />           {/* Always shown */}
      <GetAddressButton ... />         {/* Always shown */}
    </div>
  </div>
)}
```

**After:**
```tsx
{isFormActivated && shouldShowLocationButtons && (
  <div className="mt-4 space-y-3 ...">
    <p>Bantuan Lokasi</p>
    <p>Gunakan lokasi perangkat Anda untuk mengisi alamat secara otomatis.</p>
    <LocationButton ... />             {/* Only button in this section */}
  </div>
)}

{/* New section below textarea */}
{isFormActivated && hasValidCoordinates && (locationText === "" || !geocodingFromExifSucceeded) && (
  <div className="mt-4 space-y-3 ...">
    <p>Cari Alamat dari Koordinat</p>
    <p>Jika Anda memiliki koordinat tetapi alamat belum diisi, gunakan tombol di bawah untuk mencari alamat.</p>
    <GetAddressButton ... />           {/* Contextually shown */}
  </div>
)}
```

---

## Interfaces and Dependencies

**Components Modified:**
- `apps/web/components/reports/administrative-select.tsx` — CSS updates to 3 fields
- `apps/web/components/reports/report-form/fields/report-location-fields.tsx` — Restructure location buttons

**Components Used (no changes):**
- `ComboboxField` — Receives `w-full` className instead of `max-w-full truncate`
- `LocationButton` — Same props, same behavior
- `GetAddressButton` — Moved to new section, same props, same behavior

**Hooks & Context (no changes):**
- `useReportFormContext()` — Unchanged
- `useImageContext()` — Unchanged
- `useLocationContext()` — Unchanged
- `useReportFormActionsContext()` — Unchanged

---

## Plan Revision History

- **2025-11-27:** Initial plan created. Location workflow designed to follow RFC guidance: show "Dapatkan Alamat" contextually based on coordinates + address field state.
