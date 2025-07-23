import type { Metadata } from "next";
import localFont from "next/font/local";
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
