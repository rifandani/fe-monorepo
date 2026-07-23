/* oxlint-disable node/callback-return promise/prefer-await-to-callbacks */
import { useLatest } from "@workspace/core/hooks/use-latest";
import { isNumber } from "radashi";
import { useEffect, useRef } from "react";

interface Handle {
  id: number;
}
const setRafTimeout = (callback: () => void, delay = 0): Handle => {
  if (typeof requestAnimationFrame === typeof undefined) {
    return {
      id: setTimeout(callback, delay) as unknown as number,
    };
  }
  const handle: Handle = {
    id: 0,
  };
  const startTime = Date.now();
  const loop = () => {
    const current = Date.now();
    if (current - startTime >= delay) {
      callback();
    } else {
      handle.id = requestAnimationFrame(loop);
    }
  };
  handle.id = requestAnimationFrame(loop);
  return handle;
};
// oxlint-disable-next-line typescript/no-explicit-any
const cancelAnimationFrameIsNotDefined = (_t: any): _t is number =>
  typeof cancelAnimationFrame === typeof undefined;
const clearRafTimeout = (handle: Handle) => {
  if (cancelAnimationFrameIsNotDefined(handle.id)) {
    return clearTimeout(handle.id);
  }
  cancelAnimationFrame(handle.id);
};

/**
 * A hook implements with requestAnimationFrame for better performance.
 * The API is consistent with useTimeout.
 * The advantage is that will not trigger function when the page is not rendering, such as page hiding or minimization.
 */
export const useRafTimeout = (fn: () => void, delay: number | undefined) => {
  const fnRef = useLatest(fn);
  const timerRef = useRef<Handle>(null);
  useEffect(() => {
    if (!isNumber(delay) || delay < 0) {
      return;
    }
    timerRef.current = setRafTimeout(() => {
      fnRef.current();
    }, delay);
    return () => {
      if (timerRef.current) {
        clearRafTimeout(timerRef.current);
      }
    };
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [delay]);
  const clear = () => {
    if (timerRef.current) {
      clearRafTimeout(timerRef.current);
    }
  };
  return clear;
};
