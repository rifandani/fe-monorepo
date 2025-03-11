import { queryClient } from '@/core/providers/query/client'
import { router } from '@/core/providers/router/client'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import React from 'react'

const ReactQueryDevtoolsProduction = React.lazy(() =>
  import('@tanstack/react-query-devtools/build/modern/production.js').then(
    mod => ({
      default: mod.ReactQueryDevtools,
    }),
  ),
)

const TanStackRouterDevtoolsProduction = React.lazy(() =>
  import('@tanstack/react-router-devtools').then(mod => ({
    default: mod.TanStackRouterDevtools,
  })),
)

export function Devtools() {
  const [showRqDevtools, setShowRqDevtools] = React.useState(false)
  const [showRrDevtools, setShowRrDevtools] = React.useState(false)

  React.useEffect(() => {
    window.toggleRqDevtools = () => setShowRqDevtools(prev => !prev)
    window.toggleRrDevtools = () => setShowRrDevtools(prev => !prev)
  }, [])

  return (
    <>
      {/* this will only be rendered in development */}
      <TanStackRouterDevtools router={router} />

      {showRrDevtools && (
        <React.Suspense fallback={null}>
          <TanStackRouterDevtoolsProduction router={router} />
        </React.Suspense>
      )}

      {/* this will only be rendered in development */}
      <ReactQueryDevtools client={queryClient} buttonPosition="bottom-right" initialIsOpen={false} />

      {showRqDevtools && (
        <React.Suspense fallback={null}>
          <ReactQueryDevtoolsProduction client={queryClient} buttonPosition="bottom-right" initialIsOpen={false} />
        </React.Suspense>
      )}
    </>
  )
}
