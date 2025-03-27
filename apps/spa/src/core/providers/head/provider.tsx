import { createHead, UnheadProvider } from '@unhead/react/client'

const head = createHead()

export function AppHeadProvider({ children }: { children: React.ReactNode }) {
  return (
    <UnheadProvider head={head}>
      {children}
    </UnheadProvider>
  )
}
