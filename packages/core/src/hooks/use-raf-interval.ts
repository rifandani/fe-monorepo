import { useLatest } from "@workspace/core/hooks/use-latest";
import { isNumber } from "radashi";
import { useCallback, useEffect, useRef } from "react";

/**
 * A hook implements with `requestAnimationFrame` for better performance. The API is consistent with `useInterval`,
 * the advantage is that the execution of the timer can be stopped when the page is not rendering,
 * such as page hiding or minimization.
 *
 * Please note that the following two cases are likely to be inapplicable, and `useInterval` is preferred:
 *
 * - the time interval is less than 16ms
 * - want to execute the timer when page is not rendering;
 */
export const useRafInterval = (
  fn: () => void,
  delay: number | undefined,
  options?: {
    immediate?: boolean;
  }
) => {
  const immediate = options?.immediate;
  const fnRef = useLatest(fn);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!isNumber(delay) || delay < 0) {
      return;
    }
    if (immediate) {
      fnRef.current();
    }
    timerRef.current = setInterval(() => {
      fnRef.current();
    }, delay);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [delay, fnRef, immediate]);
  const clear = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, []);
  return clear;
};
