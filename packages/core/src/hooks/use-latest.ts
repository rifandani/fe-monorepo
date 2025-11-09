import { useRef } from 'react'

/**
 * A Hook that returns the latest value, effectively avoiding the closure problem.
 */
export function useLatest<T>(value: T) {
  const ref = useRef(value)
  // eslint-disable-next-line react-hooks/refs
  ref.current = value

  return ref
}
