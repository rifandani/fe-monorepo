# Observability

Otel in web browser does not support logs.
Instrument using `@/utils/telemetry`.
Console log using logger from `packages/core`.

`@/utils/telemetry-delivery` sends the spans and the metrics when the page hides. See [ADR-0013](../../../docs/adr/0013-browser-telemetry-delivery.md).
