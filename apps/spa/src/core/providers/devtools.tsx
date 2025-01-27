import { router } from '@/core/providers/router/client'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import React from 'react'

const isProd = import.meta.env.PROD

const ReactQueryDevtoolsProduction = React.lazy(() =>
  import('@tanstack/react-query-devtools/build/modern/production.js').then(
    d => ({
      default: d.ReactQueryDevtools,
    }),
  ),
)

const TanStackRouterDevtoolsProduction = React.lazy(() =>
  import('@tanstack/router-devtools').then(mod => ({
    default: mod.TanStackRouterDevtools,
  })),
)

export function Devtools(
  props: React.ComponentProps<typeof ReactQueryDevtools> = {
    buttonPosition: 'bottom-right',
    initialIsOpen: false,
  },
) {
  const [showRqDevtools, setShowRqDevtools] = React.useState(false)
  const [showRrDevtools, setShowRrDevtools] = React.useState(!isProd)

  React.useEffect(() => {
    window.toggleRqDevtools = () => setShowRqDevtools(prev => !prev)
    window.toggleRrDevtools = () => setShowRrDevtools(prev => !prev)
  }, [])

  return (
    <>
      {showRrDevtools && (
        <React.Suspense fallback={null}>
          <TanStackRouterDevtoolsProduction router={router} />
        </React.Suspense>
      )}

      {/* this will only be rendered in development */}
      <ReactQueryDevtools {...props} />

      {showRqDevtools && (
        <React.Suspense fallback={null}>
          <ReactQueryDevtoolsProduction />
        </React.Suspense>
      )}
    </>
  )
}
