import type { MetadataRoute } from 'next'

// we don't recommend to pursue PWA (use full client-side app instead), but this is a minimal manifest file
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '@workspace/web',
    short_name: '@workspace/web',
    description: 'Bulletproof Next.js 15 Template',
    start_url: '/', // Or your preferred landing page
    display: 'browser', // Explicitly use the browser UI
    theme_color: '#155DFC', // Your brand's theme color
    background_color: '#FFFFFF', // Color for potential splash if any system tried to use it
    icons: [
      {
        src: '/pwa-64x64.png',
        sizes: '64x64',
        type: 'image/png',
      },
      {
        src: '/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/maskable-icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    display_override: ['window-controls-overlay'],
  }
}
