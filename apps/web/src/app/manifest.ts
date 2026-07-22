import type { MetadataRoute } from "next";

const manifest = (): MetadataRoute.Manifest => ({
  background_color: "#FFFFFF", // Color for potential splash if any system tried to use it
  description: "Bulletproof Next.js 15 Template",
  display: "browser", // Explicitly use the browser UI
  display_override: ["window-controls-overlay"],
  icons: [
    {
      sizes: "64x64",
      src: "/pwa-64x64.png",
      type: "image/png",
    },
    {
      sizes: "192x192",
      src: "/pwa-192x192.png",
      type: "image/png",
    },
    {
      purpose: "any",
      sizes: "512x512",
      src: "/pwa-512x512.png",
      type: "image/png",
    },
    {
      purpose: "maskable",
      sizes: "512x512",
      src: "/maskable-icon-512x512.png",
      type: "image/png",
    },
  ],
  name: "@workspace/web",
  short_name: "@workspace/web",
  start_url: "/", // Or your preferred landing page
  theme_color: "#155DFC", // Your brand's theme color,
});
export default manifest;
