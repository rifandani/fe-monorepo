"use client";
/* oxlint-disable eslint/func-style -- function declarations */
import { useEffect, useRef, useState } from "react";

export function useClipboard() {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(setCopied, 2000, false);
      return true;
    } catch {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = null;
      setCopied(false);
      return false;
    }
  }
  useEffect(
    () => () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    },
    []
  );
  return { copied, copy };
}
