import type { PropsWithChildren } from 'react'
import { queryClient } from '@/core/providers/query/query-client'
import { useReactQueryDevTools } from '@dev-plugins/react-query'
import { QueryClientProvider } from '@tanstack/react-query'

export function AppQueryProvider({ children }: PropsWithChildren) {
  // integrate with react query devtools
  // @ts-expect-error: maybe @dev-plugins/react-query should be updated to the latest version @tanstack/react-query
  useReactQueryDevTools(queryClient)

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
