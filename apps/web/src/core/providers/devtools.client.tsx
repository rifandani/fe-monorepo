'use client'

import { TanStackDevtools } from '@tanstack/react-devtools'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import React from 'react'
import { getQueryClient } from '@/core/providers/query/client'

export function Devtools() {
  const queryClient = getQueryClient()

  return (
    <TanStackDevtools
      plugins={[
        {
          name: 'TanStack Query',
          render: <ReactQueryDevtoolsPanel client={queryClient} />,
        },
        // {
        //   name: 'TanStack Form',
        //   render: <FormDevtoolsPanel />,
        // },
      ]}
    />
  )
}
