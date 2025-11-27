# RFC: Report Form Architecture Rewrite

**Status:** ✅ Implemented  
**Date:** 2024  
**Goal:** Eliminate props drilling and optimize re-renders through context-based architecture

---

## Problem Statement

### Original Architecture Issues

**Props Drilling Problem:**

- 80+ props passed through 3+ component layers
- `CreateReportForm` → `ReportFormFields` → `ReportAddressFields`/`ReportLocationFields`
- Hard to maintain: Adding new state requires updating multiple prop interfaces
- Poor encapsulation: Components know too much about parent state

**Performance Problem:**

- Single large context (20+ properties) caused ALL components to re-render on ANY state change
- Image upload changes triggered re-renders of location components
- Form input changes triggered re-renders of image components
- No way to optimize with React.memo effectively

---

## Solution Analysis

### Option 1: Single Context (32 properties)

- ✅ Simple: One hook call
- ❌ Poor performance: All components re-render on any change
- ❌ Large context: Hard to maintain

### Option 2: 5 Separate Contexts

- ✅ Maximum granularity
- ✅ Best performance
- ❌ Too complex: Up to 5 hook calls per component
- ❌ Over-engineered for our needs

### Option 3: 3 Grouped Contexts ✅ **CHOSEN**

**Structure:**

1. **ReportFormContext** (6 props) - Core form + submit error
2. **ImageContext** (7 props) - Image + EXIF state
3. **LocationContext** (11 props) - Geocoding + Location + Admin sync
4. **ReportFormActionsContext** (9 props) - All handlers (stable)

**Why This Works:**

- ✅ Logical grouping: Related state together
- ✅ Performance: Only affected components re-render
- ✅ Manageable: Max 3 hook calls per component
- ✅ Clear boundaries: Image, Location, Form concerns separated

---

## Implementation

### Context Structure

```typescript
ReportFormProvider
├── ReportFormContext (6 props)
│   └── form, formError, isLoading, isFormActivated, mode, submitError
├── ImageContext (7 props)
│   └── selectedImage, uploadError, imageUploadFailed, isUploadingImage,
│       isExtractingExif, hasExifWarning, hasExifData
├── LocationContext (11 props)
│   ├── Geocoding: isGeocodingFromCoords, isGeocodingFromAddress,
│   │              lastGeocodingSource, geocodingError
│   ├── Location: isGettingLocation
│   └── Admin Sync: syncStatus, hasValidMatch, confidenceLevel,
│                   canAutoSelect, isProcessingAdminSync
└── ReportFormActionsContext (9 props)
    └── All action handlers (stable references)
```

### Component Usage

**Before (Props Drilling):**

```typescript
<ReportFormFields
  form={form}
  disabled={disabled}
  isFormActivated={isFormActivated}
  isGeocodingFromCoords={isGeocodingFromCoords}
  lastGeocodingSource={lastGeocodingSource}
  syncStatus={syncStatus}
  // ... 15+ more props
/>
```

**After (Context):**

```typescript
const ReportAddressFields = () => {
  const { form, isLoading, isFormActivated, mode } = useReportFormContext();
  const { isGeocodingFromCoords, syncStatus, ... } = useLocationContext();
  const { clearGeocodingError } = useReportFormActionsContext();
  // Zero props drilling!
};
```

---

## Benefits

| Aspect              | Before                | After             |
| ------------------- | --------------------- | ----------------- |
| **Props Drilling**  | 80+ props across tree | ✅ Zero           |
| **Re-render Scope** | All components        | ✅ Only affected  |
| **Context Size**    | 20 props in one       | ✅ 6, 7, 11 props |
| **Maintainability** | ❌ Hard               | ✅ Easy           |
| **Performance**     | ❌ Poor               | ✅ Optimized      |

### Key Improvements

1. **Zero Props Drilling** - Components get data directly from context
2. **Optimized Re-renders** - Image changes only affect image consumers
3. **Better Encapsulation** - Components are self-contained
4. **Logical Grouping** - Related state grouped together
5. **Easier Testing** - Mock contexts instead of prop chains

---

## Files Changed

### Created

- `report-form-context.tsx` - 4 context definitions
- `report-form-provider.tsx` - Composed provider
- `report-form.tsx` - Compound component root

### Refactored

- `create-report-form.tsx` - Uses context, simplified
- `report-form-fields.tsx` - Uses context, removed props
- `report-address-fields.tsx` - Uses context, removed 10+ props
- `report-location-fields.tsx` - Uses context, removed 15+ props
- `report-category-field.tsx` - Uses context, removed 3 props

---

## Decision Rationale

**Why 3 contexts instead of 1 or 5?**

- **1 context**: Too large, poor performance
- **5 contexts**: Too granular, over-engineered
- **3 contexts**: ✅ Sweet spot - balanced performance and complexity

**Why this grouping?**

- **Form + Submit**: Both are form-level concerns
- **Image + EXIF**: Tightly coupled, same hook
- **Location + Geocoding + AdminSync**: All location operations, related workflow

---

## Migration Notes

- All components now use context hooks instead of props
- No breaking changes to external API
- Backward compatible during transition
- All existing functionality preserved

---

## Future Considerations

- Could split LocationContext further if it grows (Geocoding + AdminSync separate)
- ActionsContext could be split if handlers become too numerous
- Current structure allows easy evolution
