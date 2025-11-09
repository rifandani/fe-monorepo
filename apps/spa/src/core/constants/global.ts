import metadata from '../../../package.json' with { type: 'json' }

export const PORT = 3001

export const SERVICE_NAME = metadata.name
export const SERVICE_VERSION = metadata.version

export const METRICS_METER_WEB_VITALS = 'webVitals'
export const METRICS_METER_WEB_VITALS_LCP = `${METRICS_METER_WEB_VITALS}.lcp`
export const METRICS_METER_WEB_VITALS_INP = `${METRICS_METER_WEB_VITALS}.inp`
export const METRICS_METER_WEB_VITALS_CLS = `${METRICS_METER_WEB_VITALS}.cls`
export const METRICS_METER_WEB_VITALS_FCP = `${METRICS_METER_WEB_VITALS}.fcp`
export const METRICS_METER_WEB_VITALS_TTFB = `${METRICS_METER_WEB_VITALS}.ttfb`

export const TRACER_REACT_ENTRY = 'reactEntry'
export const TRACER_REACT_ENTRY_ON_CAUGHT_ERROR = `${TRACER_REACT_ENTRY}.onCaughtError`
export const TRACER_REACT_ENTRY_ON_UNCAUGHT_ERROR = `${TRACER_REACT_ENTRY}.onUncaughtError`
export const TRACER_REACT_ENTRY_ON_RECOVERABLE_ERROR = `${TRACER_REACT_ENTRY}.onRecoverableError`

export const TRACER_ROUTER = 'router'
export const TRACER_ROUTER_ON_ERROR = `${TRACER_ROUTER}.onError`

export const TRACER_LOGIN_ROUTE = 'loginRoute'
export const TRACER_HOME_ROUTE = 'homeRoute'
