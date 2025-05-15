import { createRoot } from 'react-dom/client'
import { Entry } from '@/core/entry'
import { loggerBrowser } from '@/core/utils/logger'
import '@/core/styles/globals.css'

const root = document.getElementById('root')

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?',
  )
}

createRoot(root as HTMLElement, {
  onCaughtError(error, errorInfo) {
    loggerBrowser.error({ error, errorInfo }, '[root]: Caught Error')
  },
  onUncaughtError(error, errorInfo) {
    loggerBrowser.error({ error, errorInfo }, '[root]: Uncaught Error')
  },
}).render(
  <Entry />,
)
