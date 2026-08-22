import metadata from "../../../package.json" with { type: "json" };

export const SERVICE_NAME = metadata.name;
export const SERVICE_VERSION = metadata.version;
export const METRICS_METER_WEB_VITALS = "webVitals";
export const METRICS_METER_WEB_VITALS_LCP = `${METRICS_METER_WEB_VITALS}.lcp`;
export const METRICS_METER_WEB_VITALS_INP = `${METRICS_METER_WEB_VITALS}.inp`;
export const METRICS_METER_WEB_VITALS_CLS = `${METRICS_METER_WEB_VITALS}.cls`;
export const METRICS_METER_WEB_VITALS_FCP = `${METRICS_METER_WEB_VITALS}.fcp`;
export const METRICS_METER_WEB_VITALS_TTFB = `${METRICS_METER_WEB_VITALS}.ttfb`;
export const TRACER_REACT_ENTRY = "reactEntry";
export const TRACER_REACT_ENTRY_ON_CAUGHT_ERROR = `${TRACER_REACT_ENTRY}.onCaughtError`;
export const TRACER_REACT_ENTRY_ON_UNCAUGHT_ERROR = `${TRACER_REACT_ENTRY}.onUncaughtError`;
export const TRACER_REACT_ENTRY_ON_RECOVERABLE_ERROR = `${TRACER_REACT_ENTRY}.onRecoverableError`;
export const TRACER_ROUTER = "router";
export const TRACER_ROUTER_ON_ERROR = `${TRACER_ROUTER}.onError`;

/** Color schema the user can pick - `auto` follows the OS preference. */
export type ColorMode = "auto" | "light" | "dark";
/** Modes passed to `useColorMode`, in the order its cycle callback walks them. */
export const COLOR_MODES: ColorMode[] = ["auto", "light", "dark"];
/** Key the picked color mode is persisted under in `localStorage`. */
export const COLOR_MODE_STORAGE_KEY = "app-color-mode";
