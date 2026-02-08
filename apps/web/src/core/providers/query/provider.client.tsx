'use client'

import { getQueryClient } from './client'
import { QueryClientProvider } from '@tanstack/react-query'
import * as React from 'react'

export function AppQueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
