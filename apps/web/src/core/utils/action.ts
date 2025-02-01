import { createSafeActionClient } from 'next-safe-action'

export interface ActionResult<T> {
  data: T | null
  error: string | null
}

export const actionClient = createSafeActionClient()
