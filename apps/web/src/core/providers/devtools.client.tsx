'use client'

import { getQueryClient } from '@/core/providers/query/client'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import * as React from 'react'

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
