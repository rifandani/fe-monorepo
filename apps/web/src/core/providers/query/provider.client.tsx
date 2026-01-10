'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { getQueryClient } from './client'

export function AppQueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
