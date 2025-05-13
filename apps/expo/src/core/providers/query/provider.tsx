import type { PropsWithChildren } from 'react'
import { useReactQueryDevTools } from '@dev-plugins/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/core/providers/query/query-client'

export function AppQueryProvider({ children }: PropsWithChildren) {
  // integrate with react query devtools
  useReactQueryDevTools(queryClient)

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
