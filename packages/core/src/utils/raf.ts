interface FrameHandle {
  kind: "frame";
  id: number;
}

interface TimeoutHandle {
  kind: "timeout";
  id: ReturnType<typeof setTimeout>;
}

interface IntervalHandle {
  kind: "interval";
  id: ReturnType<typeof setInterval>;
}

export type RafHandle = FrameHandle | IntervalHandle | TimeoutHandle;

const hasRequestAnimationFrame = () => "requestAnimationFrame" in globalThis;

const isTimerDelay = (delay: number | undefined): delay is number =>
  Number.isFinite(delay) && delay !== undefined && delay >= 0;

export const startRafTimeout = (
  run: () => void,
  delay: number | undefined
): RafHandle | null => {
  if (!isTimerDelay(delay)) {
    return null;
  }

  if (!hasRequestAnimationFrame()) {
    return { kind: "timeout", id: setTimeout(run, delay) };
  }

  const handle: FrameHandle = { kind: "frame", id: 0 };
  const startTime = Date.now();

  const loop = () => {
    if (Date.now() - startTime >= delay) {
      run();
    } else {
      handle.id = requestAnimationFrame(loop);
    }
  };

  handle.id = requestAnimationFrame(loop);

  return handle;
};

export const startRafInterval = (
  run: () => void,
  delay: number | undefined
): RafHandle | null => {
  if (!isTimerDelay(delay)) {
    return null;
  }

  if (!hasRequestAnimationFrame()) {
    return { kind: "interval", id: setInterval(run, delay) };
  }

  let start = Date.now();
  const handle: FrameHandle = { kind: "frame", id: 0 };

  const loop = () => {
    if (Date.now() - start >= delay) {
      run();
      start = Date.now();
    }

    handle.id = requestAnimationFrame(loop);
  };

  handle.id = requestAnimationFrame(loop);

  return handle;
};

export const clearRafTimer = (handle: RafHandle) => {
  if (handle.kind === "timeout") {
    clearTimeout(handle.id);

    return;
  }

  if (handle.kind === "interval") {
    clearInterval(handle.id);

    return;
  }

  cancelAnimationFrame(handle.id);
};
