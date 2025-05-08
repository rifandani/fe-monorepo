'use client'

import { useState } from 'react'

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
  { timeout }: useCopyToClipboardProps = { timeout: 1_000 },
) {
  const [isCopied, setIsCopied] = useState(false)

  const copyToClipboard = (value: string) => {
    if (typeof window === 'undefined' || !navigator.clipboard?.writeText) {
      return
    }

    if (!value) {
      return
    }

    navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true)

      setTimeout(() => {
        setIsCopied(false)
      }, timeout)
    })
  }

  return { isCopied, copyToClipboard }
}
