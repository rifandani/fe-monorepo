"use client";
/* oxlint-disable eslint/func-style -- function declarations */
import { useEffect, useRef, useState } from "react";

export interface UseCopyToClipboardProps {
  timeout?: number;
}

/**
 * Hook to copy text to clipboard
 *
 * @example
 * ```tsx
 * const { isCopied, copyToClipboard } = useCopyToClipboard();
 * ```
 */
export function useCopyToClipboard({
  timeout = 1000,
}: UseCopyToClipboardProps = {}) {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Cleanup timeout on unmount to prevent memory leaks
  useEffect(
    () => () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    },
    []
  );
  const copyToClipboard = (value: string) => {
    if (typeof window === "undefined" || !navigator.clipboard?.writeText) {
      return;
    }
    if (!value) {
      return;
    }
    // Clear any existing timeout
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }
    // oxlint-disable-next-line promise/prefer-await-to-then github/no-then
    navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true);
      timeoutIdRef.current = setTimeout(() => {
        setIsCopied(false);
      }, timeout);
    });
  };
  return { copyToClipboard, isCopied };
}
