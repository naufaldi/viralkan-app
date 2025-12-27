# Implement PWA Configuration & Service Worker for Viralkan App

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

If PLANS.md file is checked into the repo, reference the path to that file here from the repository root and note that this document must be maintained in accordance with PLANS.md.

This document follows the requirements in `.agent/PLANS.md` and creates a corresponding task list in `todo/work/2025-12-17-implement-pwa-config/todos.md`.

## Purpose / Big Picture

After implementing this plan, users will be able to install the Viralkan road damage reporting app as a native-like Progressive Web App on their mobile devices and desktops. The app will work offline, cache API responses for faster loading, and provide an install prompt when appropriate. Users can access the app from their home screen, receive push notifications, and use it without an internet connection for basic functionality.

## Progress

- [x] (2025-12-17 12:00Z) Research current PWA libraries and best practices for Next.js 16
- [x] (2025-12-27) Install next-pwa package and update package.json
- [x] (2025-12-27) Configure next.config.js with PWA settings and Workbox caching
- [x] (2025-12-27) Create web app manifest using Next.js metadata API
- [x] (2025-12-27) Create PWA logo (SVG) and update manifest
- [ ] Generate PNG icons from logo.svg (192x192, 512x512)
- [x] (2025-12-27) Create offline fallback page at app/offline/page.tsx
- [x] (2025-12-27) Create PWA install prompt component with hook
- [x] (2025-12-27) Update root layout to include PWA components and manifest
- [ ] Test PWA installation, offline functionality, and caching
- [ ] Run Lighthouse PWA audit and fix any issues

## Surprises & Discoveries

- Next.js 16 has built-in PWA support through metadata API, making manifest creation simpler
- The `next-pwa` package is the recommended solution over vite-plugin-pwa for Next.js applications
- Workbox runtime caching can be configured to specifically cache API responses from the Hono backend

## Decision Log

- Decision: Use `next-pwa` package instead of `vite-plugin-pwa` since the app uses Next.js, not Vite
  Rationale: `next-pwa` is specifically designed for Next.js and provides better integration with the framework
  Date/Author: 2025-12-17

- Decision: Use Next.js 15+ metadata API for manifest instead of static JSON file
  Rationale: Provides better TypeScript support and allows dynamic manifest generation
  Date/Author: 2025-12-17

- Decision: Configure Workbox to cache API responses with network-first strategy
  Rationale: Ensures fresh data for road reports while providing offline fallback
  Date/Author: 2025-12-17

- Decision: Use ESM import for `next-pwa` in `next.config.js`
  Rationale: The project already uses ESM for Next.js configuration
  Date/Author: 2025-12-27

- Decision: Use `Viewport` export in `layout.tsx` for theme settings
  Rationale: Next.js 14+ recommended way to handle viewport and theme metadata
  Date/Author: 2025-12-27

- Decision: Add empty `turbopack: {}` to `next.config.js`
  Rationale: Next.js 16 uses Turbopack by default, which conflicts with `next-pwa`'s webpack injection. Explicitly acknowledging this allows the build to proceed.
  Date/Author: 2025-12-27

## Outcomes & Retrospective

_To be filled after implementation completion_

## Context and Orientation

The Viralkan app is a Next.js 16 application (located in `apps/web/`) that reports road damage in Bekasi, Indonesia. It currently has no PWA capabilities. The app communicates with a Hono API backend (in `apps/api/`) for report data. The current `package.json` shows Next.js 16.0.7 with React 19.2.1, but no PWA-related dependencies.

Key files to be modified:

- `apps/web/package.json` - Add PWA dependencies
- `apps/web/next.config.js` - Configure PWA plugin
- `apps/web/app/manifest.ts` - Web app manifest (new file)
- `apps/web/app/offline/page.tsx` - Offline fallback page (new file)
- `apps/web/app/layout.tsx` - Update to include PWA components
- `apps/web/public/` - Add app icons (icon-192x192.png, icon-512x512.png)

## Plan of Work

1. Install the `next-pwa` package as a dependency in the web app's package.json
2. Create a `next.config.js` file with PWA configuration including Workbox settings for API caching
3. Create a manifest.ts file using Next.js metadata API with app name, icons, and display settings
4. Add PWA app icons (192x192 and 512x512) to the public directory
5. Create an offline fallback page that shows when the app is offline
6. Create a PWA install prompt component with React hooks for detecting installability
7. Update the root layout to include the install prompt component
8. Test the PWA functionality including installation, offline mode, and caching
9. Run Lighthouse PWA audit and address any issues

## Concrete Steps

### 1. Install Dependencies

Run in `apps/web/` directory:

```bash
bun add next-pwa
bun add -d @types/next-pwa  # if needed
```

### 2. Configure Next.js PWA

Create `apps/web/next.config.js`:

```javascript
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\/api\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
  ],
});

module.exports = withPWA({
  // existing config if any
});
```

### 3. Create Web App Manifest

Create `apps/web/app/manifest.ts`:

```typescript
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Viralkan - Road Damage Reporter",
    short_name: "Viralkan",
    description: "Report and track road damage in Bekasi, Indonesia",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
```

### 4. Add App Icons

Add the following files to `apps/web/public/`:

- `icon-192x192.png` - 192x192 pixel app icon
- `icon-512x512.png` - 512x512 pixel app icon

### 5. Create Offline Page

Create `apps/web/app/offline/page.tsx`:

```typescript
export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">You're Offline</h1>
      <p className="text-gray-600 text-center mb-6">
        It looks like you're not connected to the internet.
        Some features may not be available.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Try Again
      </button>
    </div>
  );
}
```

### 6. Create PWA Install Hook

Create `apps/web/hooks/usePWAInstall.ts`:

```typescript
import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstallable(false);
    }

    setDeferredPrompt(null);
  };

  return { isInstallable, install };
}
```

### 7. Create Install Prompt Component

Create `apps/web/components/PWAInstallPrompt.tsx`:

```typescript
'use client';

import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useState } from 'react';

export function PWAInstallPrompt() {
  const { isInstallable, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  if (!isInstallable || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-lg p-4 shadow-lg z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">Install Viralkan</h3>
          <p className="text-sm text-gray-600 mt-1">
            Install our app for a better experience and offline access.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="ml-2 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
      </div>
      <Button onClick={install} className="w-full mt-3">
        Install App
      </Button>
    </div>
  );
}
```

### 8. Update Root Layout

Modify `apps/web/app/layout.tsx` to include the PWA components and manifest:

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Viralkan - Road Damage Reporter',
  description: 'Report and track road damage in Bekasi, Indonesia',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <PWAInstallPrompt />
      </body>
    </html>
  );
}
```

### 9. Test PWA Functionality

Run the development server and test:

```bash
cd apps/web && bun run dev
```

Test in browser:

1. Check if install prompt appears
2. Test offline functionality by going offline
3. Verify service worker registration in DevTools

### 10. Run Lighthouse Audit

Open Chrome DevTools > Lighthouse tab and run PWA audit.

## Validation and Acceptance

The implementation is successful when:

- Users can install the app from their browser's install prompt
- The app opens in standalone mode when installed
- The app works offline and shows the offline page when network is unavailable
- API responses are cached and work offline
- Lighthouse PWA audit scores 90+ on all PWA criteria

## Idempotence and Recovery

All steps are idempotent and can be repeated safely. If configuration changes are needed, they can be updated in the respective config files. The PWA functionality can be disabled in development by setting the `disable` option in next.config.js.

## Artifacts and Notes

Key files created/modified:

- `apps/web/package.json` - Added next-pwa dependency
- `apps/web/next.config.js` - PWA configuration with Workbox caching
- `apps/web/app/manifest.ts` - Web app manifest
- `apps/web/public/icon-192x192.png` - App icon
- `apps/web/public/icon-512x512.png` - App icon
- `apps/web/app/offline/page.tsx` - Offline fallback page
- `apps/web/hooks/usePWAInstall.ts` - PWA install hook
- `apps/web/components/PWAInstallPrompt.tsx` - Install prompt component
- `apps/web/app/layout.tsx` - Updated to include PWA components

## Interfaces and Dependencies

**External Dependencies:**

- `next-pwa`: ^5.6.0 - PWA plugin for Next.js
- Workbox: Included with next-pwa for service worker and caching

**New Components:**

- `PWAInstallPrompt`: React component that shows install prompt
- `usePWAInstall`: Custom hook for PWA install functionality

**New Routes:**

- `/offline`: Fallback page shown when offline
- `/manifest.json`: Auto-generated from manifest.ts

**Configuration:**

- Service worker generated in `public/sw.js`
- Workbox runtime caching configured for API routes
- Manifest served at `/manifest.json`
