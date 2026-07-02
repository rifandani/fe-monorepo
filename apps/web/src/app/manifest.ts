import type { MetadataRoute } from "next";

// we don't recommend to pursue PWA (use full client-side app instead), but this is a minimal manifest file
export default function manifest(): MetadataRoute.Manifest {
  return {
    // Color for potential splash if any system tried to use it
    background_color: "#FFFFFF",
    description: "Bulletproof Next.js 15 Template",
    // Explicitly use the browser UI
    display: "browser",
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
    // Or your preferred landing page
    start_url: "/",
    // Your brand's theme color
    theme_color: "#155DFC",
  };
}
