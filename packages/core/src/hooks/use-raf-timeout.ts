import { useLatest } from "@workspace/core/hooks/use-latest";
import { clearRafTimer, startRafTimeout } from "@workspace/core/utils/raf";
import type { RafHandle } from "@workspace/core/utils/raf";
import { noop } from "radashi";
import { useEffect, useRef } from "react";

export const useRafTimeout = (fn: () => void, delay: number | undefined) => {
  const fnRef = useLatest(fn);
  const timerRef = useRef<RafHandle>(null);
  useEffect(() => {
    timerRef.current = startRafTimeout(() => {
      fnRef.current();
    }, delay);

    if (!timerRef.current) {
      return noop;
    }

    return () => {
      if (timerRef.current) {
        clearRafTimer(timerRef.current);
      }
    };
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [delay]);

  const clear = () => {
    if (timerRef.current) {
      clearRafTimer(timerRef.current);
    }
  };

  return clear;
};
