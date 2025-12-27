import process from "node:process";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
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

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
      {
        protocol: "https",
        hostname: "pub-a92479a419274fd9b8ad6fcb0343cc69.r2.dev",
      },
      {
        protocol: "https",
        hostname: "b9a99e8b2fe716b07096322bf85db654.r2.cloudflarestorage.com",
        pathname: "/viralkan-app/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60,
  },
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  // Disable SWC lockfile patching to avoid workspace issues
  experimental: {
    useWasmBinary: false,
    scrollRestoration: true,
  },
  output: "standalone",
  // Optimize bundle
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default withPWA(nextConfig);
