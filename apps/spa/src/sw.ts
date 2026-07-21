/// <reference lib="webworker" />
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";

declare let self: ServiceWorkerGlobalScope;

const OFFLINE_CACHE = "spa-offline-v1";

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(OFFLINE_CACHE);
      await cache.addAll(["/"]);
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Only prune our offline cache versions — never Workbox precaches.
      const keys = await caches.keys();
      const deletions: Promise<boolean>[] = [];
      for (const key of keys) {
        if (key.startsWith("spa-offline-") && key !== OFFLINE_CACHE) {
          deletions.push(caches.delete(key));
        }
      }
      await Promise.all(deletions);
    })()
  );
});

// self.__WB_MANIFEST is the default injection point
precacheAndRoute(self.__WB_MANIFEST);
// clean old assets
cleanupOutdatedCaches();
let allowlist: RegExp[] | undefined;
// in dev mode, we disable precaching to avoid caching issues
if (import.meta.env.DEV) {
  allowlist = [/^\/$/u];
}
// to allow work offline
registerRoute(
  new NavigationRoute(createHandlerBoundToURL("index.html"), { allowlist })
);

self.addEventListener("push", (event) => {
  const data = (event.data?.json() ?? {}) as {
    body?: string;
    title?: string;
  };

  event.waitUntil(
    self.registration.showNotification(data.title ?? "@workspace/spa", {
      body: data.body ?? "New notification",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow("/"));
});
