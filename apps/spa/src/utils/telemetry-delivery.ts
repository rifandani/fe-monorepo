import { metricReader, spanProcessor } from "@/lib/layers/telemetry";

type FlushHook = () => void;

const flushHooks = new Set<FlushHook>();

const ignoreFailure = (): void => undefined;

const runHook = (hook: FlushHook): void => {
  try {
    hook();
  } catch {
    ignoreFailure();
  }
};

export const onBeforeTelemetryFlush = (hook: FlushHook): void => {
  flushHooks.add(hook);
};

export const flushTelemetry = async (): Promise<void> => {
  for (const hook of flushHooks) {
    runHook(hook);
  }

  await Promise.all([
    spanProcessor.forceFlush().catch(ignoreFailure),
    metricReader.forceFlush().catch(ignoreFailure),
  ]);
};

const flushOnHide = (): void => {
  void flushTelemetry();
};

const flushIfHidden = (): void => {
  if (document.visibilityState === "hidden") {
    flushOnHide();
  }
};

let started = false;

export const deliverTelemetryOnHide = (): void => {
  if (started) {
    return;
  }

  started = true;

  document.addEventListener("visibilitychange", flushIfHidden, {
    capture: true,
  });
  globalThis.addEventListener("pagehide", flushOnHide, { capture: true });
};
