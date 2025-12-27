import type { MetadataRoute } from "next";

/**
 * Web App Manifest for Viralkan
 * Used to define how the application looks and behaves when installed on a device.
 */
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
        src: "/logo.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/logo.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
