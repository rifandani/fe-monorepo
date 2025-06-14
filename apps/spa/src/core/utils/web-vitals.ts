import { logger } from '@workspace/core/utils/logger'
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals'

/**
 * Report web vitals to the console. Enabled on production for now. Use per page basis.
 */
export function reportWebVitals() {
  // we could send to analytics here if the rating is not "good"
  onLCP((metric) => {
    logger.log('[web-vitals]: LCP', metric)
  })
  onINP((metric) => {
    logger.log('[web-vitals]: INP', metric)
  })
  onCLS((metric) => {
    logger.log('[web-vitals]: CLS', metric)
  })
  onFCP((metric) => {
    logger.log('[web-vitals]: FCP', metric)
  })
  onTTFB((metric) => {
    logger.log('[web-vitals]: TTFB', metric)
  })
}
