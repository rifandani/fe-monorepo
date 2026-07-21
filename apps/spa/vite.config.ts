import path from "node:path";
import process from "node:process";

import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { devtools as tanstackDevtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { Unhead } from "@unhead/react/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import type { Plugin, PluginOption } from "vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

/**
 * Dev-only: alias /sw.js → VitePWA's /dev-sw.js?dev-sw for static checkers.
 * Production build emits dist/sw.js and registers it via virtual:pwa-register.
 */
const serveDevServiceWorker = (): Plugin => ({
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      const url = req.url?.split("?")[0] ?? "";
      if (url === "/sw.js") {
        req.url = "/dev-sw.js?dev-sw";
      }
      next();
    });
  },
  name: "serve-dev-service-worker",
});

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
    serveDevServiceWorker(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      registerType: "prompt",
      injectRegister: false,
      pwaAssets: {
        config: true,
        disabled: false,
        htmlPreset: "2023",
        overrideManifestIcons: true,
      },
      manifest: {
        background_color: "#ffffff",
        description: "Bulletproof React.js 19 Template",
        display: "standalone",
        display_override: ["window-controls-overlay"],
        file_handlers: [
          {
            accept: {
              "text/plain": [".txt"],
            },
            action: "/",
          },
        ],
        handle_links: "preferred",
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
            sizes: "384x384",
            src: "pwa-384x384.png",
            type: "image/png",
          },
          {
            sizes: "512x512",
            src: "pwa-512x512.png",
            type: "image/png",
          },
          {
            sizes: "1024x1024",
            src: "pwa-1024x1024.png",
            type: "image/png",
          },
          {
            purpose: "maskable",
            sizes: "192x192",
            src: "maskable-icon-192x192.png",
            type: "image/png",
          },
          {
            purpose: "maskable",
            sizes: "384x384",
            src: "maskable-icon-384x384.png",
            type: "image/png",
          },
          {
            purpose: "maskable",
            sizes: "512x512",
            src: "maskable-icon-512x512.png",
            type: "image/png",
          },
          {
            purpose: "maskable",
            sizes: "1024x1024",
            src: "maskable-icon-1024x1024.png",
            type: "image/png",
          },
        ],
        name: "@workspace/spa",
        orientation: "any",
        screenshots: [
          {
            form_factor: "wide",
            sizes: "1280x720",
            src: "screenshot-wide.png",
            type: "image/png",
          },
          {
            form_factor: "narrow",
            sizes: "750x1334",
            src: "screenshot-narrow.png",
            type: "image/png",
          },
        ],
        share_target: {
          action: "/",
          method: "GET",
          params: {
            text: "text",
            title: "title",
            url: "url",
          },
        },
        short_name: "@workspace/spa",
        shortcuts: [
          {
            description: "Open the home page",
            name: "Home",
            short_name: "Home",
            url: "/",
          },
          {
            description: "Sign in to your account",
            name: "Login",
            short_name: "Login",
            url: "/login",
          },
        ],
        theme_color: "#ffffff",
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
