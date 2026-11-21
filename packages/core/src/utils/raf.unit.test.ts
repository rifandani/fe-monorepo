import { fc, test } from "@fast-check/vitest";
import {
  clearRafTimer,
  startRafInterval,
  startRafTimeout,
} from "@workspace/core/utils/raf";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const FRAME_MS = 16;

const LONG_WAIT_MS = 60_000;

const invalidDelayArb = fc.oneof(
  fc.double({ max: -Number.MIN_VALUE }),
  fc.constantFrom(Number.NaN, Number.POSITIVE_INFINITY, undefined)
);

const PATHS: ("frame" | "timer")[] = ["frame", "timer"];

const pathArb = fc.constantFrom(...PATHS);

const installAnimationFrames = () => {
  const frames = new Map<number, ReturnType<typeof setTimeout>>();
  let nextId = 0;

  vi.stubGlobal("requestAnimationFrame", (onFrame: FrameRequestCallback) => {
    nextId += 1;
    const id = nextId;
    frames.set(
      id,
      setTimeout(() => {
        frames.delete(id);
        onFrame(Date.now());
      }, FRAME_MS)
    );

    return id;
  });

  vi.stubGlobal("cancelAnimationFrame", (id: number) => {
    clearTimeout(frames.get(id));
    frames.delete(id);
  });
};

const removeAnimationFrames = () => {
  Reflect.deleteProperty(globalThis, "requestAnimationFrame");
  Reflect.deleteProperty(globalThis, "cancelAnimationFrame");
};

const usePath = (path: "frame" | "timer") => {
  removeAnimationFrames();

  if (path === "frame") {
    installAnimationFrames();
  }
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  removeAnimationFrames();
  vi.useRealTimers();
});

describe("startRafTimeout", () => {
  it("should call the callback once after the delay with animation frames", () => {
    usePath("frame");
    const callback = vi.fn<() => void>();

    startRafTimeout(callback, 100);
    vi.advanceTimersByTime(LONG_WAIT_MS);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should call the callback once after the delay without animation frames", () => {
    usePath("timer");
    const callback = vi.fn<() => void>();

    startRafTimeout(callback, 100);
    vi.advanceTimersByTime(LONG_WAIT_MS);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should not call the callback before the delay", () => {
    usePath("frame");
    const callback = vi.fn<() => void>();

    startRafTimeout(callback, 100);
    vi.advanceTimersByTime(50);

    expect(callback).not.toHaveBeenCalled();
  });

  test.prop([pathArb, fc.nat({ max: LONG_WAIT_MS / 2 })])(
    "should call the callback once for any finite delay of zero or more",
    (path, delay) => {
      usePath(path);
      const callback = vi.fn<() => void>();

      startRafTimeout(callback, delay);
      vi.advanceTimersByTime(LONG_WAIT_MS);

      expect(callback).toHaveBeenCalledTimes(1);
    }
  );

  test.prop([pathArb, invalidDelayArb])(
    "should never start a timer for a negative or non-finite delay",
    (path, delay) => {
      usePath(path);
      const callback = vi.fn<() => void>();

      const handle = startRafTimeout(callback, delay);
      vi.advanceTimersByTime(LONG_WAIT_MS);

      expect(handle).toBeNull();
      expect(callback).not.toHaveBeenCalled();
    }
  );
});

describe("startRafInterval", () => {
  it("should call the callback repeatedly with animation frames", () => {
    usePath("frame");
    const callback = vi.fn<() => void>();

    startRafInterval(callback, 100);
    vi.advanceTimersByTime(1000);

    expect(callback.mock.calls.length).toBeGreaterThan(1);
  });

  it("should call the callback repeatedly without animation frames", () => {
    usePath("timer");
    const callback = vi.fn<() => void>();

    startRafInterval(callback, 100);
    vi.advanceTimersByTime(1000);

    expect(callback).toHaveBeenCalledTimes(10);
  });

  test.prop([pathArb, invalidDelayArb])(
    "should never start a timer for a negative or non-finite delay",
    (path, delay) => {
      usePath(path);
      const callback = vi.fn<() => void>();

      const handle = startRafInterval(callback, delay);
      vi.advanceTimersByTime(LONG_WAIT_MS);

      expect(handle).toBeNull();
      expect(callback).not.toHaveBeenCalled();
    }
  );
});

describe("clearRafTimer", () => {
  it.each(PATHS)(
    "should stop a timeout before it calls the callback (%s)",
    (path) => {
      usePath(path);
      const callback = vi.fn<() => void>();
      const handle = startRafTimeout(callback, 100);

      if (handle) {
        clearRafTimer(handle);
      }

      vi.advanceTimersByTime(LONG_WAIT_MS);

      expect(callback).not.toHaveBeenCalled();
    }
  );

  it.each(PATHS)(
    "should stop an interval from calling the callback again (%s)",
    (path) => {
      usePath(path);
      const callback = vi.fn<() => void>();
      const handle = startRafInterval(callback, 100);
      vi.advanceTimersByTime(1000);
      const callsBeforeClear = callback.mock.calls.length;

      if (handle) {
        clearRafTimer(handle);
      }

      vi.advanceTimersByTime(1000);

      expect(callback).toHaveBeenCalledTimes(callsBeforeClear);
    }
  );
});
