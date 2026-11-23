import { useLatest } from "@workspace/core/hooks/use-latest";
import { clearRafTimer, startRafInterval } from "@workspace/core/utils/raf";
import type { RafHandle } from "@workspace/core/utils/raf";
import { noop } from "radashi";
import { useEffect, useRef } from "react";

export const useRafInterval = (
  fn: () => void,
  delay: number | undefined,
  options?: {
    immediate?: boolean;
  }
) => {
  const immediate = options?.immediate;
  const fnRef = useLatest(fn);
  const timerRef = useRef<RafHandle>(null);
  useEffect(() => {
    timerRef.current = startRafInterval(() => {
      fnRef.current();
    }, delay);

    if (!timerRef.current) {
      return noop;
    }

    if (immediate === true) {
      fnRef.current();
    }

    return () => {
      if (timerRef.current) {
        clearRafTimer(timerRef.current);
      }
    };
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- fnRef holds the latest callback; only a new delay restarts the timer
  }, [delay]);

  const clear = () => {
    if (timerRef.current) {
      clearRafTimer(timerRef.current);
    }
  };

  return clear;
};
