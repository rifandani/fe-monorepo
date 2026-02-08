import { queryClient } from '@/core/providers/query/client'
import { QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'

export function AppQueryProvider({ children }: PropsWithChildren) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
