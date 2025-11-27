# Task List: Report Form UX & Layout Fixes

Derived from: [plan.md](./plan.md)

Reference PLANS.md rules: Tasks have stable kebab-case IDs, one task `in_progress` at a time, status explicitly marked.

---

## Task Tracking

### form-dropdown-responsive-styling
- **Status:** `pending`
- **What:** Update CSS in administrative-select.tsx to make dropdowns responsive (w-full instead of max-w-full)
- **Changes:** 6 text replacements across Province/Regency/District fields
- **Files:** `apps/web/components/reports/administrative-select.tsx`
- **Acceptance:** Dropdowns span full grid cell width at all breakpoints (375px/768px/1024px+)

### location-button-workflow-reorganize
- **Status:** `pending`
- **What:** Remove GetAddressButton from Bantuan Lokasi section; conditionally show it only when coordinates exist and address is empty
- **Changes:** Restructure location button section, add new conditional section for GetAddressButton
- **Files:** `apps/web/components/reports/report-form/fields/report-location-fields.tsx`
- **Acceptance:** LocationButton always visible; GetAddressButton appears contextually only when coordinates exist + address empty

### location-button-labels-update
- **Status:** `pending`
- **What:** Update help text in location assistance section to clarify the workflow
- **Changes:** Change "Coba lokasi otomatis atau cari berdasarkan alamat" → "Gunakan lokasi perangkat Anda untuk mengisi alamat secara otomatis"
- **Files:** `apps/web/components/reports/report-form/fields/report-location-fields.tsx`
- **Acceptance:** Help text clearly explains single-button workflow

### test-dropdown-responsive-all-sizes
- **Status:** `pending`
- **What:** Test dropdown layout at all viewport sizes (mobile 375px, tablet 768px, desktop 1024px+)
- **Acceptance:** 
  - Mobile: 1 column, dropdowns full width
  - Tablet: 2 columns
  - Desktop: 3 columns
  - Resizing window: smooth reflow, no truncation, options list doesn't overlap

### test-location-workflow-exif-success
- **Status:** `pending`
- **What:** Test location workflow when EXIF geocoding succeeds
- **Scenario:** Upload photo with GPS EXIF → Form auto-extracts and geocodes → Address auto-fills
- **Acceptance:** Bantuan Lokasi hidden, GetAddressButton not shown, address populated

### test-location-workflow-exif-fail
- **Status:** `pending`
- **What:** Test location workflow when EXIF geocoding fails
- **Scenario:** EXIF has GPS but geocoding returns no address → User clicks LocationButton → Device location → Geocoding → Address fills
- **Acceptance:** LocationButton visible and enabled, GetAddressButton contextually shows if address still empty

### test-location-workflow-manual-coords
- **Status:** `pending`
- **What:** Test location workflow when user manually enters coordinates
- **Scenario:** No EXIF, user enters lat/lon manually → GetAddressButton appears → User clicks → Geocoding → Address fills
- **Acceptance:** GetAddressButton appears when coordinates valid, button works as expected

### test-location-workflow-no-data
- **Status:** `pending`
- **What:** Test location workflow when no coordinates available (no EXIF, no geolocation)
- **Scenario:** User must manually enter data
- **Acceptance:** LocationButton disabled/helpful message shown, GetAddressButton appears once coordinates exist

### test-form-submission-end-to-end
- **Status:** `pending`
- **What:** Verify form submission works with new layout and workflow
- **Scenario:** Fill form via location workflow → Submit → No validation errors, all fields captured
- **Acceptance:** Form submits successfully, address/province/regency/district all populated

### final-review-cleanup
- **Status:** `pending`
- **What:** Final code review, ensure no console errors, verify no unintended side effects
- **Acceptance:** No errors in browser console, form behaves as designed across scenarios

---

## Notes

- **Dropdowns:** 6 changes total (3 wrapper divs + 3 ComboboxField classNames)
- **Location buttons:** ~20–30 lines changed (remove dual-button, add conditional new section, update text)
- **Testing:** 4 main scenarios + responsiveness test = ~5 workflow paths to validate
- **Complexity:** Low (CSS + conditional render, no state logic changes)

---

## Status Overview

- Total tasks: 10
- Pending: 10
- In Progress: 0
- Completed: 0
