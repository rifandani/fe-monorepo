import path from "node:path";
import process from "node:process";

import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { devtools as tanstackDevtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { Unhead } from "@unhead/react/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import type { PluginOption } from "vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    tanstackDevtools(),
    tailwindcss(),
    react(),
    Unhead(),
    babel({
      presets: [reactCompilerPreset()],
    }),
    tanstackRouter(),
    visualizer({
      filename: "html/visualizer-stats.html",
    }) as unknown as PluginOption,
    VitePWA({
      // includeAssets: ['*.ico', '*.svg', '*.png'],
      strategies: "generateSW",
      // when using strategies 'injectManifest' you need to provide the srcDir
      // srcDir: 'src',
      // when using strategies 'injectManifest' use claims-sw.ts or prompt-sw.ts
      // filename: 'prompt-sw.ts',
      registerType: "prompt",
      injectRegister: false,
      pwaAssets: {
        config: true,
        disabled: false,
        htmlPreset: "2023",
        overrideManifestIcons: true,
      },
      manifest: {
        description: "Bulletproof React.js 19 Template",
        display_override: ["window-controls-overlay"],
        icons: [
          {
            sizes: "64x64",
            src: "pwa-64x64.png",
            type: "image/png",
          },
          {
            sizes: "192x192",
            src: "pwa-192x192.png",
            type: "image/png",
          },
          {
            sizes: "512x512",
            src: "pwa-512x512.png",
            type: "image/png",
          },
          {
            purpose: "maskable",
            sizes: "512x512",
            src: "maskable-icon-512x512.png",
            type: "image/png",
          },
        ],
        name: "@workspace/spa",
        short_name: "@workspace/spa",
        theme_color: "#ffffff",
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        globPatterns: [
          "**/*.{html,css,js,json,txt,ico,svg,jpg,png,webp,woff,woff2,ttf,eot,otf,wasm}",
        ],
      },
      injectManifest: {
        globPatterns: [
          "**/*.{html,css,js,json,txt,ico,svg,jpg,png,webp,woff,woff2,ttf,eot,otf,wasm}",
        ],
      },
      devOptions: {
        enabled: process.env.NODE_ENV === "development",
        navigateFallback: "index.html",
        suppressWarnings: true,
        /* when using generateSW the PWA plugin will switch to classic */
        type: "module",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "@workspace/core": path.resolve(
        import.meta.dirname,
        "../../packages/core/src"
      ),
    },
  },
  server: {
    port: 3001,
    forwardConsole: true,
    // Browser OTLP must be same-origin when the app is served over HTTPS (e.g. portless).
    proxy: {
      "/v1/metrics": {
        changeOrigin: true,
        target: "http://localhost:4318",
      },
      "/v1/traces": {
        changeOrigin: true,
        target: "http://localhost:4318",
      },
    },
  },
});
