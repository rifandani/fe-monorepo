import { useCallback, useEffect, useRef, useState } from 'react'

interface UseAutoScrollOptions {
  isLoading: boolean
  dependency: number
  isStreaming: () => boolean
  threshold?: number
  intervalMs?: number
}

/**
 * Custom hook to auto-scroll to a target element and pause when the user scrolls away.
 *
 * @example
 * ```tsx
 * const { anchorRef, isAutoScroll } = useAutoScroll({
 *    isLoading: status === 'submitted' || status === 'streaming',
 *    dependency: messages.length,
 *    isStreaming: () => status === 'streaming',
 *  });
 * ```
 */
export function useAutoScroll({
  isLoading,
  dependency,
  isStreaming,
  threshold = 162,
  intervalMs = 100,
}: UseAutoScrollOptions) {
  const anchorRef = useRef<HTMLDivElement>(null)
  const [isAutoScroll, setIsAutoScroll] = useState(true)

  // Detect user scroll to toggle auto-scroll
  const handleScroll = useCallback(() => {
    if (typeof window === 'undefined') {
      return
    }
    const scrollHeight = document.documentElement.scrollHeight
    const atBottom
      = window.innerHeight + window.scrollY >= scrollHeight - threshold
    setIsAutoScroll(atBottom)
  }, [threshold])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  // Scroll to anchor element
  const scrollToBottom = useCallback(() => {
    anchorRef.current?.scrollIntoView({
      behavior: dependency > 5 ? 'instant' : 'smooth',
    })
  }, [dependency])

  // Auto-scroll on updates and during streaming
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!isAutoScroll) {
      return
    }

    scrollToBottom()
    let intervalId: ReturnType<typeof setInterval> | undefined
    if (isAutoScroll && isStreaming() && isLoading) {
      intervalId = setInterval(scrollToBottom, intervalMs)
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [
    dependency,
    isLoading,
    isAutoScroll,
    isStreaming,
    intervalMs,
    scrollToBottom,
  ])

  return { anchorRef, isAutoScroll }
}
