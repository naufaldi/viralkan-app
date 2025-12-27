import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { getAuthUser } from "../lib/auth-server";
import { Toaster } from "@repo/ui";
import { Providers } from "../lib/providers";
import { ReactNode } from "react";
import { PWAInstallPrompt } from "../components/PWAInstallPrompt";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Viralkan - Jalan Rusak? Jangan Diam, Viralkan!",
  description:
    "Petakan, bagikan, dan hindari jalan rusak di seluruh Indonesia. Jadikan suaramu terdengar lewat kekuatan media sosial.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Viralkan",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  // Get initial server-side user state
  const initialUser = await getAuthUser();

  return (
    <html lang="en">
      <head>
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
            data-enabled="true"
          />
        )}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>
          <AuthProvider initialUser={initialUser}>
            {children}
            <PWAInstallPrompt />
            <Toaster />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
