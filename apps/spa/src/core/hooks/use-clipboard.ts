"use client";

import {
  useClipboard as useClipboardBase,
  useTimeoutFn,
} from "@reactuses/core";
import { useState } from "react";

const COPIED_RESET_MS = 2000;

/**
 * Writes text to the clipboard via `@reactuses/core`, adding a short-lived
 * `copied` flag for UI feedback.
 *
 * The flag resets itself after {@link COPIED_RESET_MS}; `useTimeoutFn` clears
 * the pending timer on unmount.
 *
 * @returns `copied` feedback flag and a `copy` function resolving to whether the write succeeded
 */
export const useClipboard = () => {
  const [, copyToClipboard] = useClipboardBase();
  const [copied, setCopied] = useState(false);
  const [, startResetTimer, stopResetTimer] = useTimeoutFn(
    () => setCopied(false),
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
