/// <reference lib="webworker" />
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";

declare let self: ServiceWorkerGlobalScope;

const OFFLINE_CACHE = "spa-offline-v1";

/** A `postMessage` from the page that asks this worker to activate now. */
const isSkipWaitingMessage = (
  data: unknown
): data is { type: "SKIP_WAITING" } =>
  typeof data === "object" &&
  data !== null &&
  "type" in data &&
  data.type === "SKIP_WAITING";

interface PushPayload {
  body?: string;
  title?: string;
}

const isOptionalString = (value: unknown): value is string | undefined =>
  value === undefined || typeof value === "string";

interface PushPayloadInput {
  body?: unknown;
  title?: unknown;
}

const isObject = (value: unknown): value is PushPayloadInput =>
  typeof value === "object" && value !== null;

/** The push payload is attacker-visible JSON, so every field is checked. */
const isPushPayload = (data: unknown): data is PushPayload =>
  isObject(data) && isOptionalString(data.body) && isOptionalString(data.title);

self.addEventListener("message", (event) => {
  if (isSkipWaitingMessage(event.data)) {
    void self.skipWaiting();
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
  const payload: unknown = event.data?.json();
  const data: PushPayload = isPushPayload(payload) ? payload : {};

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
