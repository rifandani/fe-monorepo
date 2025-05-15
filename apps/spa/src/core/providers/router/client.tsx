import { Icon } from '@iconify/react'
import { createRouter, ErrorComponent } from '@tanstack/react-router'
import { queryClient } from '@/core/providers/query/client'
import { routeTree } from '../../../routeTree.gen'

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Create a new router instance
export const router = createRouter({
  routeTree,
  defaultPendingComponent: () => (
    <div className="flex items-center justify-center">
      <Icon
        icon="svg-spinners:3-dots-fade"
        height="5em"
        className="text-primary"
      />
    </div>
  ),
  defaultErrorComponent: ErrorComponent,
  context: {
    queryClient,
  },
  defaultPreload: 'intent',
  // Since we're using React Query, we don't want loader calls to ever be stale
  // This will ensure that the loader is always called when the route is preloaded or visited
  defaultPreloadStaleTime: 0,
})
