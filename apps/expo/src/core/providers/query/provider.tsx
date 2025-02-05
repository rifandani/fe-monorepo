import type { PropsWithChildren } from 'react'
import { queryClient } from '@/core/providers/query/query-client'
import { useReactQueryDevTools } from '@dev-plugins/react-query'
import { QueryClientProvider } from '@tanstack/react-query'

export function AppQueryProvider({ children }: PropsWithChildren) {
  // integrate with react query devtools
  useReactQueryDevTools(queryClient)

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
