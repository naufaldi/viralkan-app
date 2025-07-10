import type { Metadata } from "next";
import localFont from "next/font/local";
import './globals.css'

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
  description: "Petakan, bagikan, dan hindari jalan rusak di seluruh Indonesia. Jadikan suaramu terdengar lewat kekuatan media sosial.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
