# Viralkan Design System & UI Concept

**A comprehensive design system for the road damage reporting platform**

---

## 1 · Design Philosophy

Viralkan's design system embodies **"People First, Technology Second"** — inspired by modern productivity tools while maintaining civic trust and accessibility. Our design philosophy centers on:

### 1.1 Core Principles

**Streamlined Simplicity**

- Clean, uncluttered interfaces with purposeful white space
- Typography-first approach with clear information hierarchy
- Minimal cognitive load for users reporting emergencies

**Civic Trust & Accessibility**

- Professional, government-appropriate aesthetic
- WCAG 2.1 AA compliance for universal access
- High contrast design for outdoor mobile usage
- Immediate visual feedback for user actions

**Content-Focused Design**

- Road damage photos as primary visual elements
- Card-based organization for easy scanning
- Strategic use of color for damage categorization
- Clear status indicators for report progress

**Performance & Reliability**

- Mobile-first responsive design
- Optimized for slower network connections
- Progressive enhancement for advanced features
- Consistent experience across all devices

### 1.2 Design Inspiration

Drawing from modern productivity tools (like Streamline), we prioritize:

- **Clean layouts** with generous white space
- **Subtle depth** through shadows and layering
- **Professional typography** with clear hierarchy
- **Minimal color palettes** with strategic accent colors
- **Card-based information architecture** for easy consumption

---

## 2 · Design Tokens

### 2.1 Color System

#### Primary Palette

```css
:root {
  /* Primary - Civic Blue (Streamline-inspired) */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6; /* Main brand */
  --color-primary-600: #2563eb; /* Primary actions */
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;
  --color-primary-950: #172554;

  /* Extended Neutrals (Streamline-inspired) */
  --color-neutral-25: #fcfcfc; /* Subtle backgrounds */
  --color-neutral-50: #f9fafb;
  --color-neutral-100: #f3f4f6;
  --color-neutral-200: #e5e7eb;
  --color-neutral-300: #d1d5db;
  --color-neutral-400: #9ca3af;
  --color-neutral-500: #6b7280; /* Body text */
  --color-neutral-600: #4b5563;
  --color-neutral-700: #374151; /* Headings */
  --color-neutral-800: #1f2937;
  --color-neutral-900: #111827; /* High contrast text */
  --color-neutral-950: #030712;
}
```

#### Semantic Colors

```css
:root {
  /* Status Colors */
  --color-success-500: #10b981; /* Report submitted */
  --color-warning-500: #f59e0b; /* Under review */
  --color-danger-500: #ef4444; /* Critical damage */
  --color-info-500: #06b6d4; /* Information */

  /* Damage Category Colors */
  --color-pothole: #dc2626; /* Red - berlubang */
  --color-crack: #ea580c; /* Orange - retak */
  --color-other: #6b7280; /* Gray - lainnya */

  /* Neutral Grays */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;
  --color-gray-950: #030712;
}
```

#### Theme Variants

```css
/* Light Theme (Default) - Streamline-inspired */
:root {
  --color-background: #ffffff; /* Pure white like Streamline */
  --color-background-subtle: var(--color-neutral-25); /* Subtle off-white */
  --color-surface: #ffffff; /* Card backgrounds */
  --color-surface-raised: var(--color-neutral-25); /* Elevated surfaces */

  --color-text-primary: var(--color-neutral-900); /* High contrast headings */
  --color-text-secondary: var(--color-neutral-700); /* Body text */
  --color-text-muted: var(--color-neutral-500); /* Supporting text */
  --color-text-placeholder: var(--color-neutral-400); /* Form placeholders */

  --color-border: var(--color-neutral-200); /* Subtle borders */
  --color-border-hover: var(--color-neutral-300); /* Interactive borders */
  --color-border-focus: var(--color-primary-500); /* Focus states */

  --color-overlay: rgb(0 0 0 / 0.1); /* Modal overlays */
  --color-shadow: rgb(0 0 0 / 0.05); /* Subtle shadows */
}

/* Dark Theme (Future) */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: var(--color-neutral-950);
    --color-background-subtle: var(--color-neutral-900);
    --color-surface: var(--color-neutral-900);
    --color-surface-raised: var(--color-neutral-800);

    --color-text-primary: var(--color-neutral-50);
    --color-text-secondary: var(--color-neutral-300);
    --color-text-muted: var(--color-neutral-500);
    --color-text-placeholder: var(--color-neutral-600);

    --color-border: var(--color-neutral-800);
    --color-border-hover: var(--color-neutral-700);
    --color-border-focus: var(--color-primary-400);

    --color-overlay: rgb(0 0 0 / 0.8);
    --color-shadow: rgb(0 0 0 / 0.3);
  }
}
```

### 2.2 Typography Scale

#### Font Families

```css
:root {
  /* Primary: Geist Sans (already in project) */
  --font-family-sans: "Geist", ui-sans-serif, system-ui, sans-serif;

  /* Monospace: Geist Mono (for code/IDs) */
  --font-family-mono: "GeistMono", "Monaco", "Cascadia Code", monospace;

  /* System fallback for performance */
  --font-family-system: system-ui, -apple-system, sans-serif;
}
```

#### Font Sizes & Line Heights

```css
:root {
  /* Typography Scale (Streamline-inspired) */
  --text-xs: 0.75rem; /* 12px - Captions, timestamps */
  --text-sm: 0.875rem; /* 14px - Body text, labels */
  --text-base: 1rem; /* 16px - Primary body text */
  --text-lg: 1.125rem; /* 18px - Emphasized text */
  --text-xl: 1.25rem; /* 20px - Subheadings */
  --text-2xl: 1.5rem; /* 24px - Card headings */
  --text-3xl: 1.875rem; /* 30px - Section headings */
  --text-4xl: 2.25rem; /* 36px - Page headings */
  --text-5xl: 3rem; /* 48px - Hero headlines */

  /* Line Heights (optimized for readability) */
  --leading-tight: 1.25; /* Headlines */
  --leading-normal: 1.5; /* Body text */
  --leading-relaxed: 1.625; /* Long-form content */

  /* Letter Spacing (subtle improvements) */
  --tracking-tight: -0.025em; /* Large headings */
  --tracking-normal: 0em; /* Default */
  --tracking-wide: 0.025em; /* UI elements */
}
```

#### Font Weights

```css
:root {
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

### 2.3 Spacing Scale

```css
:root {
  /* Base unit: 4px */
  --space-0: 0;
  --space-1: 0.25rem; /* 4px */
  --space-2: 0.5rem; /* 8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem; /* 16px */
  --space-5: 1.25rem; /* 20px */
  --space-6: 1.5rem; /* 24px */
  --space-8: 2rem; /* 32px */
  --space-10: 2.5rem; /* 40px */
  --space-12: 3rem; /* 48px */
  --space-16: 4rem; /* 64px */
  --space-20: 5rem; /* 80px */
  --space-24: 6rem; /* 96px */

  /* Semantic spacing */
  --space-content-padding: var(--space-4);
  --space-section-gap: var(--space-12);
  --space-component-gap: var(--space-6);
}
```

### 2.4 Border Radius

```css
:root {
  --radius-none: 0;
  --radius-sm: 0.125rem; /* 2px */
  --radius-default: 0.25rem; /* 4px */
  --radius-md: 0.375rem; /* 6px */
  --radius-lg: 0.5rem; /* 8px */
  --radius-xl: 0.75rem; /* 12px */
  --radius-2xl: 1rem; /* 16px */
  --radius-full: 9999px; /* Circle */

  /* Component-specific */
  --radius-button: var(--radius-md);
  --radius-card: var(--radius-lg);
  --radius-input: var(--radius-default);
  --radius-image: var(--radius-lg);
}
```

### 2.5 Shadows & Elevation

```css
:root {
  /* Shadow tokens for depth hierarchy (Streamline-inspired) */
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.03); /* Subtle borders */
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.06); /* Card default */
  --shadow-default: 0 4px 6px -1px rgb(0 0 0 / 0.07); /* Card hover */
  --shadow-md: 0 10px 15px -3px rgb(0 0 0 / 0.08); /* Dropdowns */
  --shadow-lg: 0 20px 25px -5px rgb(0 0 0 / 0.1); /* Modals */
  --shadow-xl: 0 25px 50px -12px rgb(0 0 0 / 0.15); /* Hero sections */

  /* Component-specific shadows */
  --shadow-card: var(--shadow-sm);
  --shadow-card-hover: var(--shadow-default);
  --shadow-modal: var(--shadow-lg);
  --shadow-dropdown: var(--shadow-md);
  --shadow-button-hover: 0 2px 4px -1px rgb(0 0 0 / 0.1);
  --shadow-focus: 0 0 0 3px rgb(59 130 246 / 0.15);

  /* Elevation system */
  --elevation-0: none; /* Flat surfaces */
  --elevation-1: var(--shadow-xs); /* Subtle lift */
  --elevation-2: var(--shadow-sm); /* Cards */
  --elevation-3: var(--shadow-default); /* Hover states */
  --elevation-4: var(--shadow-md); /* Floating elements */
  --elevation-5: var(--shadow-lg); /* Modals */
}
```

---

## 3 · Component System

### 3.1 Button Variants

#### Primary Actions

```css
.button-primary {
  background-color: var(--color-primary-600);
  color: white;
  border-radius: var(--radius-button);
  padding: var(--space-3) var(--space-6);
  font-weight: var(--font-medium);
  transition: all 150ms ease;
}

.button-primary:hover {
  background-color: var(--color-primary-700);
  box-shadow: var(--shadow-button-hover);
}

.button-primary:focus {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}
```

#### Secondary & Danger

```css
.button-secondary {
  background-color: transparent;
  color: var(--color-gray-700);
  border: 1px solid var(--color-border);
}

.button-danger {
  background-color: var(--color-danger-500);
  color: white;
}
```

### 3.2 Form Controls

#### Input Fields

```css
.input {
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  font-size: var(--text-base);
  transition: border-color 150ms ease;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
}

.input--error {
  border-color: var(--color-danger-500);
}
```

#### File Upload (Critical for MVP)

```css
.upload-zone {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-12);
  text-align: center;
  background-color: var(--color-gray-50);
  transition: all 150ms ease;
}

.upload-zone:hover {
  border-color: var(--color-primary-400);
  background-color: var(--color-primary-50);
}

.upload-zone--active {
  border-color: var(--color-primary-500);
  background-color: var(--color-primary-50);
}
```

### 3.3 Cards & Layout

#### Report Cards

```css
.report-card {
  background-color: var(--color-surface);
  border-radius: var(--radius-card);
  padding: var(--space-6);
  box-shadow: var(--shadow-card);
  border: 1px solid var(--color-border);
  transition: all 150ms ease;
}

.report-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--color-border-hover);
}

.report-card__image {
  border-radius: var(--radius-image);
  aspect-ratio: 16 / 9;
  object-fit: cover;
  width: 100%;
}

.report-card__category {
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}

.report-card__category--pothole {
  background-color: rgb(220 38 38 / 0.1);
  color: var(--color-pothole);
}

.report-card__category--crack {
  background-color: rgb(234 88 12 / 0.1);
  color: var(--color-crack);
}

.report-card__category--other {
  background-color: rgb(107 114 128 / 0.1);
  color: var(--color-other);
}
```

### 3.4 Navigation & Header

```css
.header {
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  padding: var(--space-4) 0;
  position: sticky;
  top: 0;
  z-index: 50;
}

.nav-link {
  color: var(--color-text-secondary);
  font-weight: var(--font-medium);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-default);
  transition: all 150ms ease;
}

.nav-link:hover {
  color: var(--color-text-primary);
  background-color: var(--color-gray-100);
}

.nav-link--active {
  color: var(--color-primary-600);
  background-color: var(--color-primary-50);
}
```

---

## 4 · Layout System

### 4.1 Grid & Containers

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

.container--narrow {
  max-width: 800px;
}

.grid {
  display: grid;
  gap: var(--space-6);
}

.grid--reports {
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
}

@media (min-width: 768px) {
  .grid--reports {
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  }
}
```

### 4.2 Mobile-First Breakpoints

```css
:root {
  --screen-sm: 640px; /* Small tablets */
  --screen-md: 768px; /* Tablets */
  --screen-lg: 1024px; /* Small laptops */
  --screen-xl: 1280px; /* Desktops */
  --screen-2xl: 1536px; /* Large screens */
}
```

---

## 5 · Iconography

### 5.1 Icon System

- **Primary Icons**: Lucide React (lightweight, consistent)
- **Damage Categories**: Custom SVG icons
- **File Types**: Generic document icons
- **Status Indicators**: Simple geometric shapes

### 5.2 Icon Sizes

```css
:root {
  --icon-xs: 12px; /* Inline text */
  --icon-sm: 16px; /* Labels, badges */
  --icon-base: 20px; /* Buttons, navigation */
  --icon-lg: 24px; /* Headers, emphasis */
  --icon-xl: 32px; /* Feature highlights */
}
```

---

## 6 · Accessibility Standards

### 6.1 Color Contrast

- **Text on background**: Minimum 4.5:1 ratio
- **Large text (18px+)**: Minimum 3:1 ratio
- **Interactive elements**: Maintain contrast in all states

### 6.2 Focus Management

```css
.focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
  border-radius: var(--radius-default);
}
```

### 6.3 Motion & Animation

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 7 · Implementation Guidelines

### 7.1 Tailwind v4 Integration

The design system maps directly to Tailwind v4 configuration:

```js
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: "rgb(239 246 255)",
          // ... (use CSS custom properties)
        },
        damage: {
          pothole: "var(--color-pothole)",
          crack: "var(--color-crack)",
          other: "var(--color-other)",
        },
      },
      fontFamily: {
        sans: ["Geist", "ui-sans-serif", "system-ui"],
        mono: ["GeistMono", "Monaco", "monospace"],
      },
    },
  },
};
```

### 7.2 Component Architecture

```typescript
// Shared UI components in packages/ui/
export interface ButtonProps {
  variant: "primary" | "secondary" | "danger";
  size: "sm" | "md" | "lg";
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  ...props
}) => {
  // Implementation with design tokens
};
```

### 7.3 Performance Considerations

- **CSS Custom Properties**: Enable runtime theming
- **Tailwind Purging**: Remove unused styles in production
- **Font Loading**: Use `font-display: swap` for Geist fonts
- **Critical CSS**: Inline above-the-fold styles

---

## 8 · MVP Implementation Priority

### Phase 1 (Current MVP)

1. ✅ Core typography system
2. ✅ Button variants (primary, secondary)
3. ✅ Form controls (input, textarea, file upload)
4. ✅ Report card component
5. ✅ Basic layout containers

### Phase 2 (Post-MVP)

- Dark mode toggle
- Advanced form validation states
- Loading states and skeletons
- Toast notifications
- Modal dialogs

### Phase 3 (Future)

- Map interface styling
- Admin dashboard components
- Data visualization elements
- Advanced accessibility features

---

## 9 · Brand Guidelines

### 9.1 Voice & Tone

- **Authoritative** but approachable
- **Clear** instructions without jargon
- **Encouraging** civic participation
- **Transparent** about process and timelines

### 9.2 Imagery

- **Real photography** of road conditions
- **High contrast** for visibility
- **Consistent aspect ratios** (16:9 for reports)
- **Watermarking** for authenticity

### 9.3 Microcopy

```typescript
export const copy = {
  upload: {
    prompt: "Drag photo here or click to select",
    processing: "Processing image...",
    success: "Photo uploaded successfully",
  },
  categories: {
    berlubang: "Pothole",
    retak: "Crack",
    lainnya: "Other damage",
  },
  status: {
    submitted: "Report submitted",
    reviewing: "Under review",
    resolved: "Resolved",
  },
} as const;
```

---

This design system provides a solid foundation for the Viralkan MVP while being extensible for future iterations. It prioritizes accessibility, performance, and civic trust—essential for a public service platform.
