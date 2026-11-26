import { once } from "radashi";

import { bufferedExporters } from "@/lib/layers/telemetry";

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

  await Promise.all(
    bufferedExporters.map(async (exporter) => {
      await exporter.forceFlush().catch(ignoreFailure);
    })
  );
};

const flushOnHide = (): void => {
  void flushTelemetry();
};

const flushIfHidden = (): void => {
  if (document.visibilityState === "hidden") {
    flushOnHide();
  }
};

export const deliverTelemetryOnHide = once((): void => {
  document.addEventListener("visibilitychange", flushIfHidden, {
    capture: true,
  });
  globalThis.addEventListener("pagehide", flushOnHide, { capture: true });
});
