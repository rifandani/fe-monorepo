import { Entry } from '@/core/entry'
import { createRoot } from 'react-dom/client'
import '@workspace/core/styles/globals-lato.css'

const root = document.getElementById('root')

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?',
  )
}

createRoot(root as HTMLElement).render(
  <Entry />,
)
