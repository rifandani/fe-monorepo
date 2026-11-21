# SPA telemetry, PWA and UI details

> Recorded on 2026-11-20 from the comments in `apps/spa` ([ADR-0011](./0011-code-carries-no-comments.md)).

## Telemetry (`lib/layers/telemetry.ts`, `utils/telemetry.ts`)

- Telemetry uses `WebSdk` from `@effect/opentelemetry`, through a subpath import. The package barrel leaves out `WebSdk` and `NodeSdk`, so the browser bundle never pulls the Node SDK. `WebSdk` has no Node APIs, so telemetry stays a pure SPA concern.
- In dev (and over portless HTTPS), OTLP goes same-origin through the Vite proxy, which avoids CORS and mixed content.
- Only browser facts with bounded cardinality become resource attributes.
- `recordException` records one failed span. The span fails with a defect that has the original message and stack, so the tracer marks it ERROR. The Effect itself always succeeds: reporting a failure must never become one.
- `String()` throws for an object with no prototype, or with a `toString` that is not a function. Reporting must not throw, so that case reads as the object tag (`[object Object]`).

## Web Vitals (`utils/web-vitals.ts`)

- Web Vitals are judged at p75, so each histogram has its own buckets, with the Good and Poor thresholds of the metric exactly on bucket edges. Then "% of sessions rated good" is an exact count, not an interpolation.

  | Metric | Good | Poor |
  | ------ | ---- | ---- |
  | LCP | ≤ 2500 ms | > 4000 ms |
  | INP | ≤ 200 ms | > 500 ms |
  | CLS | ≤ 0.1 | > 0.25 |
  | FCP | ≤ 1800 ms | > 3000 ms |
  | TTFB | ≤ 800 ms | > 1800 ms |

- Attribute keys are snake_case (OTEL semantic conventions). `delta` is left out, because its cardinality has no bound.
- LCP, FCP and TTFB are recorded at once. CLS and INP keep the latest value per metric id and are recorded once, when the page hides, to avoid bias from many reports. A histogram sample cannot be taken back, so the first value at hide time wins, although CLS can report a higher value after hide → show → hide.
- On hide, the module records every buffered sample, then drains the reader, always: an immediate sample only leaves the browser on the periodic tick. A failed export at hide is not useful to report, but an unhandled rejection would feed back into error reporting, so it is caught.
- Our `visibilitychange` listener is registered after the `on*` calls, so web-vitals finalizes CLS, INP and LCP first. `pagehide` is only a backup: a mobile tab in the background is often killed without it.

## PWA

- `navigator.onLine` is optional in the spec, so an absent flag means online.
- When both are true, `offlineReady` takes the toast message and `needRefresh` gives the reload action. Both can be true on the first update after an install.
- The service worker checks each field of a push payload, because the JSON is visible to an attacker. It prunes only our offline cache versions, never the Workbox precaches.
- In dev, `/sw.js` is an alias of VitePWA's `/dev-sw.js?dev-sw`, for static checkers. The build emits `dist/sw.js`.

## Bundle and UI

- The `master-design` route module imports no catalog or UI code, so the static import from `routeTree` cannot pull Intent UI into the main chunk (the PWA precache limit is 2 MiB). `AreaChart` is not re-exported from the `ui` barrel, to keep recharts out of the main chunk; the catalog imports it directly.
- `Entry` is the only owner of the color-mode class on `<html>`. Everything else reads the theme from `themeAtom`. `system` has no class: it uses the one that the system prefers. Sonner resolves `system` with the same media query, so the toast provider passes the theme as it is.
- Feature Flags: outside DEV, an ON override is never honored. Overrides are decoded on read: an override for a removed flag is dropped, and a malformed value drops all overrides, never a half-trusted mix.
- `useSeo` is a two-line adapter over a pure function (the Logic Seam of ADR-0001).
- The catalog scroll spy marks the last section whose top is above a line at 20% of the viewport, with an override at the bottom of the page. During a smooth scroll from a click, the spy is paused, so the highlight does not flicker. The active id goes to the URL hash with `replaceState`.
- The color palette resolves any CSS color (oklch, oklab) to RGBA by painting one pixel; a sentinel fill shows a rejected color. Fixtures are hand-written constants, not faker, so the catalog looks the same on each reload. Color fixtures are HSL, because hue-channel widgets throw on RGB hex.
- TanStack devtools `pluginsTabContent` forces `width/height: 100%` on two levels of children, so the Feature Flags panel has one extra wrapper.
