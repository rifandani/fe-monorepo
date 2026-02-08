import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import process from 'node:process'
import { visualizer } from 'rollup-plugin-visualizer'
import type { PluginOption } from 'vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@workspace/core': path.resolve(__dirname, '../../packages/core/src'),
    },
  },
  server: {
    port: 3001,
  },
  plugins: [
    devtools(),
    tailwindcss(),
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
    tanstackRouter(),
    visualizer({
      filename: 'html/visualizer-stats.html',
    }) as unknown as PluginOption,
    VitePWA({
      // includeAssets: ['*.ico', '*.svg', '*.png'],
      strategies: 'generateSW',
      // when using strategies 'injectManifest' you need to provide the srcDir
      // srcDir: 'src',
      // when using strategies 'injectManifest' use claims-sw.ts or prompt-sw.ts
      // filename: 'prompt-sw.ts',
      registerType: 'prompt',
      injectRegister: false,
      pwaAssets: {
        disabled: false,
        config: true,
        htmlPreset: '2023',
        overrideManifestIcons: true,
      },
      manifest: {
        name: '@workspace/spa',
        short_name: '@workspace/spa',
        description: 'Bulletproof React.js 19 Template',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        display_override: ['window-controls-overlay'],
      },
      workbox: {
        globPatterns: ['**/*.{html,css,js,json,txt,ico,svg,jpg,png,webp,woff,woff2,ttf,eot,otf,wasm}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },
      injectManifest: {
        globPatterns: ['**/*.{html,css,js,json,txt,ico,svg,jpg,png,webp,woff,woff2,ttf,eot,otf,wasm}'],
      },
      devOptions: {
        enabled: process.env.NODE_ENV === 'development',
        navigateFallback: 'index.html',
        suppressWarnings: true,
        /* when using generateSW the PWA plugin will switch to classic */
        type: 'module',
      },
    }),
  ],
})
