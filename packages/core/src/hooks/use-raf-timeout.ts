/* oxlint-disable node/callback-return promise/prefer-await-to-callbacks */
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

const setRafTimeout = (callback: () => void, delay = 0): Handle => {
  if (!hasRequestAnimationFrame()) {
    return { kind: "timer", id: setTimeout(callback, delay) };
  }

  const handle: FrameHandle = { kind: "frame", id: 0 };
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

const clearRafTimeout = (handle: Handle) => {
  if (handle.kind === "timer") {
    clearTimeout(handle.id);

    return;
  }

  cancelAnimationFrame(handle.id);
};

export const useRafTimeout = (fn: () => void, delay: number | undefined) => {
  const fnRef = useLatest(fn);
  const timerRef = useRef<Handle>(null);
  useEffect(() => {
    if (!(isNumber(delay) && delay >= 0)) {
      return noop;
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
