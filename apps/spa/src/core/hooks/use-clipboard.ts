"use client";

import { useEffect, useRef, useState } from "react";

export const useClipboard = () => {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const copy = async (value: string) => {
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
  };
  useEffect(
    () => () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    },
    []
  );
  return { copied, copy };
};
