# Viralkan Design System 2.0

**Modern UI Concept for Professional Road Damage Reporting Platform**

---

## 🎯 Design Philosophy

Viralkan 2.0 embodies **"Luxury Simplicity for Civic Purpose"** — transforming the road damage reporting experience with modern, luxury-inspired design while maintaining accessibility and government appropriateness.

### Core Design Principles

**Modern Luxury Aesthetic**

- Clean, sophisticated interfaces with purposeful negative space
- Premium typography with refined hierarchy
- Monochromatic color palette with strategic accent colors
- Subtle depth through elevation and shadows

**Professional Civic Trust**

- Government-appropriate aesthetic with luxury touches
- WCAG 2.1 AA compliance for universal accessibility
- High contrast design optimized for outdoor mobile usage
- Immediate visual feedback and intuitive interactions

**Content-First Architecture**

- Road damage imagery as primary visual focus
- Card-based information architecture for easy scanning
- Strategic use of micro-interactions and animations
- Clear status communication and progress indicators

**Mobile-Optimized Performance**

- Mobile-first responsive design approach
- Touch-friendly interactions with proper sizing
- Progressive enhancement for advanced features
- Optimized for varying network conditions

---

## 🎨 Design System 2.0

### Color Palette: Professional Monochrome

#### Primary Neutrals (Luxury Inspired)

```css
:root {
  /* Pure Whites & Off-Whites */
  --color-white: #ffffff;
  --color-neutral-25: #fcfcfd; /* Subtle background tint */
  --color-neutral-50: #f8fafc; /* Light background */
  --color-neutral-100: #f1f5f9; /* Muted backgrounds */

  /* Light Grays */
  --color-neutral-200: #e2e8f0; /* Borders & dividers */
  --color-neutral-300: #cbd5e1; /* Disabled states */
  --color-neutral-400: #94a3b8; /* Placeholder text */

  /* Medium Grays */
  --color-neutral-500: #64748b; /* Secondary text */
  --color-neutral-600: #475569; /* Body text */
  --color-neutral-700: #334155; /* Headings */

  /* Dark Grays */
  --color-neutral-800: #1e293b; /* High contrast text */
  --color-neutral-900: #0f172a; /* Primary text */
  --color-neutral-950: #020617; /* Maximum contrast */
}
```

#### Functional Colors (5% - Essential Only)

```css
:root {
  /* Interactive Accent (Minimal) */
  --color-accent: var(--color-neutral-800); /* Dark gray for interactions */
  --color-accent-hover: var(--color-neutral-900); /* Darker for hover */

  /* Success Green - Resolved Status Only */
  --color-success-50: #f0fdf4;
  --color-success-500: #22c55e;
  --color-success-600: #16a34a;

  /* Error Red - Critical Damage & Errors Only */
  --color-error-50: #fef2f2;
  --color-error-500: #ef4444;
  --color-error-600: #dc2626;

  /* Damage Category Colors (Minimal) */
  --color-pothole: #dc2626; /* Critical damage - red for urgency */
  --color-crack: var(--color-neutral-600); /* Moderate damage - gray */
  --color-other: var(--color-neutral-500); /* General issues - lighter gray */
}
```

#### Semantic Theme Tokens

```css
:root {
  /* Surface Colors */
  --surface-background: var(--color-white);
  --surface-subtle: var(--color-neutral-25);
  --surface-muted: var(--color-neutral-50);
  --surface-card: var(--color-white);
  --surface-elevated: var(--color-white);

  /* Text Colors */
  --text-primary: var(--color-neutral-900);
  --text-secondary: var(--color-neutral-700);
  --text-muted: var(--color-neutral-500);
  --text-placeholder: var(--color-neutral-400);
  --text-disabled: var(--color-neutral-300);

  /* Border Colors */
  --border-default: var(--color-neutral-200);
  --border-muted: var(--color-neutral-100);
  --border-strong: var(--color-neutral-300);
  --border-interactive: var(--color-accent);

  /* Interactive States */
  --interactive-hover: var(--color-neutral-50);
  --interactive-pressed: var(--color-neutral-100);
  --interactive-disabled: var(--color-neutral-100);
}
```

### Typography System: Premium Hierarchy

#### Font Stack

```css
:root {
  /* Primary: Geist Sans (Modern, Clean) */
  --font-sans:
    "Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

  /* Monospace: Geist Mono (Technical Data) */
  --font-mono: "Geist Mono", "SF Mono", "Monaco", "Cascadia Code", monospace;

  /* Display: For marketing/hero sections */
  --font-display: "Geist", -apple-system, BlinkMacSystemFont, sans-serif;
}
```

#### Type Scale (Luxury Proportions)

```css
:root {
  /* Display Scale - Marketing & Heroes */
  --text-display-2xl: 4.5rem; /* 72px - Hero headlines */
  --text-display-xl: 3.75rem; /* 60px - Section heroes */
  --text-display-lg: 3rem; /* 48px - Page titles */
  --text-display-md: 2.25rem; /* 36px - Large headings */
  --text-display-sm: 1.875rem; /* 30px - Sub-headings */

  /* Text Scale - Interface & Content */
  --text-xl: 1.25rem; /* 20px - Large UI text */
  --text-lg: 1.125rem; /* 18px - Emphasized text */
  --text-base: 1rem; /* 16px - Body text */
  --text-sm: 0.875rem; /* 14px - Small text */
  --text-xs: 0.75rem; /* 12px - Captions */

  /* Line Heights - Optimized for Readability */
  --leading-none: 1; /* Tight headlines */
  --leading-tight: 1.25; /* Display text */
  --leading-snug: 1.375; /* Headings */
  --leading-normal: 1.5; /* Body text */
  --leading-relaxed: 1.625; /* Long-form content */

  /* Letter Spacing - Subtle Refinements */
  --tracking-tighter: -0.05em; /* Large display text */
  --tracking-tight: -0.025em; /* Headlines */
  --tracking-normal: 0em; /* Default */
  --tracking-wide: 0.025em; /* UI elements */

  /* Font Weights */
  --font-thin: 100;
  --font-extralight: 200;
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
  --font-black: 900;
}
```

### Spacing System: Luxurious Proportions

```css
:root {
  /* Base Scale (0.25rem = 4px) */
  --space-0: 0;
  --space-px: 1px;
  --space-0_5: 0.125rem; /* 2px */
  --space-1: 0.25rem; /* 4px */
  --space-1_5: 0.375rem; /* 6px */
  --space-2: 0.5rem; /* 8px */
  --space-2_5: 0.625rem; /* 10px */
  --space-3: 0.75rem; /* 12px */
  --space-3_5: 0.875rem; /* 14px */
  --space-4: 1rem; /* 16px */
  --space-5: 1.25rem; /* 20px */
  --space-6: 1.5rem; /* 24px */
  --space-7: 1.75rem; /* 28px */
  --space-8: 2rem; /* 32px */
  --space-9: 2.25rem; /* 36px */
  --space-10: 2.5rem; /* 40px */
  --space-11: 2.75rem; /* 44px */
  --space-12: 3rem; /* 48px */
  --space-14: 3.5rem; /* 56px */
  --space-16: 4rem; /* 64px */
  --space-20: 5rem; /* 80px */
  --space-24: 6rem; /* 96px */
  --space-28: 7rem; /* 112px */
  --space-32: 8rem; /* 128px */
  --space-36: 9rem; /* 144px */
  --space-40: 10rem; /* 160px */
  --space-44: 11rem; /* 176px */
  --space-48: 12rem; /* 192px */
  --space-52: 13rem; /* 208px */
  --space-56: 14rem; /* 224px */
  --space-60: 15rem; /* 240px */
  --space-64: 16rem; /* 256px */
  --space-72: 18rem; /* 288px */
  --space-80: 20rem; /* 320px */
  --space-96: 24rem; /* 384px */

  /* Semantic Spacing */
  --space-section: var(--space-20); /* Between major sections */
  --space-component: var(--space-8); /* Between components */
  --space-element: var(--space-4); /* Between related elements */
  --space-inline: var(--space-2); /* Inline spacing */
}
```

### Elevation & Shadow System

```css
:root {
  /* Shadow Scale - Luxury Depth */
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.02); /* Subtle lift */
  --shadow-sm:
    0 1px 3px 0 rgb(0 0 0 / 0.04),
    /* Card default */ 0 1px 2px -1px rgb(0 0 0 / 0.04);
  --shadow-md:
    0 4px 6px -1px rgb(0 0 0 / 0.05),
    /* Card hover */ 0 2px 4px -2px rgb(0 0 0 / 0.05);
  --shadow-lg:
    0 10px 15px -3px rgb(0 0 0 / 0.06),
    /* Dropdowns */ 0 4px 6px -4px rgb(0 0 0 / 0.06);
  --shadow-xl:
    0 20px 25px -5px rgb(0 0 0 / 0.08),
    /* Modals */ 0 8px 10px -6px rgb(0 0 0 / 0.08);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.12); /* Large modals */
  --shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.04); /* Inset elements */

  /* Component-Specific Shadows */
  --shadow-card: var(--shadow-sm);
  --shadow-card-hover: var(--shadow-md);
  --shadow-button: 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --shadow-button-hover: 0 2px 4px 0 rgb(0 0 0 / 0.08);
  --shadow-dropdown: var(--shadow-lg);
  --shadow-modal: var(--shadow-xl);
  --shadow-tooltip: var(--shadow-md);

  /* Focus Ring */
  --focus-ring: 0 0 0 3px rgb(30 41 59 / 0.12); /* Neutral focus ring */
  --focus-ring-offset: 2px;
}
```

### Border Radius: Modern Refinement

```css
:root {
  --radius-none: 0;
  --radius-xs: 0.125rem; /* 2px */
  --radius-sm: 0.25rem; /* 4px */
  --radius-md: 0.375rem; /* 6px */
  --radius-lg: 0.5rem; /* 8px */
  --radius-xl: 0.75rem; /* 12px */
  --radius-2xl: 1rem; /* 16px */
  --radius-3xl: 1.5rem; /* 24px */
  --radius-full: 9999px; /* Perfect circle */

  /* Component-Specific Radius */
  --radius-button: var(--radius-md);
  --radius-input: var(--radius-md);
  --radius-card: var(--radius-lg);
  --radius-image: var(--radius-lg);
  --radius-badge: var(--radius-full);
  --radius-modal: var(--radius-xl);
}
```

---

## 🧩 Component System 2.0

### Button System: Professional Interactions

#### Primary Button

```css
.btn-primary {
  /* Base Styles */
  background: var(--color-accent);
  color: var(--color-white);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-button);
  font-weight: var(--font-medium);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  padding: var(--space-3) var(--space-6);
  min-height: 44px; /* Touch-friendly */

  /* Interactions */
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;

  /* States */
  &:hover {
    background: var(--color-accent-hover);
    border-color: var(--color-accent-hover);
    box-shadow: var(--shadow-button-hover);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
    box-shadow: var(--shadow-button);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgb(30 41 59 / 0.12); /* Neutral focus ring */
  }

  &:disabled {
    background: var(--color-neutral-200);
    border-color: var(--color-neutral-200);
    color: var(--color-neutral-400);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
}
```

#### Strategic Hover Color System

Following the "Luxury Simplicity for Civic Purpose" philosophy, buttons use strategic color hints on hover to provide clear visual feedback while maintaining the monochromatic aesthetic.

```css
/* Action Buttons - Strategic Color Use (5% of interface) */

/* Success/Accept Actions */
.btn-success {
  background: var(--color-white);
  color: var(--color-neutral-700);
  border: 1px solid var(--color-neutral-300);
  
  &:hover {
    background: rgb(240 253 244); /* green-50 */
    border-color: rgb(187 247 208); /* green-200 */
    color: rgb(21 128 61); /* green-700 */
    transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  }
}

/* Danger/Reject Actions */
.btn-danger {
  background: var(--color-white);
  color: var(--color-neutral-700);
  border: 1px solid var(--color-neutral-300);
  
  &:hover {
    background: rgb(254 242 242); /* red-50 */
    border-color: rgb(254 202 202); /* red-200 */
    color: rgb(185 28 28); /* red-700 */
    transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  }
}

/* Neutral Navigation Buttons */
.btn-neutral {
  background: var(--color-white);
  color: var(--color-neutral-700);
  border: 1px solid var(--color-neutral-300);
  
  &:hover {
    background: var(--color-neutral-50);
    border-color: var(--color-neutral-400);
    color: var(--color-neutral-800);
    transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  }
}

/* Interactive Elements (Dropdowns, Sort buttons) */
.btn-interactive {
  background: transparent;
  color: var(--color-neutral-600);
  border: 1px solid transparent;
  
  &:hover {
    background: var(--color-neutral-100);
    color: var(--color-neutral-900);
    transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  }
}
```

#### Hover Color Guidelines

**Strategic Color Application:**
- **Success Actions**: Subtle green hints (`green-50` bg, `green-200` border, `green-700` text)
- **Danger Actions**: Subtle red hints (`red-50` bg, `red-200` border, `red-700` text)
- **Neutral Actions**: Enhanced neutral tones (`neutral-50` bg, `neutral-400` border)
- **Interactive Elements**: Light neutral feedback (`neutral-100` bg, `neutral-900` text)

**Design Principles:**
- Colors used only for functional feedback (5% of interface)
- Maintains luxury monochromatic aesthetic
- Government-appropriate and professional
- WCAG AA compliant contrast ratios
- Smooth transitions (200ms) for luxury feel

#### Secondary & Ghost Variants

```css
.btn-secondary {
  background: var(--color-white);
  color: var(--color-neutral-700);
  border: 1px solid var(--color-border-default);

  &:hover {
    background: var(--color-neutral-50);
    border-color: var(--color-neutral-300);
    transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  }
}

.btn-ghost {
  background: transparent;
  color: var(--color-neutral-600);
  border: 1px solid transparent;

  &:hover {
    background: var(--color-neutral-50);
    color: var(--color-neutral-700);
    transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  }
}

.btn-danger {
  background: var(--color-error-500);
  color: var(--color-white);
  border: 1px solid var(--color-error-500);

  &:hover {
    background: var(--color-error-600);
    border-color: var(--color-error-600);
    transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  }
}
```

### Card System: Elegant Information Architecture

#### Base Card

```css
.card {
  background: var(--surface-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    box-shadow: var(--shadow-card-hover);
    border-color: var(--border-strong);
    transform: translateY(-2px);
  }
}

.card-header {
  padding: var(--space-6) var(--space-6) var(--space-4);
  border-bottom: 1px solid var(--border-muted);
}

.card-content {
  padding: var(--space-6);
}

.card-footer {
  padding: var(--space-4) var(--space-6) var(--space-6);
  border-top: 1px solid var(--border-muted);
  background: var(--surface-subtle);
}
```

#### Report Card (Domain-Specific)

```css
.report-card {
  @extend .card;
  max-width: 400px;

  .report-image {
    aspect-ratio: 16 / 9;
    object-fit: cover;
    width: 100%;
    border-radius: var(--radius-image) var(--radius-image) 0 0;
  }

  .report-category {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-1_5) var(--space-3);
    border-radius: var(--radius-badge);
    font-size: var(--text-xs);
    font-weight: var(--font-medium);
    text-transform: uppercase;
    letter-spacing: var(--tracking-wide);

    &--pothole {
      background: rgb(220 38 38 / 0.08);
      color: var(--color-pothole);
    }

    &--crack {
      background: rgb(234 88 12 / 0.08);
      color: var(--color-crack);
    }

    &--other {
      background: rgb(100 116 139 / 0.08);
      color: var(--color-other);
    }
  }

  .report-status {
    padding: var(--space-1) var(--space-2_5);
    border-radius: var(--radius-badge);
    font-size: var(--text-xs);
    font-weight: var(--font-medium);

    &--submitted {
      background: var(--color-neutral-100);
      color: var(--color-neutral-600);
    }

    &--reviewing {
      background: var(--color-neutral-100);
      color: var(--color-neutral-700);
    }

    &--resolved {
      background: var(--color-success-50);
      color: var(--color-success-600);
    }
  }
}
```

### Form System: Intuitive Data Collection

#### Input Controls

```css
.input {
  /* Base Styles */
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-input);
  background: var(--surface-background);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--text-primary);
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);

  /* Placeholder */
  &::placeholder {
    color: var(--text-placeholder);
  }

  /* States */
  &:focus {
    outline: none;
    border-color: var(--border-interactive);
    box-shadow: var(--focus-ring);
  }

  &:hover:not(:focus) {
    border-color: var(--border-strong);
  }

  &:disabled {
    background: var(--surface-muted);
    border-color: var(--border-muted);
    color: var(--text-disabled);
    cursor: not-allowed;
  }

  &.error {
    border-color: var(--color-error-500);
    box-shadow: 0 0 0 3px rgb(239 68 68 / 0.12);
  }

  &.success {
    border-color: var(--color-success-500);
    box-shadow: 0 0 0 3px rgb(34 197 94 / 0.12);
  }
}

.textarea {
  @extend .input;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
}

.select {
  @extend .input;
  cursor: pointer;
  background-image: url("data:image/svg+xml;charset=utf-8,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right var(--space-3) center;
  background-repeat: no-repeat;
  background-size: 16px;
  padding-right: var(--space-10);
}
```

#### File Upload Component

```css
.upload-zone {
  position: relative;
  border: 2px dashed var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-12);
  text-align: center;
  background: var(--surface-subtle);
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;

  &:hover {
    border-color: var(--color-neutral-300);
    background: var(--color-neutral-100);
  }

  &.dragover {
    border-color: var(--color-accent);
    background: var(--color-neutral-100);
    transform: scale(1.02);
  }

  .upload-icon {
    width: var(--space-12);
    height: var(--space-12);
    color: var(--color-neutral-400);
    margin: 0 auto var(--space-4);
  }

  .upload-text {
    font-size: var(--text-lg);
    font-weight: var(--font-medium);
    color: var(--text-secondary);
    margin-bottom: var(--space-2);
  }

  .upload-hint {
    font-size: var(--text-sm);
    color: var(--text-muted);
  }
}

.upload-preview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--space-4);
  margin-top: var(--space-6);

  .preview-item {
    position: relative;
    aspect-ratio: 1;
    border-radius: var(--radius-lg);
    overflow: hidden;
    background: var(--surface-muted);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .remove-button {
      position: absolute;
      top: var(--space-2);
      right: var(--space-2);
      width: var(--space-6);
      height: var(--space-6);
      border-radius: var(--radius-full);
      background: rgb(0 0 0 / 0.8);
      color: white;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 150ms;

      &:hover {
        background: rgb(239 68 68 / 0.9);
      }
    }
  }
}
```

---

## 📱 Responsive Design Strategy

### Breakpoint System

```css
:root {
  --screen-xs: 475px; /* Large phones */
  --screen-sm: 640px; /* Small tablets */
  --screen-md: 768px; /* Tablets */
  --screen-lg: 1024px; /* Small laptops */
  --screen-xl: 1280px; /* Desktops */
  --screen-2xl: 1536px; /* Large screens */
}
```

### Layout Containers

```css
.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 var(--space-4);

  @media (min-width: 640px) {
    max-width: 640px;
    padding: 0 var(--space-6);
  }

  @media (min-width: 768px) {
    max-width: 768px;
  }

  @media (min-width: 1024px) {
    max-width: 1024px;
    padding: 0 var(--space-8);
  }

  @media (min-width: 1280px) {
    max-width: 1280px;
  }

  @media (min-width: 1536px) {
    max-width: 1536px;
  }
}

.container-narrow {
  @extend .container;
  max-width: 768px;
}

.container-wide {
  @extend .container;
  max-width: 1400px;
}
```

### Grid Systems

```css
.grid {
  display: grid;
  gap: var(--space-6);

  /* Responsive Reports Grid */
  &.grid-reports {
    grid-template-columns: 1fr;

    @media (min-width: 640px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (min-width: 1024px) {
      grid-template-columns: repeat(3, 1fr);
    }

    @media (min-width: 1280px) {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  /* Dashboard Grid */
  &.grid-dashboard {
    grid-template-columns: 1fr;

    @media (min-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (min-width: 1024px) {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  /* Content Grid */
  &.grid-content {
    grid-template-columns: 1fr;

    @media (min-width: 1024px) {
      grid-template-columns: 1fr 300px;
      gap: var(--space-12);
    }
  }
}
```

---

## ✨ Micro-Interactions & Animation

### Animation Tokens

```css
:root {
  /* Duration */
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;

  /* Easing */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-elastic: cubic-bezier(0.68, -0.55, 0.265, 1.55);

  /* Common Transitions */
  --transition-base: all var(--duration-normal) var(--ease-in-out);
  --transition-colors:
    color var(--duration-fast) var(--ease-in-out),
    background-color var(--duration-fast) var(--ease-in-out),
    border-color var(--duration-fast) var(--ease-in-out);
  --transition-shadow: box-shadow var(--duration-normal) var(--ease-out);
  --transition-transform: transform var(--duration-normal) var(--ease-out);
  
  /* Button-specific transitions */
  --transition-button: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-button-hover: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Hover & Focus Animations

```css
.interactive-element {
  transition: var(--transition-base);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  &:active {
    transform: translateY(-1px);
    transition-duration: var(--duration-fast);
  }
}

.fade-in {
  animation: fadeIn var(--duration-normal) var(--ease-out);
}

.slide-up {
  animation: slideUp var(--duration-normal) var(--ease-out);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Loading States

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-neutral-200) 25%,
    var(--color-neutral-100) 50%,
    var(--color-neutral-200) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-md);
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-neutral-200);
  border-top: 2px solid var(--color-accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
```

---

## ♿ Accessibility Standards

### WCAG AA Compliance

#### Color Contrast Requirements

- **Normal text (16px)**: Minimum 4.5:1 contrast ratio
- **Large text (18px+ or 14px+ bold)**: Minimum 3:1 contrast ratio
- **UI components**: Minimum 3:1 contrast ratio
- **Graphics**: Minimum 3:1 contrast ratio

#### Focus Management

```css
.focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: var(--focus-ring-offset);
  border-radius: var(--radius-sm);
}

/* Hide focus ring for mouse users */
.focus:not(.focus-visible) {
  outline: none;
}
```

#### Motion Preferences

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

#### Screen Reader Support

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

---

## 🎯 Implementation Roadmap

### Phase 1: Foundation (Current Sprint)

1. **Color System Migration**
   - Update CSS custom properties with new monochrome palette
   - Implement semantic color tokens
   - Test contrast ratios for WCAG compliance

2. **Typography Enhancement**
   - Refine type scale with luxury proportions
   - Implement proper line heights and letter spacing
   - Update font loading strategy

3. **Component Base Updates**
   - Enhanced button system with micro-interactions
   - Improved form controls with better states
   - Updated card system with hover effects

### Phase 2: Advanced Components (Next Sprint)

1. **File Upload Enhancement**
   - Drag-and-drop with visual feedback
   - Image preview system
   - Upload progress indicators

2. **Report Card Redesign**
   - Improved image handling
   - Better status communication
   - Enhanced category visualization

3. **Navigation System**
   - Mobile-optimized header
   - Improved responsive behavior
   - Better active states

### Phase 3: Interactions & Polish (Future)

1. **Animation System**
   - Subtle micro-interactions
   - Loading state animations
   - Page transition effects

2. **Advanced Features**
   - Toast notification system
   - Modal dialogs
   - Tooltip system

3. **Mobile Optimization**
   - Touch-friendly interactions
   - Improved mobile forms
   - Better responsive images

---

## 📊 Component Library Architecture

### Shared UI Package Structure

```
packages/ui/src/
├── components/
│   ├── ui/                    # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── composite/             # Complex composite components
│   │   ├── report-card.tsx
│   │   ├── upload-zone.tsx
│   │   └── status-badge.tsx
│   └── layout/                # Layout components
│       ├── container.tsx
│       ├── grid.tsx
│       └── section.tsx
├── hooks/                     # Shared hooks
│   ├── use-upload.ts
│   ├── use-intersection.ts
│   └── use-media-query.ts
├── utils/                     # Utility functions
│   ├── cn.ts                  # className utility
│   ├── format.ts              # Formatting utilities
│   └── validation.ts          # Form validation
└── styles/
    ├── globals.css            # Design system tokens
    ├── components.css         # Component styles
    └── utilities.css          # Utility classes
```

### Design Token Integration with Tailwind v4

```javascript
// tailwind.config.js
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "rgb(from var(--color-primary-50) r g b / <alpha-value>)",
          500: "rgb(from var(--color-primary-500) r g b / <alpha-value>)",
          600: "rgb(from var(--color-primary-600) r g b / <alpha-value>)",
          700: "rgb(from var(--color-primary-700) r g b / <alpha-value>)",
        },
        neutral: {
          25: "rgb(from var(--color-neutral-25) r g b / <alpha-value>)",
          50: "rgb(from var(--color-neutral-50) r g b / <alpha-value>)",
          100: "rgb(from var(--color-neutral-100) r g b / <alpha-value>)",
          200: "rgb(from var(--color-neutral-200) r g b / <alpha-value>)",
          300: "rgb(from var(--color-neutral-300) r g b / <alpha-value>)",
          400: "rgb(from var(--color-neutral-400) r g b / <alpha-value>)",
          500: "rgb(from var(--color-neutral-500) r g b / <alpha-value>)",
          600: "rgb(from var(--color-neutral-600) r g b / <alpha-value>)",
          700: "rgb(from var(--color-neutral-700) r g b / <alpha-value>)",
          800: "rgb(from var(--color-neutral-800) r g b / <alpha-value>)",
          900: "rgb(from var(--color-neutral-900) r g b / <alpha-value>)",
          950: "rgb(from var(--color-neutral-950) r g b / <alpha-value>)",
        },
        surface: {
          background:
            "rgb(from var(--surface-background) r g b / <alpha-value>)",
          subtle: "rgb(from var(--surface-subtle) r g b / <alpha-value>)",
          muted: "rgb(from var(--surface-muted) r g b / <alpha-value>)",
          card: "rgb(from var(--surface-card) r g b / <alpha-value>)",
          elevated: "rgb(from var(--surface-elevated) r g b / <alpha-value>)",
        },
        text: {
          primary: "rgb(from var(--text-primary) r g b / <alpha-value>)",
          secondary: "rgb(from var(--text-secondary) r g b / <alpha-value>)",
          muted: "rgb(from var(--text-muted) r g b / <alpha-value>)",
          placeholder:
            "rgb(from var(--text-placeholder) r g b / <alpha-value>)",
          disabled: "rgb(from var(--text-disabled) r g b / <alpha-value>)",
        },
        border: {
          default: "rgb(from var(--border-default) r g b / <alpha-value>)",
          muted: "rgb(from var(--border-muted) r g b / <alpha-value>)",
          strong: "rgb(from var(--border-strong) r g b / <alpha-value>)",
          interactive:
            "rgb(from var(--border-interactive) r g b / <alpha-value>)",
        },
        damage: {
          pothole: "rgb(from var(--color-pothole) r g b / <alpha-value>)",
          crack: "rgb(from var(--color-crack) r g b / <alpha-value>)",
          other: "rgb(from var(--color-other) r g b / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
        display: ["var(--font-display)"],
      },
      fontSize: {
        "display-2xl": [
          "var(--text-display-2xl)",
          { lineHeight: "var(--leading-none)" },
        ],
        "display-xl": [
          "var(--text-display-xl)",
          { lineHeight: "var(--leading-tight)" },
        ],
        "display-lg": [
          "var(--text-display-lg)",
          { lineHeight: "var(--leading-tight)" },
        ],
        "display-md": [
          "var(--text-display-md)",
          { lineHeight: "var(--leading-snug)" },
        ],
        "display-sm": [
          "var(--text-display-sm)",
          { lineHeight: "var(--leading-snug)" },
        ],
      },
      spacing: {
        0.5: "var(--space-0_5)",
        1.5: "var(--space-1_5)",
        2.5: "var(--space-2_5)",
        3.5: "var(--space-3_5)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        "2xl": "var(--shadow-2xl)",
        inner: "var(--shadow-inner)",
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        button: "var(--shadow-button)",
        "button-hover": "var(--shadow-button-hover)",
        dropdown: "var(--shadow-dropdown)",
        modal: "var(--shadow-modal)",
        tooltip: "var(--shadow-tooltip)",
        focus: "var(--focus-ring)",
      },
      borderRadius: {
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        "3xl": "var(--radius-3xl)",
      },
      transitionDuration: {
        fast: "var(--duration-fast)",
        normal: "var(--duration-normal)",
        slow: "var(--duration-slow)",
        slower: "var(--duration-slower)",
      },
      transitionTimingFunction: {
        "ease-in": "var(--ease-in)",
        "ease-out": "var(--ease-out)",
        "ease-in-out": "var(--ease-in-out)",
        "ease-elastic": "var(--ease-elastic)",
      },
    },
  },
  plugins: [],
};
```

---

## 📋 Quality Assurance Checklist

### Design System Compliance

- [ ] All colors meet WCAG AA contrast requirements
- [ ] Typography scales are consistent across all breakpoints
- [ ] Spacing system is applied consistently
- [ ] Interactive elements have proper focus states
- [ ] Hover states provide clear feedback
- [ ] Loading states are implemented for async operations

### Component Standards

- [ ] All components use design tokens
- [ ] TypeScript interfaces are properly defined
- [ ] Props are documented with JSDoc
- [ ] Components are responsive by default
- [ ] Accessibility attributes are implemented
- [ ] Error states are handled gracefully
- [ ] Button hover states follow strategic color guidelines
- [ ] Interactive elements provide clear visual feedback

### Performance Requirements

- [ ] CSS custom properties are optimized
- [ ] Animations respect reduced motion preferences
- [ ] Images are properly optimized
- [ ] Critical CSS is inlined
- [ ] Font loading is optimized
- [ ] Bundle size is minimized

### Browser Support

- [ ] Modern browsers (Chrome, Firefox, Safari, Edge)
- [ ] Mobile Safari (iOS 14+)
- [ ] Chrome on Android (Android 8+)
- [ ] Graceful degradation for older browsers

---

This design system provides a comprehensive foundation for transforming Viralkan into a modern, luxury-inspired civic platform while maintaining accessibility, performance, and government appropriateness. The monochromatic color palette with strategic accent colors creates a professional aesthetic that builds trust with users while providing an excellent user experience for road damage reporting.
