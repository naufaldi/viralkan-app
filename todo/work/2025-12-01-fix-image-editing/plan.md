# Fix Image Editing in Report Form

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This plan references the PLANS.md file at `/Users/mac/WebApps/projects/viralkan-app/.agent/PLANS.md` and must be maintained in accordance with that template.

Corresponding task list: `/Users/mac/WebApps/projects/viralkan-app/todo/work/2025-12-01-fix-image-editing/todos.md`

## Purpose / Big Picture

Currently, users cannot properly remove existing images when editing reports. This creates a poor user experience where users are forced to either keep the old image or struggle to replace it. After this change, users will be able to:

1. **Replace images seamlessly** - Replace old images with new ones from gallery or camera
2. **Remove existing images for replacement** - Click a remove button to clear the current image when editing
3. **Use both upload and camera** - Can replace images using either gallery upload or camera capture
4. **Must have image in edit mode** - All edited reports must have an image (can't save without image)

Users can observe this working by navigating to `/laporan/[id]/edit` on an existing report with an image, clicking the remove (X) button, then using either camera or gallery to select a new image before saving.

## Progress

- [x] Phase 0: Plan updated with new requirements (camera/gallery support, mandatory image in edit mode)
- [ ] **Phase 1: Update image removal logic in useReportImage hook** (in_progress)
- [ ] Phase 2: Fix form validation to require images in both create and edit modes
- [ ] Phase 3: Update image upload component to support camera and gallery for replacement
- [ ] Phase 4: Update form context and submit logic
- [ ] Phase 5: Update ReportFormActions component for proper button text and logic
- [ ] Phase 6: Test all scenarios end-to-end including camera and gallery
- [ ] Phase 7: Run linting and type checking

## Surprises & Discoveries

- Observation: Current `handleImageRemove` function clears selected image but doesn't handle edit mode state
  Evidence: Line 150-158 in `use-report-image.ts` shows remove function doesn't distinguish between create/edit modes
- Observation: Submit validation requires image for all modes, not just create
  Evidence: Line 139 in `use-report-submit.ts` shows `!selectedImage && !isEditing` logic
- Observation: Image upload component receives `initialImageUrl` but remove handler doesn't know about edit state
  Evidence: `image-upload.tsx` component handles preview but remove callback is generic

## Decision Log

- Decision: Pass `isEditing` flag through image removal chain instead of creating separate handlers
  Rationale: Maintains existing API while adding edit mode awareness, reduces code duplication
  Date/Author: 2025-12-01 / AI Assistant

- Decision: Update form validation to always require image in edit mode (either existing or new)
  Rationale: Ensures all edited reports maintain image requirement for consistency
  Date/Author: 2025-12-01 / AI Assistant

- Decision: Support both camera and gallery for image replacement in edit mode
  Rationale: Provides flexibility for users to replace images using their preferred method
  Date/Author: 2025-12-01 / AI Assistant

## Outcomes & Retrospective

## Context and Orientation

The Viralkan app has a report editing feature where users can modify existing road damage reports. Currently, the image handling in edit mode has these issues:

**Current Files Involved:**

- `apps/web/app/laporan/[id]/edit/page.tsx` - Edit page that loads existing report data
- `apps/web/components/reports/create-report-form.tsx` - Form component used for both create/edit
- `apps/web/components/forms/image-upload.tsx` - Image upload component with remove functionality
- `apps/web/hooks/reports/use-report-image.ts` - Image state management hook
- `apps/web/hooks/reports/use-report-submit.ts` - Form submission logic with validation
- `apps/web/hooks/reports/use-report-form.ts` - Main form hook orchestrating all sub-hooks

**Key Terms:**

- **Edit Mode**: When `isEditing=true`, indicates we're modifying an existing report
- **Initial Data**: `initialData` contains the existing report information including `image_url`
- **Image Removal**: The act of clearing a selected or existing image from the form for replacement
- **Mandatory Image**: In edit mode, image is required (either existing or new upload/camera)
- **Image Replacement**: Process of removing existing image and adding new image via camera or gallery

## Plan of Work

Describe, in prose, the sequence of edits and additions. For each edit, name the file and location (function, module) and what to insert or change. Keep it concrete and minimal.

### Phase 1: Update Image Removal Logic

**File: `apps/web/hooks/reports/use-report-image.ts`**

Modify the `handleImageRemove` function to accept and handle edit mode. The function currently clears the selected image but needs to know if we're in edit mode to handle `image_url` properly.

**Changes:**

1. Add `isEditing` parameter to `handleImageRemove` function signature
2. Update function logic to clear form `image_url` when in edit mode and image is removed
3. Ensure EXIF data and geocoding state is cleared properly

### Phase 2: Fix Form Validation

**File: `apps/web/hooks/reports/use-report-submit.ts`**

Update the submit validation logic to allow empty images in edit mode. Currently, the validation requires an image for all cases except when `isEditing=true`.

**Changes:**

1. Modify image requirement validation to check for existing image in edit mode
2. Update logic to allow `image_url=""` when in edit mode and no new image selected
3. Ensure proper error handling for edit mode scenarios

### Phase 3: Update Component Interface

**File: `apps/web/components/forms/image-upload.tsx`**

Update the remove handler interface to pass edit mode information through the component chain.

**Changes:**

1. Add `isEditing` prop to `ImageUploadProps` interface
2. Update `handleRemoveImage` calls to pass edit mode flag
3. Ensure `onImageRemove` callback receives edit mode context

### Phase 4: Update Form Context

**File: `apps/web/hooks/reports/use-report-form.ts`**

Ensure the form hook properly passes edit mode flags through the image handling chain.

**Changes:**

1. Update `handleImageRemove` call to pass `isEditing` flag
2. Verify form reset logic works correctly with image removal in edit mode
3. Ensure proper state management during image operations

### Phase 5: Component Updates

**File: `apps/web/components/reports/create-report-form.tsx`**

Verify and update the component to properly pass edit mode information.

**Changes:**

1. Ensure `isEditing` prop is correctly passed to image upload components
2. Verify `initialData` flow works with image removal functionality

**File: `apps/web/components/reports/report-form/report-form-actions.tsx`**

Update ReportFormActions to show correct button text and logic for edit mode.

**Changes:**

1. Update button text to show "Simpan Perubahan" in edit mode vs "Bagikan Laporan" in create mode
2. Update disabled logic to require image in both create and edit modes
3. Ensure proper loading states for both camera and upload operations

## Concrete Steps

### Implementation Steps

1. **Start from project root:**

   ```bash
   cd /Users/mac/WebApps/projects/viralkan-app
   ```

2. **Run initial tests to establish baseline:**

   ```bash
   cd apps/api && bun test
   ```

   Expected: Tests should pass with current functionality

3. **Start development server:**

   ```bash
   cd /Users/mac/WebApps/projects/viralkan-app && bun run dev
   ```

   Expected: API server on :3000, Web server on :3000

4. **Test current edit functionality:**
   - Navigate to `/laporan/[id]/edit` (use actual report ID)
   - Try to remove existing image using X button
   - Try to replace image using "Ganti Foto" button
   - Observe current behavior and issues

5. **Apply changes systematically (Phase 1-4)**:
   - Edit each file as specified in Plan of Work
   - Test after each phase using step 4

6. **Run linting and type checking:**

   ```bash
   cd /Users/mac/WebApps/projects/viralkan-app && bun run lint && bun run check-types
   ```

   Expected: No linting errors or type errors

7. **Run tests to verify no regressions:**
   ```bash
   cd apps/api && bun test
   ```
   Expected: All tests pass

### Testing Scenarios

**Test Scenario 1: Remove and Replace Image in Edit Mode**

1. Navigate to edit page for report with existing image
2. Click remove (X) button on existing image
3. Verify image area shows upload/camera interface
4. Select new image from gallery or camera
5. Submit form
6. Expected: Report saves with new image URL

**Test Scenario 2: Replace Image with Gallery**

1. Navigate to edit page for report with existing image
2. Click "Ganti Foto" button
3. Select new image from gallery
4. Verify new image appears
5. Submit form
6. Expected: Report saves with new image URL

**Test Scenario 3: Replace Image with Camera**

1. Navigate to edit page for report with existing image
2. Click "Ambil Foto Baru" button
3. Capture new image with camera
4. Verify new image appears
5. Submit form
6. Expected: Report saves with new image URL

**Test Scenario 4: Prevent Save Without Image in Edit Mode**

1. Navigate to edit page for report with existing image
2. Click remove (X) button on existing image
3. Try to submit form without selecting new image
4. Expected: Form validation prevents submission with error message

**Test Scenario 5: Keep Image in Edit Mode**

1. Navigate to edit page for report with existing image
2. Make other form changes without touching image
3. Submit form
4. Expected: Report saves with existing image unchanged

## Validation and Acceptance

**Acceptance Criteria:**

1. **Image Removal Works for Replacement**: Users can remove existing images in edit mode
   - Input: Click remove button on existing image
   - Output: Image area shows upload/camera interface for new image selection
   - Test: Navigate to `/laporan/[id]/edit`, click X button, upload new image

2. **Image Replacement with Gallery**: Users can replace existing images using gallery upload
   - Input: Click "Ganti Foto", select image from gallery
   - Output: New image replaces old image, form submits with new image URL
   - Test: Navigate to `/laporan/[id]/edit`, click "Ganti Foto", upload new image

3. **Image Replacement with Camera**: Users can replace existing images using camera
   - Input: Click "Ambil Foto Baru", capture new image with camera
   - Output: New image replaces old image, form submits with new image URL
   - Test: Navigate to `/laporan/[id]/edit`, click "Ambil Foto Baru", capture image

4. **Mandatory Image in Edit Mode**: All edited reports must have an image
   - Input: Edit report, remove image, submit without new image selection
   - Output: Form validation prevents submission with error message
   - Test: Edit form with image removal, try to submit without new image

5. **Create Mode Unchanged**: Image requirement still works in create mode
   - Input: Create new report without selecting image
   - Output: Form validation prevents submission with error message
   - Test: Navigate to `/laporan/baru`, try to submit without image

**Validation Commands:**

```bash
# Run full test suite
cd apps/api && bun test

# Check code quality
cd /Users/mac/WebApps/projects/viralkan-app && bun run lint && bun run check-types

# Manual testing
# Navigate to edit page and test image removal/replacement scenarios
```

## Idempotence and Recovery

**Safe Implementation:**

- All changes are additive and can be rolled back by reversing file edits
- Test commands can be run multiple times safely
- No database migrations or destructive operations

**Recovery Path:**

- If implementation causes issues, revert file changes using git:
  ```bash
  git checkout HEAD -- apps/web/hooks/reports/use-report-image.ts
  git checkout HEAD -- apps/web/hooks/reports/use-report-submit.ts
  git checkout HEAD -- apps/web/components/forms/image-upload.tsx
  git checkout HEAD -- apps/web/hooks/reports/use-report-form.ts
  git checkout HEAD -- apps/web/components/reports/create-report-form.tsx
  ```

**Testing Recovery:**

- Run `bun test` to verify test suite still passes
- Manual test edit functionality to ensure original behavior restored

## Artifacts and Notes

**Expected Error Fix:**
Before: Users can remove image in edit mode but can't save without image
After: Users must upload new image after removing existing image, validation prevents save without image

**Expected UI Behavior:**
Before: Remove button clears image, upload interface appears but can save without image
After: Remove button clears image, upload/camera interface appears, validation requires new image selection

## Interfaces and Dependencies

In `apps/web/hooks/reports/use-report-image.ts`, modify:

```typescript
// Current signature:
const handleImageRemove = (clearSync: () => void) => { ... }

// New signature:
const handleImageRemove = (clearSync: () => void, isEditing: boolean = false) => {
  // Handle edit mode logic
  if (isEditing) {
    form.setValue("image_url", "");
  }
  // Clear other state
}
```

In `apps/web/hooks/reports/use-report-submit.ts`, modify validation:

```typescript
// Current validation:
if (!selectedImage && !isEditing) {
  setFormError("Silakan pilih foto jalan rusak terlebih dahulu");
  return;
}

// New validation - require image in all modes (create + edit):
if (!selectedImage && !initialData?.image_url) {
  setFormError("Silakan pilih foto jalan rusak terlebih dahulu");
  return;
}
```

**Dependencies:**

- React Hook Form for form state management
- Zod for form validation
- Existing image upload and EXIF extraction functionality
- Report submission and update services

---

_Plan created: 2025-12-01_  
_Status: Ready for implementation_  
_Following PLANS.md template from /Users/mac/WebApps/projects/viralkan-app/.agent/PLANS.md_
