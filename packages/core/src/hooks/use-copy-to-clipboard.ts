'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export interface useCopyToClipboardProps {
  timeout?: number
}

/**
 * Hook to copy text to clipboard
 *
 * @example
 * ```tsx
 * const { isCopied, copyToClipboard } = useCopyToClipboard();
 * ```
 */
export function useCopyToClipboard(
  { timeout = 1_000 }: useCopyToClipboardProps = {},
) {
  const [isCopied, setIsCopied] = useState(false)
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup timeout on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current)
      }
    }
  }, [])

  const copyToClipboard = useCallback((value: string) => {
    if (typeof window === 'undefined' || !navigator.clipboard?.writeText) {
      return
    }

    if (!value) {
      return
    }

    // Clear any existing timeout
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current)
    }

    navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true)

      timeoutIdRef.current = setTimeout(() => {
        setIsCopied(false)
      }, timeout)
    })
  }, [timeout])

  return { isCopied, copyToClipboard }
}
