import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { getAuthUser } from "../lib/auth-server";
import { Toaster } from "@repo/ui";
import { Providers } from "../lib/providers";

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
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
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
            <Toaster />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
