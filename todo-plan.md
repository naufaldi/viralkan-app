# Administrative Information & Filters Implementation Plan

## 🎯 Overview
Add kecamatan, kabupaten/kota, and provinsi information to report cards and implement corresponding filters in the reports section.

## 📋 Implementation Phases

### Phase 1: UI Implementation (Current)
**Focus:** UI components and visual design only, no data integration

#### 1.1 Report Card Enhancement (`report-card.tsx`)

**Current Structure:**
```
┌─────────────────────────────────────┐
│ [Image with Category Badge]         │
├─────────────────────────────────────┤
│ Street Name (h3)                    │
│ 📍 Location Text                    │
├─────────────────────────────────────┤
│ [User Avatar] User Name | 📅 Time   │
└─────────────────────────────────────┘
```

**New Structure:**
```
┌─────────────────────────────────────┐
│ [Image with Category Badge]         │
├─────────────────────────────────────┤
│ Street Name (h3)                    │
│ 📍 Location Text                    │
├─────────────────────────────────────┤
│ 🏛️ Administrative Info:            │
│   Kecamatan: [Name]                 │
│   Kabupaten/Kota: [Name]            │
│   Provinsi: [Name]                  │
├─────────────────────────────────────┤
│ [User Avatar] User Name | 📅 Time   │
└─────────────────────────────────────┘
```

**Design Specifications:**
- **Typography:** `text-sm text-neutral-500` for administrative info
- **Spacing:** `space-y-2` between administrative items, `space-y-3` for sections
- **Icons:** Building icon (`🏛️`) for administrative section
- **Layout:** Responsive grid/flex layout
- **Colors:** Follow monochromatic palette with `neutral-500` for secondary text

#### 1.2 Filter Section Enhancement (`reports-filter-section.tsx`)

**Current Structure:**
```
┌─────────────────────────────────────┐
│ Category Filter | Search Input      │
└─────────────────────────────────────┘
```

**New Structure:**
```
┌─────────────────────────────────────┐
│ Category Filter | Search Input      │
├─────────────────────────────────────┤
│ Administrative Filters:             │
│ [Provinsi ▼] [Kabupaten/Kota ▼] [Kecamatan ▼] │
└─────────────────────────────────────┘
```

**Design Specifications:**
- **Layout:** Responsive grid with proper breakpoints
- **Spacing:** `space-x-4` between filters, `space-y-4` for sections
- **Styling:** Consistent with existing filter components
- **Mobile:** Stack vertically on mobile devices
- **Accessibility:** Proper labels and ARIA attributes

#### 1.3 Component Updates Required

**Files to Modify:**
1. `apps/web/components/reports/report-card.tsx`
   - Add administrative info section
   - Update TypeScript interfaces
   - Add responsive layout

2. `apps/web/components/reports/reports-filter-section.tsx`
   - Add administrative filters section
   - Update component props interface

3. `apps/web/components/reports/report-filters.tsx`
   - Add administrative filter controls
   - Implement filter state management

**New Components to Create:**
1. `apps/web/components/reports/administrative-info.tsx`
   - Reusable administrative info display component
   - Consistent styling and layout

2. `apps/web/components/reports/administrative-filters.tsx`
   - Reusable administrative filter controls
   - Dropdown/select components

### Phase 2: Data Integration (Future)
**Focus:** Connect UI to actual data

#### 2.1 Data Structure Updates
```typescript
interface Report {
  // Existing fields...
  kecamatan?: string;
  kabupaten_kota?: string;
  provinsi?: string;
}

interface FilterState {
  category?: "berlubang" | "retak" | "lainnya";
  search: string;
  provinsi?: string;
  kabupaten_kota?: string;
  kecamatan?: string;
}
```

#### 2.2 API Integration
- Update API endpoints to include administrative data
- Implement filter logic on backend
- Add data fetching for administrative options

### Phase 3: Filter Logic (Future)
**Focus:** Implement actual filtering functionality

#### 3.1 Filter Implementation
- Hierarchical filtering (Provinsi → Kabupaten → Kecamatan)
- Search integration with administrative filters
- URL state management for filters

## 🎨 Design System Compliance

### Color Palette (Following ui-concept.md)
```css
/* Administrative Info Colors */
--text-administrative: var(--color-neutral-500);
--border-administrative: var(--color-neutral-200);
--background-administrative: var(--color-neutral-50);
```

### Typography Hierarchy
```css
/* Administrative Info Typography */
.administrative-info {
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
  color: var(--text-muted);
}
```

### Spacing System
```css
/* Component Spacing */
.administrative-section {
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--border-muted);
}
```

## ♿ Accessibility Standards

### WCAG AA Compliance
- **Color Contrast:** Minimum 4.5:1 for administrative text
- **Focus Management:** Proper focus indicators for filter controls
- **Screen Reader:** Semantic HTML structure for administrative info
- **Keyboard Navigation:** Full keyboard accessibility for filters

### Semantic HTML Structure
```html
<section aria-label="Administrative Information">
  <dl>
    <dt>Kecamatan</dt>
    <dd>[Name]</dd>
    <dt>Kabupaten/Kota</dt>
    <dd>[Name]</dd>
    <dt>Provinsi</dt>
    <dd>[Name]</dd>
  </dl>
</section>
```

## 📱 Responsive Design Strategy

### Mobile-First Approach
```css
/* Mobile (default) */
.administrative-filters {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .administrative-filters {
    flex-direction: row;
    gap: var(--space-4);
  }
}
```

### Breakpoint Strategy
- **Mobile (320px-767px):** Stacked layout, full-width filters
- **Tablet (768px-1023px):** Horizontal layout, medium-width filters
- **Desktop (1024px+):** Horizontal layout, optimized spacing

## 🧪 Testing Strategy

### Component Testing
- **Unit Tests:** Administrative info display
- **Integration Tests:** Filter interactions
- **Visual Tests:** Responsive behavior
- **Accessibility Tests:** Screen reader compatibility

### Test Cases
1. **Report Card:**
   - Displays administrative info correctly
   - Handles missing administrative data gracefully
   - Responsive layout on all screen sizes

2. **Filters:**
   - Filter dropdowns work correctly
   - Hierarchical filtering logic
   - URL state management
   - Mobile responsiveness

## 📋 Implementation Checklist

### Phase 1: UI Implementation ✅ COMPLETED
- [x] Create `administrative-info.tsx` component
- [x] Create `administrative-filters.tsx` component
- [x] Update `report-card.tsx` with administrative info
- [x] Update `reports-filter-section.tsx` with administrative filters
- [x] Update `report-filters.tsx` with filter controls
- [x] Add TypeScript interfaces for new data structure
- [x] Implement responsive design
- [x] Add accessibility attributes
- [x] Test visual design across breakpoints
- [x] Fix scroll-to-top issue with filters

### Phase 2: Data Integration ✅ COMPLETED
- [x] Update API data structure
- [x] Implement data fetching for administrative options
- [x] Connect UI components to real data
- [x] Add loading states for administrative data

### Phase 3: Filter Logic (Future)
- [ ] Implement hierarchical filtering
- [ ] Add URL state management
- [ ] Integrate with search functionality
- [ ] Add filter persistence

## 🚀 Success Criteria

### Visual Design
- [ ] Administrative info follows design system
- [ ] Filters are visually consistent with existing UI
- [ ] Responsive design works on all devices
- [ ] Accessibility standards are met

### User Experience
- [ ] Administrative info is easy to scan
- [ ] Filters are intuitive to use
- [ ] Mobile experience is optimized
- [ ] Loading states provide good feedback

### Technical Quality
- [ ] Components are reusable
- [ ] TypeScript types are properly defined
- [ ] Code follows project conventions
- [ ] Performance is optimized

## 📝 Notes

### Design Decisions
1. **Administrative Info Placement:** Below location text, above user info
2. **Filter Organization:** Hierarchical (Provinsi → Kabupaten → Kecamatan)
3. **Icon Usage:** Building icon for administrative section
4. **Color Strategy:** Neutral colors for secondary information

### Future Considerations
1. **Data Source:** Administrative data may come from external APIs
2. **Caching:** Administrative options should be cached for performance
3. **Internationalization:** Support for different administrative structures
4. **Analytics:** Track filter usage for UX improvements

---

**Next Steps:** Review this plan and approve for implementation. Phase 1 (UI) can begin immediately while data integration planning continues. 