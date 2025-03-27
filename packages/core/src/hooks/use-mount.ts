import { isFunction } from 'radashi'
import { useEffect } from 'react'

/**
 * A hook that executes a function after the component is mounted.
 */
export function useMount(fn: () => void) {
  if (!isFunction(fn)) {
    console.error(
      `useMount: parameter \`fn\` expected to be a function, but got "${typeof fn}".`,
    )
  }

  useEffect(() => {
    fn()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
