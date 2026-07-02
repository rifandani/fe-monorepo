"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export interface useCopyToClipboardProps {
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
export const useCopyToClipboard = ({
  timeout = 1000,
}: useCopyToClipboardProps = {}) => {
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
  const copyToClipboard = useCallback(
    (value: string) => {
      if (typeof window === "undefined" || !navigator.clipboard?.writeText) {
        return;
      }
      if (!value) {
        return;
      }
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      void (async () => {
        try {
          await navigator.clipboard.writeText(value);
          setIsCopied(true);
          timeoutIdRef.current = setTimeout(() => {
            setIsCopied(false);
          }, timeout);
        } catch {
          // Clipboard write failed silently
        }
      })();
    },
    [timeout]
  );
  return { copyToClipboard, isCopied };
};
