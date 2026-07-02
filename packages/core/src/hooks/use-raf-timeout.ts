import { useLatest } from "@workspace/core/hooks/use-latest";
import { isNumber, sleep } from "radashi";
import { useCallback, useEffect, useRef } from "react";

/**
 * A hook implements with requestAnimationFrame for better performance.
 * The API is consistent with useTimeout.
 * The advantage is that will not trigger function when the page is not rendering, such as page hiding or minimization.
 */
export const useRafTimeout = (fn: () => void, delay: number | undefined) => {
  const fnRef = useLatest(fn);
  const activeRef = useRef(true);
  useEffect(() => {
    activeRef.current = true;
    if (!isNumber(delay) || delay < 0) {
      return;
    }
    void (async () => {
      await sleep(delay);
      if (activeRef.current) {
        fnRef.current();
      }
    })();
    return () => {
      activeRef.current = false;
    };
  }, [delay, fnRef]);
  const clear = useCallback(() => {
    activeRef.current = false;
  }, []);
  return clear;
};
