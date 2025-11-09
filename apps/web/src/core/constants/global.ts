import metadata from '../../../package.json' with { type: 'json' }

export const PORT = 3002

export const SERVICE_NAME = metadata.name
export const SERVICE_VERSION = metadata.version

export const METRICS_METER_WEB_VITALS = 'webVitals'
export const METRICS_METER_WEB_VITALS_LCP = `${METRICS_METER_WEB_VITALS}.lcp`
export const METRICS_METER_WEB_VITALS_INP = `${METRICS_METER_WEB_VITALS}.inp`
export const METRICS_METER_WEB_VITALS_CLS = `${METRICS_METER_WEB_VITALS}.cls`
export const METRICS_METER_WEB_VITALS_FCP = `${METRICS_METER_WEB_VITALS}.fcp`
export const METRICS_METER_WEB_VITALS_TTFB = `${METRICS_METER_WEB_VITALS}.ttfb`

export const TRACER_GLOBAL_ERROR = 'globalError'
export const TRACER_GLOBAL_ERROR_ON_ERROR = `${TRACER_GLOBAL_ERROR}.onError`

export const TRACER_ROOT_ROUTE = 'rootRoute'
export const TRACER_ROOT_ROUTE_ON_ERROR = `${TRACER_ROOT_ROUTE}.onError`
export const TRACER_LOGIN_ROUTE = 'loginRoute'
export const TRACER_HOME_ROUTE = 'homeRoute'
