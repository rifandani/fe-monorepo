import { TanStackDevtools } from '@tanstack/react-devtools'
import { FormDevtoolsPanel } from '@tanstack/react-form-devtools'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import React from 'react'
import { queryClient } from '@/core/providers/query/client'
import { router } from '@/core/providers/router/client'

export function Devtools() {
  return (
    <TanStackDevtools
      plugins={[
        {
          name: 'TanStack Query',
          render: <ReactQueryDevtoolsPanel client={queryClient} />,
        },
        {
          name: 'TanStack Router',
          render: <TanStackRouterDevtoolsPanel router={router} />,
        },
        {
          name: 'TanStack Form',
          render: <FormDevtoolsPanel />,
        },
      ]}
    />
  )
}
