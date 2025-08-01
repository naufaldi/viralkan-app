/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "picsum.photos",
      "ui-avatars.com",
      "pub-a92479a419274fd9b8ad6fcb0343cc69.r2.dev",
      "lh3.googleusercontent.com",
      "images.unsplash.com",
    ],
  },
  // Disable SWC lockfile patching to avoid workspace issues
  experimental: {
    useWasmBinary: false,
  },
  output: "standalone",
};

export default nextConfig;
