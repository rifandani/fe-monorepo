import metadata from '../../../package.json' with { type: 'json' }

export const PORT = 3002

export const SERVICE_NAME = metadata.name
export const SERVICE_VERSION = metadata.version

export const METRICS_METER_WEB_VITALS = 'webVitals'
export const METRICS_METER_WEB_VITALS_LCP = 'webVitals.lcp'
export const METRICS_METER_WEB_VITALS_INP = 'webVitals.inp'
export const METRICS_METER_WEB_VITALS_CLS = 'webVitals.cls'
export const METRICS_METER_WEB_VITALS_FCP = 'webVitals.fcp'
export const METRICS_METER_WEB_VITALS_TTFB = 'webVitals.ttfb'

export const TRACER_LOGIN_ROUTE = 'loginRoute'
export const TRACER_HOME_ROUTE = 'homeRoute'
