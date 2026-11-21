"use client";

import {
  useClipboard as useClipboardBase,
  useTimeoutFn,
} from "@reactuses/core";
import { useState } from "react";

const COPIED_RESET_MS = 2000;

export const useClipboard = () => {
  const [, copyToClipboard] = useClipboardBase();
  const [copied, setCopied] = useState(false);

  const [, startResetTimer, stopResetTimer] = useTimeoutFn(
    () => {
      setCopied(false);
    },
    COPIED_RESET_MS,
    { immediate: false }
  );

  const copy = async (value: string) => {
    try {
      await copyToClipboard(value);
      setCopied(true);
      startResetTimer();

      return true;
    } catch {
      stopResetTimer();
      setCopied(false);

      return false;
    }
  };

  return { copied, copy };
};
