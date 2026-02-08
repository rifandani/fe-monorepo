import '@/core/styles/globals.css'
import './instrumentation'

import {
  TRACER_REACT_ENTRY,
  TRACER_REACT_ENTRY_ON_CAUGHT_ERROR,
  TRACER_REACT_ENTRY_ON_RECOVERABLE_ERROR,
  TRACER_REACT_ENTRY_ON_UNCAUGHT_ERROR,
} from '@/core/constants/global'
import { Entry } from '@/core/entry'
import { recordException } from '@/core/utils/telemetry'
import { trace } from '@opentelemetry/api'
import { createRoot } from 'react-dom/client'

const tracer = trace.getTracer(TRACER_REACT_ENTRY)
const root = document.getElementById('root')

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?',
  )
}

createRoot(root as HTMLElement, {
  onCaughtError(error, errorInfo) {
    recordException({
      tracer,
      name: TRACER_REACT_ENTRY_ON_CAUGHT_ERROR,
      error: {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        componentStack: errorInfo.componentStack,
      },
    })
  },
  onUncaughtError(error, errorInfo) {
    recordException({
      tracer,
      name: TRACER_REACT_ENTRY_ON_UNCAUGHT_ERROR,
      error: {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        componentStack: errorInfo.componentStack,
      },
    })
  },
  onRecoverableError(error, errorInfo) {
    recordException({
      tracer,
      name: TRACER_REACT_ENTRY_ON_RECOVERABLE_ERROR,
      error: {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        componentStack: errorInfo.componentStack,
      },
    })
  },
}).render(
  <Entry />,
)
