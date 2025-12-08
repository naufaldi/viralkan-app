# Fix Image Editing in Report Form - Tasks

This is the authoritative task list derived from the ExecPlan in `/Users/mac/WebApps/projects/viralkan-app/todo/work/2025-12-01-fix-image-editing/plan.md`.

## Task Breakdown

### image-editing-logic-update

- **Status**: in_progress
- **Description**: Update handleImageRemove function in use-report-image.ts to handle edit mode for replacement
- **Files to modify**:
  - `apps/web/hooks/reports/use-report-image.ts` (handleImageRemove function)
- **Acceptance**: Function accepts isEditing parameter and prepares image removal for replacement workflow
- **Dependencies**: None

### form-validation-update

- **Status**: pending
- **Description**: Update submit validation to require image in both create and edit modes
- **Files to modify**:
  - `apps/web/hooks/reports/use-report-submit.ts` (onSubmit validation logic)
- **Acceptance**: Form validation prevents saving reports without images in both create and edit modes
- **Dependencies**: image-editing-logic-update

### image-component-interface-update

- **Status**: pending
- **Description**: Update ImageUpload component to support camera and gallery for replacement
- **Files to modify**:
  - `apps/web/components/forms/image-upload.tsx` (ImageUploadProps interface and camera/gallery support)
- **Acceptance**: Component supports both camera and gallery options for image replacement
- **Dependencies**: image-editing-logic-update

### form-context-update

- **Status**: pending
- **Description**: Update use-report-form.ts to pass edit mode flags correctly
- **Files to modify**:
  - `apps/web/hooks/reports/use-report-form.ts` (handleImageRemove call)
- **Acceptance**: Form hook passes isEditing flag through image handling chain
- **Dependencies**: image-editing-logic-update, form-validation-update

### component-integration-update

- **Status**: pending
- **Description**: Verify create-report-form.tsx and ReportFormActions pass edit mode correctly
- **Files to modify**:
  - `apps/web/components/reports/create-report-form.tsx` (prop passing)
  - `apps/web/components/reports/report-form/report-form-actions.tsx` (button text/logic)
- **Acceptance**: Edit mode flag flows correctly and button shows appropriate text (Save vs Bagikan)
- **Dependencies**: image-component-interface-update

### end-to-end-testing

- **Status**: pending
- **Description**: Test all image editing scenarios including camera and gallery replacement
- **Test scenarios**:
  - Remove and replace image with gallery
  - Remove and replace image with camera
  - Keep image in edit mode
  - Prevent save without image in edit mode
  - Create mode unchanged
- **Acceptance**: All scenarios work as expected including camera and gallery replacement
- **Dependencies**: form-context-update, component-integration-update

### quality-checks

- **Status**: pending
- **Description**: Run linting, type checking, and tests
- **Commands to run**:
  - `bun run lint`
  - `bun run check-types`
  - `cd apps/api && bun test`
- **Acceptance**: No linting errors, no type errors, all tests pass
- **Dependencies**: end-to-end-testing

## Task Dependencies

```
image-editing-logic-update (independent)
    ↓
form-validation-update ← depends on → image-component-interface-update
    ↓                           ↓
form-context-update ← depends on → component-integration-update
    ↓
end-to-end-testing
    ↓
quality-checks
```

## Task Notes

- **image-editing-logic-update**: Core functionality for handling image removal in edit mode for replacement
- **form-validation-update**: Critical for requiring images in both create and edit modes (no optional images)
- **image-component-interface-update**: Enhanced interface to support both camera and gallery for image replacement
- **form-context-update**: Connects the validation and component changes
- **component-integration-update**: Ensures proper data flow through components including ReportFormActions
- **end-to-end-testing**: Validates complete user experience with camera and gallery replacement
- **quality-checks**: Ensures no regressions introduced

## Implementation Order

1. Start with `image-editing-logic-update` (foundation)
2. Work on `form-validation-update` and `image-component-interface-update` in parallel (both depend on step 1)
3. Complete `form-context-update` and `component-integration-update` in parallel (depend on steps 2-3)
4. Finish with `end-to-end-testing` and `quality-checks` (depend on steps 4-5)

## Key Behavior Changes

- **Before**: Users could remove images in edit mode and save without images
- **After**: Users must replace images in edit mode (either camera or gallery), validation prevents save without image
- **Before**: Limited replacement options
- **After**: Both camera and gallery options available for replacement

---

_Task list created: 2025-12-01_  
_Source ExecPlan: `/Users/mac/WebApps/projects/viralkan-app/todo/work/2025-12-01-fix-image-editing/plan.md`_
