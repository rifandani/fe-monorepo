import { metrics } from '@opentelemetry/api'
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals'
import {
  METRICS_METER_WEB_VITALS,
  METRICS_METER_WEB_VITALS_CLS,
  METRICS_METER_WEB_VITALS_FCP,
  METRICS_METER_WEB_VITALS_INP,
  METRICS_METER_WEB_VITALS_LCP,
  METRICS_METER_WEB_VITALS_TTFB,
} from '@/core/constants/global'

const meter = metrics.getMeter(METRICS_METER_WEB_VITALS)

const lcpMetric = meter.createHistogram(METRICS_METER_WEB_VITALS_LCP, {
  description: 'Largest Contentful Paint',
  unit: 'ms',
})

const inpMetric = meter.createHistogram(METRICS_METER_WEB_VITALS_INP, {
  description: 'Interaction to Next Paint',
  unit: 'ms',
})

const clsMetric = meter.createHistogram(METRICS_METER_WEB_VITALS_CLS, {
  description: 'Cumulative Layout Shift',
})

const fcpMetric = meter.createHistogram(METRICS_METER_WEB_VITALS_FCP, {
  description: 'First Contentful Paint',
  unit: 'ms',
})

const ttfbMetric = meter.createHistogram(METRICS_METER_WEB_VITALS_TTFB, {
  description: 'Time to First Byte',
  unit: 'ms',
})

/**
 * Report web vitals to the opentelemetry. Enabled on production for now. Use per page basis.
 */
export function reportWebVitals() {
  // we could send to analytics here if the rating is not "good"
  onLCP((metric) => {
    lcpMetric.record(metric.value, {
      delta: metric.delta,
      navigationType: metric.navigationType,
      rating: metric.rating,
    })
  })
  onINP((metric) => {
    inpMetric.record(metric.value, {
      delta: metric.delta,
      navigationType: metric.navigationType,
      rating: metric.rating,
    })
  })
  onCLS((metric) => {
    clsMetric.record(metric.value, {
      delta: metric.delta,
      navigationType: metric.navigationType,
      rating: metric.rating,
    })
  })
  onFCP((metric) => {
    fcpMetric.record(metric.value, {
      delta: metric.delta,
      navigationType: metric.navigationType,
      rating: metric.rating,
    })
  })
  onTTFB((metric) => {
    ttfbMetric.record(metric.value, {
      delta: metric.delta,
      navigationType: metric.navigationType,
      rating: metric.rating,
    })
  })
}
