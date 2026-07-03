import { useHead } from '@unhead/react'
import { createHead, UnheadProvider } from '@unhead/react/client'
import { ENV } from '@/core/constants/env'

const head = createHead()

function SchemaOrgHostParams() {
  useHead({
    templateParams: {
      schemaOrg: {
        host: ENV.VITE_APP_URL,
      },
    },
  })
  return null
}

export function AppHeadProvider({ children }: { children: React.ReactNode }) {
  return (
    <UnheadProvider head={head}>
      <SchemaOrgHostParams />
      {children}
    </UnheadProvider>
  )
}
