# spa

React SPA.

## Language

(See [core](../../packages/core/GLOSSARY.md) for Locale, Device Locale, Message Catalog, Translation Key, Translation Provider.)

### Component Catalog

**Component Catalog**: The single page at `/master-design` that displays every core UI component for visual inspection by developers and designers. Access is gated by the `componentCatalog` Feature Flag. _Avoid_: master design, styleguide, storybook, docs site

**Component Entry**: One component's place in the Component Catalog — its Category membership, its nav item, and its section of the page. _Avoid_: item, doc, page

**Variant Showcase**: One rendered example within a Component Entry, demonstrating a single combination of a component's props. _Avoid_: demo, example, story

**Category**: A named grouping of Component Entries (Buttons, Overlays, Charts, …) that determines both nav grouping and page order. _Avoid_: group, section, tag

### Feature Flags

**Feature Flag**: A named boolean that gates a product surface for local development. Defaults ON in development and OFF otherwise; a developer may override the default via the Feature Flags Devtools panel, and that override persists across reloads until reset. Production builds never honor an ON override for gated surfaces. _Avoid_: kill switch, remote config, experiment, A/B test

### Telemetry

**Telemetry Delivery**: Sending the spans and metrics that the exporters keep in memory, before the browser stops the page. One module, `telemetry-delivery`, owns it ([ADR-0013](../../docs/adr/0013-browser-telemetry-delivery.md)). _Avoid_: telemetry flush (a flush is one step of the delivery)

**Flush Hook**: A function that a module registers with `onBeforeTelemetryFlush`. It records the last values of the module before the exporters send them. _Avoid_: flush listener, hide handler

### Testing

**Route Test**: A test that opens the whole app at one URL, the way a person arrives at it, and checks what that person sees and can do there. Every route, guard, provider and translation is the real one; only the network is faked. _Avoid_: E2E spec, component test, page test, integration test
