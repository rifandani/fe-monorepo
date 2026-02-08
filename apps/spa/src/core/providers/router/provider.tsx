import { router } from './client'
import { RouterProvider } from '@tanstack/react-router'

export function AppRouterProvider() {
  return (
    <RouterProvider
      router={router}
    />
  )
}
