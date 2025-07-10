# Viralkan Landing Page Implementation Plan

## Community-Powered Road Damage Awareness Platform

---

## 🎯 **Landing Page Strategy & Design**

### **Project Context:**

- **Platform Pivot:** From a direct reporting tool to a community-powered awareness platform.
- **Core Value Proposition:**
  1.  Show people the extent of road damage.
  2.  Empower users to make issues viral on social media, leveraging "viral-based policy".
  3.  Help drivers identify and avoid damaged roads.
- **Tech Stack:** Next.js 15, Tailwind CSS v4, shadcn/ui, TypeScript.
- **Explicit Limitations:** The platform does NOT forward reports to government agencies and does NOT track repair progress. This must be clearly communicated.

### **Styling Approach (Tailwind CSS Only):**

- **No Custom CSS Classes:** All styling will be implemented using Tailwind's utility classes directly in the JSX.
- **Arbitrary Values:** For specific design needs, Tailwind's arbitrary value syntax will be used (e.g., `text-[clamp(2.5rem,5vw,4rem)]`).
- **Theme Configuration:** Colors and theming will continue to be managed via CSS variables in `apps/web/app/globals.css` as it integrates with Tailwind's `@theme` directive.

---

## 📋 **Task 1.1: Component Architecture (Rule-Compliant)**

### **File Structure to Create/Update:**

```
apps/web/
├── components/
│   ├── common/
│   │   ├── section-container.tsx   # Reusable section wrapper with consistent padding
│   │   ├── feature-card.tsx        # Card for showcasing features
│   │   └── stat-card.tsx           # Statistics display card
│   ├─── landing/
│   │       ├── hero-section.tsx        # Hero with new messaging and CTAs
│   │       ├── value-prop-section.tsx  # Highlights the "why" (viral, awareness)
│   │       ├── how-it-works-section.tsx# 3-step user journey (Report, Viral, Avoid)
│   │       ├── disclaimer-section.tsx  # Explicitly states platform limitations
│   │       └── stats-section.tsx       # Impact numbers (reports, shares)
│   │
│   └── layout/
│       ├── header.tsx              # Site navigation
│       └── footer.tsx              # Site footer
└── app/
    ├── page.tsx                    # Landing page entry point
    └── layout.tsx                  # Root layout (update metadata)
```

---

## 📋 **Task 1.2: Content Strategy (Viral & Awareness Focus)**

### **Hero Section:**

- **Headline:** "Jalan Rusak? Jangan Diam, Viralkan!" (Damaged Road? Don't Stay Silent, Make it Viral!)
- **Subheadline:** "Petakan, bagikan, dan hindari jalan rusak di seluruh Indonesia. Jadikan suaramu terdengar lewat kekuatan media sosial." (Map, share, and avoid damaged roads across Indonesia. Make your voice heard through the power of social media.)
- **CTAs:**
  - Primary: "Lihat Peta Laporan" (View Reports Map)
  - Secondary: "Cara Kerja" (How it Works)

### **Value Proposition Section (Why Viralkan?):**

1.  **Kebijakan Berbasis Viral (Viral-Based Policy):** "Di Indonesia, suara netizen punya kekuatan. Laporan yang viral lebih cepat mendapat perhatian." (In Indonesia, the voice of netizens has power. Viral reports get attention faster.)
2.  **Informasi Untuk Keselamatan (Information for Safety):** "Ketahui rute mana yang harus dihindari. Rencanakan perjalanan Anda dengan lebih aman." (Know which routes to avoid. Plan your trip more safely.)
3.  **Kekuatan Komunitas (Community Power):** "Data dari masyarakat, oleh masyarakat. Bersama kita ciptakan transparansi infrastruktur." (Data from the community, for the community. Together we create infrastructure transparency.)

### **How It Works Section (3 Simple Steps):**

1.  **Laporkan (Report):** "Ambil foto, tandai lokasi, dan unggah dalam hitungan detik." (Take a photo, mark the location, and upload in seconds.)
2.  **Viralkan (Make it Viral):** "Bagikan laporanmu langsung ke Twitter, Facebook & Instagram dengan satu klik." (Share your report directly to Twitter, Facebook & Instagram with one click.)
3.  **Waspada (Be Aware):** "Gunakan peta interaktif kami untuk melihat kondisi jalan dan merencanakan perjalanan." (Use our interactive map to see road conditions and plan your journey.)

### **Statistics Section (Focus on Community Impact):**

- Total Laporan: "1,247 Laporan Terkumpul"
- Total Dibagikan: "5,890 Kali Dibagikan"
- Wilayah Terpetakan: "23 Kota di Indonesia"

### **Disclaimer Section (Crucial for Transparency):**

- **Headline:** "Peran Kami & Batasan Platform" (Our Role & Platform Limitations)
- **Content:** "Viralkan adalah platform independen yang digerakkan oleh komunitas. Kami **tidak berafiliasi** dengan instansi pemerintah dan **tidak dapat menjamin** perbaikan jalan. Tujuan kami adalah murni untuk meningkatkan kesadaran publik dan keselamatan berkendara melalui kekuatan viral media sosial." (Viralkan is an independent, community-driven platform. We are **not affiliated** with government agencies and **cannot guarantee** road repairs. Our purpose is purely to increase public awareness and driver safety through the viral power of social media.)

---

## 📋 **Task 1.3: Implementation Sequence**

### **Phase 1: Foundation (1.5 hours)**

1.  **Create Directory Structure:** Set up the `common` and `features/landing` directories.
2.  **Create Layout Components:** Build `Header` and `Footer`.
3.  **Update `app/layout.tsx`:** Set new metadata (title, description).
4.  **Build `SectionContainer`:** A reusable `div` with consistent Tailwind padding classes (`py-16 sm:py-24`, `px-4 sm:px-6 lg:px-8`).

### **Phase 2: Content Sections (2.5 hours)**

1.  **Build `HeroSection`:** Implement with new copy and CTAs using Tailwind classes for typography and layout.
2.  **Build `ValuePropSection`:** Create the 3-column section highlighting the new value propositions.
3.  **Build `HowItWorksSection`:** Create the 3-step process section.
4.  **Build `StatsSection`:** Display the community impact numbers.
5.  **Build `DisclaimerSection`:** Add the critical transparency statement with emphasis.

### **Phase 3: Assembly & Polish (1 hour)**

1.  **Assemble `app/page.tsx`:** Import and arrange all the landing page sections.
2.  **Mobile Optimization:** Thoroughly test and refine responsive styles on all breakpoints using Tailwind's screen variants.
3.  **Final Review:** Check spacing, typography, and accessibility.

---

## 📋 **Task 1.4: Success Criteria**

- [ ] **No Custom CSS:** The entire page is built using only Tailwind CSS utility classes.
- [ ] **Clear Messaging:** The user immediately understands the platform is for awareness and virality, not official reporting.
- [ ] **Disclaimer is Prominent:** The platform's limitations are clearly and honestly stated.
- [ ] **File Structure is Compliant:** All components are organized according to the `frontend-rule`.
- [ ] **Fully Responsive:** The layout is flawless on devices from mobile to desktop.
- [ ] **SEO Ready:** Page has proper `<title>` and `<meta name="description">`.

**Ready for execution once approved! 🚀**
