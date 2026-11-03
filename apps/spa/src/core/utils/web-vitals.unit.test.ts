import { Effect, Metric } from "effect";
import { describe, expect, it, vi } from "vitest";
import type { Metric as WebVitalsMetric } from "web-vitals";

import {
  METRICS_METER_WEB_VITALS_CLS,
  METRICS_METER_WEB_VITALS_FCP,
  METRICS_METER_WEB_VITALS_INP,
  METRICS_METER_WEB_VITALS_LCP,
  METRICS_METER_WEB_VITALS_TTFB,
} from "@/core/constants/global";

/** The shape of `onLCP`, `onINP` and the other `web-vitals` reporters. */
type OnMetric = (callback: (metric: WebVitalsMetric) => void) => void;

const harness = vi.hoisted(() => ({
  onLCP: vi.fn<OnMetric>(),
  onINP: vi.fn<OnMetric>(),
  onCLS: vi.fn<OnMetric>(),
  onFCP: vi.fn<OnMetric>(),
  onTTFB: vi.fn<OnMetric>(),
  forceFlush: vi.fn(async () => {
    await Promise.resolve();
  }),
  /** A fresh metric registry per module load, so samples never leak between tests. */
  registry: { current: new Map() } satisfies { current: Metric.MetricRegistry },
}));

const { onLCP, onINP, onCLS, onFCP, onTTFB, forceFlush } = harness;

vi.mock("web-vitals", () => ({
  onLCP: harness.onLCP,
  onINP: harness.onINP,
  onCLS: harness.onCLS,
  onFCP: harness.onFCP,
  onTTFB: harness.onTTFB,
}));

// The real runtime would build telemetry and HTTP layers; the module only needs
// it to run `Metric.update`, so it runs on a per-test registry instead.
vi.mock("@/core/layers/runtime", async () => {
  const effect = await import("effect");

  return {
    appRuntime: {
      runSync: <A>(program: Effect.Effect<A>) =>
        effect.Effect.runSync(
          effect.Effect.provideService(
            program,
            effect.Metric.MetricRegistry,
            harness.registry.current
          )
        ),
    },
  };
});

vi.mock("@/core/layers/telemetry", () => ({
  metricReader: { forceFlush: harness.forceFlush },
}));

type HideEvent = "pagehide" | "visibilitychange";

interface HideListeners {
  pagehide: EventListener[];
  visibilitychange: EventListener[];
}

const listeners: HideListeners = {
  pagehide: [],
  visibilitychange: [],
};

const capture = (
  type: string,
  listener: EventListenerOrEventListenerObject
) => {
  if (type === "pagehide" || type === "visibilitychange") {
    listeners[type].push(
      "handleEvent" in listener
        ? (event) => {
            listener.handleEvent(event);
          }
        : listener
    );
  }
};

interface DocumentStub {
  addEventListener: typeof capture;
  visibilityState: DocumentVisibilityState;
}

const documentStub: DocumentStub = {
  addEventListener: capture,
  visibilityState: "visible",
};

const asMetric = (metric: {
  id: string;
  value: number;
  delta: number;
  navigationType: string;
  rating: string;
}) =>
  // SAFETY: the callback only reads fields present on this stub; `Metric` adds
  // entries and attribution the test never supplies.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  metric as never;

const resetHarness = () => {
  listeners.pagehide.length = 0;
  listeners.visibilitychange.length = 0;
  documentStub.visibilityState = "visible";
  harness.registry.current = new Map();
  onLCP.mockClear();
  onINP.mockClear();
  onCLS.mockClear();
  onFCP.mockClear();
  onTTFB.mockClear();
  forceFlush.mockClear();

  vi.stubGlobal("document", documentStub);
  vi.stubGlobal("addEventListener", capture);
  vi.resetModules();
};

const loadModule = async () => {
  resetHarness();

  return await import("./web-vitals");
};

type WebVitalsModule = Awaited<ReturnType<typeof loadModule>>;

type HistogramKey = keyof WebVitalsModule["webVitalsHistograms"];

/** Every sample one histogram holds, across all attribute sets, read from the registry. */
const samplesOf = (module: WebVitalsModule, key: HistogramKey) =>
  Effect.runSync(
    Effect.provideService(
      Metric.snapshot,
      Metric.MetricRegistry,
      harness.registry.current
    )
  )
    .filter(
      (snapshot) =>
        snapshot.type === "Histogram" &&
        snapshot.id === module.webVitalsHistograms[key].id
    )
    .flatMap((snapshot) =>
      snapshot.type === "Histogram" && snapshot.state.count > 0
        ? [
            {
              attributes: snapshot.attributes,
              count: snapshot.state.count,
              sum: snapshot.state.sum,
            },
          ]
        : []
    );

const fire = (type: HideEvent) => {
  for (const listener of listeners[type]) {
    listener(new Event(type));
  }
};

const hide = () => {
  documentStub.visibilityState = "hidden";
  fire("visibilitychange");
};

const show = () => {
  documentStub.visibilityState = "visible";
  fire("visibilitychange");
};

describe("reportWebVitals", () => {
  it("names each histogram after its web vital", async () => {
    const module = await loadModule();

    expect(module.webVitalsHistograms.lcp.id).toBe(
      METRICS_METER_WEB_VITALS_LCP
    );
    expect(module.webVitalsHistograms.inp.id).toBe(
      METRICS_METER_WEB_VITALS_INP
    );
    expect(module.webVitalsHistograms.cls.id).toBe(
      METRICS_METER_WEB_VITALS_CLS
    );
    expect(module.webVitalsHistograms.fcp.id).toBe(
      METRICS_METER_WEB_VITALS_FCP
    );
    expect(module.webVitalsHistograms.ttfb.id).toBe(
      METRICS_METER_WEB_VITALS_TTFB
    );
  });

  it("wires listeners once and is idempotent", async () => {
    const { reportWebVitals } = await loadModule();
    reportWebVitals();

    expect(onLCP).toHaveBeenCalledOnce();
    expect(onINP).toHaveBeenCalledOnce();
    expect(onCLS).toHaveBeenCalledOnce();
    expect(onFCP).toHaveBeenCalledOnce();
    expect(onTTFB).toHaveBeenCalledOnce();
    expect(listeners.visibilitychange).toHaveLength(1);
    expect(listeners.pagehide).toHaveLength(1);

    reportWebVitals();
    expect(onLCP).toHaveBeenCalledOnce();
  });

  it("records LCP/FCP/TTFB immediately with semconv attrs", async () => {
    const module = await loadModule();
    module.reportWebVitals();

    const metric = {
      id: "v1",
      value: 120,
      delta: 120,
      navigationType: "navigate",
      rating: "good",
    } as const;

    onLCP.mock.calls[0]?.[0]?.(asMetric(metric));
    onFCP.mock.calls[0]?.[0]?.(asMetric({ ...metric, id: "v2" }));
    onTTFB.mock.calls[0]?.[0]?.(asMetric({ ...metric, id: "v3" }));

    const attributes = {
      navigation_type: "navigate",
      rating: "good",
    };

    for (const key of ["lcp", "fcp", "ttfb"] as const) {
      expect(samplesOf(module, key)).toEqual([
        { attributes, count: 1, sum: 120 },
      ]);
    }

    onLCP.mock.calls[0]?.[0]?.(asMetric({ ...metric, value: 200 }));
    expect(samplesOf(module, "lcp")).toEqual([
      { attributes, count: 1, sum: 120 },
    ]);
  });

  it("defers CLS/INP until the page hides and records the latest value once", async () => {
    const module = await loadModule();
    module.reportWebVitals();

    const clsCb = onCLS.mock.calls[0]?.[0];
    const inpCb = onINP.mock.calls[0]?.[0];

    clsCb?.(
      asMetric({
        id: "cls-1",
        value: 0.05,
        delta: 0.05,
        navigationType: "navigate",
        rating: "good",
      })
    );
    clsCb?.(
      asMetric({
        id: "cls-1",
        value: 0.12,
        delta: 0.07,
        navigationType: "navigate",
        rating: "needs-improvement",
      })
    );
    inpCb?.(
      asMetric({
        id: "inp-1",
        value: 80,
        delta: 80,
        navigationType: "navigate",
        rating: "good",
      })
    );

    expect(samplesOf(module, "cls")).toEqual([]);
    expect(samplesOf(module, "inp")).toEqual([]);

    show();
    expect(samplesOf(module, "cls")).toEqual([]);
    expect(forceFlush).not.toHaveBeenCalled();

    hide();

    expect(samplesOf(module, "cls")).toEqual([
      {
        attributes: {
          navigation_type: "navigate",
          rating: "needs-improvement",
        },
        count: 1,
        sum: 0.12,
      },
    ]);
    expect(samplesOf(module, "inp")).toEqual([
      {
        attributes: { navigation_type: "navigate", rating: "good" },
        count: 1,
        sum: 80,
      },
    ]);
    expect(forceFlush).toHaveBeenCalledOnce();

    clsCb?.(
      asMetric({
        id: "cls-1",
        value: 0.4,
        delta: 0.28,
        navigationType: "navigate",
        rating: "poor",
      })
    );
    hide();
    expect(samplesOf(module, "cls")).toHaveLength(1);
  });

  it("flushes the reader on hide even when nothing is pending", async () => {
    const module = await loadModule();
    module.reportWebVitals();

    hide();

    expect(samplesOf(module, "cls")).toEqual([]);
    expect(samplesOf(module, "inp")).toEqual([]);
    expect(forceFlush).toHaveBeenCalledOnce();
  });

  it("still flushes on pagehide as a backup", async () => {
    const module = await loadModule();
    module.reportWebVitals();

    const inpCb = onINP.mock.calls[0]?.[0];

    inpCb?.(
      asMetric({
        id: "inp-2",
        value: 240,
        delta: 240,
        navigationType: "back-forward-cache",
        rating: "needs-improvement",
      })
    );

    fire("pagehide");

    const expected = [
      {
        attributes: {
          navigation_type: "back-forward-cache",
          rating: "needs-improvement",
        },
        count: 1,
        sum: 240,
      },
    ];

    expect(samplesOf(module, "inp")).toEqual(expected);
    expect(forceFlush).toHaveBeenCalledOnce();

    fire("pagehide");
    expect(samplesOf(module, "inp")).toEqual(expected);
  });

  it("swallows a failed export, since the page is going away", async () => {
    const module = await loadModule();
    module.reportWebVitals();
    forceFlush.mockImplementationOnce(async () => {
      await Promise.reject(new Error("offline"));
    });

    hide();

    // `drainReader` runs detached; let its rejection settle.
    await Promise.resolve();
    await Promise.resolve();

    expect(forceFlush).toHaveBeenCalledOnce();
  });
});
