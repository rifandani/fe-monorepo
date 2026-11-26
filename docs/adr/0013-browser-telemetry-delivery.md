# Browser telemetry delivery

> Recorded on 2026-11-26, because trace spans were lost when the page closed. Extended on 2026-11-26 with request metrics, because the spa had no metrics for request latency, traffic or errors.

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

## Request metrics

Before this section, the spa recorded web vitals only. It had no metrics for request latency, traffic or errors, so overload and outage were not visible.

### Vocabulary

**Golden Signals** and **Route Template** are defined in `packages/core/GLOSSARY.md`. For example, `https://api.test/users/42?page=2` has the Route Template `/users/{id}`.

### Decisions

- **`Http` records the Golden Signals.** The metrics are in `packages/core/src/lib/http/http.ts`, so spa and expo get them from the same `Http` layer. `Http.layer` and `Http.layerWithoutSession` both record them.
- **Two instruments.** `http.client.requests` is a monotonic counter (one for each request). `http.client.request.duration` is a histogram of the duration in milliseconds, with the same unit as the web vitals. The buckets are 5 ms to 10 s, because the default timeout of `Http` is 10 s.
- **The attributes follow the OpenTelemetry HTTP client conventions.** Each record has `http.request.method` and `url.template` (the Route Template). A response has `http.response.status_code`. A failure has `error.type`. Its values are:
  - the status code, for an error status.
  - `timeout`, for a timeout.
  - the reason tag of an `HttpClientError` (for example `TransportError`).
  - `cancelled`, for an interrupted request.
  - `_OTHER`, for a defect.
- **The status code is a string.** The OpenTelemetry convention uses an integer, but an Effect metric attribute is always a string.
- **The path of `baseUrl` stays in the Route Template.** For a `baseUrl` of `https://api.test/v1`, the template is `/v1/users/{id}`.
- **The Route Template comes from the URL.** Callers give a path such as `` `users/${id}` ``, so `Http` replaces id segments. A segment that is not an id (for example a user name) stays as it is. Thus an endpoint must not put free text in its path.
- **The metrics measure what the caller sees.** `Http` records the request one time, after the timeout and after the refresh and replay of a 401 (ADR-0006). A replayed request is one request with the status of the replay. The duration includes the refresh.
- **Failed, timed-out and cancelled requests are recorded.** They are part of the traffic, and they are the errors.

### Considered Options

- **The full URL as an attribute** — rejected. Each id makes a new metric series, and the URL can contain query values.
- **A Route Template that each caller gives** — rejected for now. No current endpoint needs it. Their ids are numbers. Reopen it when an endpoint has an id segment that is not a number or a UUID.
- **Record each request on the wire (also the 401 before a replay)** — rejected. The caller sees one request. The Session refresh has its own request through `Http`, so it is recorded.
- **`Metric.timer`** — rejected. It adds a `time_unit` attribute and 35 buckets that the browser must export.

### Consequences

- `http.unit.test.ts` proves the attributes for a success, an error status, a timeout and a Route Template with an id, and that a duration is recorded with the same attributes. A property test proves that requests to one resource with different ids have one Route Template.
- The spa exports these metrics through the metric reader in `bufferedExporters`, so a hidden page delivers them (see the decisions above). Expo records them in the Effect `MetricRegistry`, but it has no metric exporter yet.
