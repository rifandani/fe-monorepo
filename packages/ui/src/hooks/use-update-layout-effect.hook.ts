import { createUpdateEffect } from '@workspace/ui/hooks/create-update-effect'
import { useLayoutEffect } from 'react'

/**
 * A hook alike `useLayoutEffect` but skips running the effect for the first time.
 */
export const useUpdateLayoutEffect = createUpdateEffect(useLayoutEffect)
