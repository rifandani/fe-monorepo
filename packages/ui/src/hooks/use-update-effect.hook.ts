import { createUpdateEffect } from '@workspace/ui/hooks/create-update-effect'
import { useEffect } from 'react'

/**
 * A hook alike `useEffect` but skips running the effect for the first time.
 */
export const useUpdateEffect = createUpdateEffect(useEffect)
