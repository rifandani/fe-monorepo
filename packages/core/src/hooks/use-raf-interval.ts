/* oxlint-disable promise/prefer-await-to-callbacks node/callback-return */
import { useLatest } from "@workspace/core/hooks/use-latest";
import { isNumber } from "radashi";
import { useEffect, useRef } from "react";

interface FrameHandle {
  kind: "frame";
  id: number;
}
interface TimerHandle {
  kind: "timer";
  id: ReturnType<typeof setTimeout>;
}
type Handle = FrameHandle | TimerHandle;

// The animation-frame pair is absent outside the DOM (SSR, Node test runs),
// where the plain timers are the fallback.
const hasRequestAnimationFrame = () => "requestAnimationFrame" in globalThis;
const setRafInterval = (callback: () => void, delay = 0): Handle => {
  if (!hasRequestAnimationFrame()) {
    return { kind: "timer", id: setInterval(callback, delay) };
  }
  let start = Date.now();
  const handle: FrameHandle = { kind: "frame", id: 0 };
  const loop = () => {
    const current = Date.now();
    if (current - start >= delay) {
      callback();
      start = Date.now();
    }
    handle.id = requestAnimationFrame(loop);
  };
  handle.id = requestAnimationFrame(loop);
  return handle;
};
const clearRafInterval = (handle: Handle) => {
  if (handle.kind === "timer") {
    clearInterval(handle.id);
    return;
  }
  cancelAnimationFrame(handle.id);
};

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
  const timerRef = useRef<Handle>(null);
  useEffect(() => {
    if (!isNumber(delay) || delay < 0) {
      return;
    }
    if (immediate) {
      fnRef.current();
    }
    timerRef.current = setRafInterval(() => {
      fnRef.current();
    }, delay);
    return () => {
      if (timerRef.current) {
        clearRafInterval(timerRef.current);
      }
    };
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [delay]);
  const clear = () => {
    if (timerRef.current) {
      clearRafInterval(timerRef.current);
    }
  };
  return clear;
};
