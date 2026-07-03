import { defineNodeInstrumentation } from 'evlog/next/instrumentation'

/**
 * Gates the Node runtime, dynamic-imports your module once (cached)
 * type onRequestError = Instrumentation.onRequestError
 */
export const { register, onRequestError } = defineNodeInstrumentation(() => import('./core/utils/evlog'))
