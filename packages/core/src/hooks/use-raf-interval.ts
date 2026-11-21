/* oxlint-disable promise/prefer-await-to-callbacks node/callback-return */
import { useLatest } from "@workspace/core/hooks/use-latest";
import { isNumber, noop } from "radashi";
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
    if (!(isNumber(delay) && delay >= 0)) {
      return noop;
    }

    if (immediate === true) {
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
