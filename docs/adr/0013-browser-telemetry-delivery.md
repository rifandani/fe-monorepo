# Browser telemetry delivery

> Recorded on 2026-11-26. Issue #219.

The spa exports traces through a `BatchSpanProcessor` and metrics through a `PeriodicExportingMetricReader`. Both keep data in memory and send it later. Before this ADR, only `web-vitals.ts` flushed the metric reader when the page hid. No code flushed the span processor. A span for an error just before the page closes stayed in memory and was lost. A created span is not a delivered span.

## Vocabulary

**Telemetry Delivery**: Sending the spans and metrics that the exporters keep in memory, before the browser stops the page. _Avoid_: telemetry flush (a flush is one step of the delivery)

**Flush Hook**: A function that a module registers with `onBeforeTelemetryFlush`. It records the last values of the module (for example, the latest CLS and INP) before the exporters send them.

## Decisions

- **One module owns the page-hide listeners.** `apps/spa/src/utils/telemetry-delivery.ts` adds a `visibilitychange` listener and a `pagehide` listener. No other module adds listeners to deliver telemetry.
- **A hidden page flushes both exporters.** On `visibilitychange` to `hidden`, and on `pagehide`, `flushTelemetry` runs the Flush Hooks, then calls `forceFlush` on each exporter in `bufferedExporters`: the span processor and the metric reader. `visibilitychange` is the primary signal: on mobile, the browser can stop a hidden page and not send `pagehide`. `pagehide` is the backup.
- **Flush Hooks run before the exporters flush.** A metric that a hook records is in the same export.
- **A failure does not stop a flush.** `flushTelemetry` ignores a Flush Hook that throws and a rejected `forceFlush`, and it never rejects. A metrics hook that fails must not stop the span flush. The browser closes the page, so there is nothing to retry.
- **`telemetry.ts` exports one list, `bufferedExporters`.** It holds the span processor and the metric reader. They are module constants, so that the delivery module flushes the same instances that `TelemetryLive` gives to the SDK. `flushTelemetry` flushes each item of the list, so a new exporter changes only `telemetry.ts`.
- **`main.tsx` starts the delivery.** It calls `deliverTelemetryOnHide()` before `reportWebVitals()`. Both functions are wrapped in `once` from `radashi`, so they add their listeners or hooks only one time.
- **Web vitals use a Flush Hook.** `reportWebVitals` registers `recordPending` with `onBeforeTelemetryFlush`. It does not add page-hide listeners, and it does not flush the reader.

## Considered Options

- **A lint rule** — rejected. A rule cannot see that an exporter keeps data in memory, or that no listener flushes it.
- **Flush the span processor from `web-vitals.ts`** — rejected. Span delivery is not about web vitals, and two modules with hide listeners can flush in an order that sends a metric before its hook records it.
- **`SimpleSpanProcessor`** (one request for each span) — rejected. It sends many small requests during the session to fix a problem that occurs only when the page hides.

## Consequences

- A new exporter that keeps data in memory goes in `bufferedExporters`. No other module changes.
- A module that must record values before the page hides registers a Flush Hook. It does not add its own listeners.
- `telemetry-delivery.unit.test.ts` proves that a hidden page and `pagehide` flush both exporters, that a visible page does not flush, that hooks run first, and that a throwing hook or a failed export does not stop a flush or make it reject.
- `web-vitals.unit.test.ts` proves that `reportWebVitals` adds no hide listeners, and that CLS and INP are recorded when the page hides through the delivery module.
- The flush is best effort. The browser can stop the page before `forceFlush` completes. This ADR makes the delivery start; it does not make the delivery certain.
