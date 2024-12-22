import { useMemoizedFn } from '@workspace/ui/hooks/use-memoized-fn.hook'
import { isNumber } from 'radashi'
import { useCallback, useEffect, useRef } from 'react'

export function useInterval(
  fn: () => void,
  delay?: number,
  options: { immediate?: boolean } = {},
) {
  const timerCallback = useMemoizedFn(fn)
  const timerRef = useRef<number | null>(null)

  const clear = useCallback(() => {
    if (timerRef.current)
      clearInterval(timerRef.current)
  }, [])

  useEffect(() => {
    if (!isNumber(delay) || delay < 0)
      return

    if (options.immediate)
      timerCallback()

    timerRef.current = setInterval(timerCallback, delay) as unknown as number
    return clear
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay, options.immediate])

  return clear
}
