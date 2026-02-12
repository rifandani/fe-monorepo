# Progressive Web App (PWA)

Use `vite-plugin-pwa` in `vite.config.ts` to generate web app manifest and service worker.
PWA using [`generateSW` strategy](https://vite-pwa-org.netlify.app/guide/service-worker-strategies-and-behaviors.html) to generate the service worker and with [`prompt` behavior](https://vite-pwa-org.netlify.app/guide/prompt-for-update.html) registration type.

Use `@vite-pwa/assets-generator` to generate the icon assets. Check the assets generator config in `pwa-assets.config.ts`.
