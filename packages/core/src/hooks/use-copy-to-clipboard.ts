"use client";

import { canWriteToClipboard } from "@workspace/core/utils/dom";
import { useEffect, useRef, useState } from "react";

export interface UseCopyToClipboardProps {
  timeout?: number;
}

export const useCopyToClipboard = ({
  timeout = 1000,
}: UseCopyToClipboardProps = {}) => {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    },
    []
  );

  const copyToClipboard = async (value: string) => {
    if (!(value && canWriteToClipboard())) {
      return;
    }

    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }

    await navigator.clipboard.writeText(value);

    setIsCopied(true);
    timeoutIdRef.current = setTimeout(() => {
      setIsCopied(false);
    }, timeout);
  };

  return { copyToClipboard, isCopied };
};
