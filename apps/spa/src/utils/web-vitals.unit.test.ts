import { fc } from "@fast-check/vitest";
import { Effect, Metric } from "effect";
import { describe, expect, it, vi } from "vitest";
import type { Metric as WebVitalsMetric } from "web-vitals";

import {
  METRICS_METER_WEB_VITALS_CLS,
  METRICS_METER_WEB_VITALS_FCP,
  METRICS_METER_WEB_VITALS_INP,
  METRICS_METER_WEB_VITALS_LCP,
  METRICS_METER_WEB_VITALS_TTFB,
} from "@/shared/constants/global";

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

vi.mock("@/lib/layers/runtime", async () => {
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

vi.mock("@/lib/layers/telemetry", () => ({
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

const report = (
  id: string,
  value: number,
  rating = "good",
  navigationType = "navigate"
) => asMetric({ id, value, delta: value, navigationType, rating });

const callbackOf = (reporter: typeof onLCP) => {
  const callback = reporter.mock.calls[0]?.[0];

  if (callback === undefined) {
    throw new Error("reportWebVitals did not register this reporter");
  }

  return callback;
};

const startReporting = async () => {
  const module = await loadModule();
  module.reportWebVitals();

  return module;
};

const startRun = () => {
  hide();
  show();
  harness.registry.current = new Map();
};

const goodNavigation = { navigation_type: "navigate", rating: "good" };

const vitalValueArb = fc.double({
  min: 0,
  noNaN: true,
  noDefaultInfinity: true,
});

const deferredEventArb = fc.oneof(
  vitalValueArb.map((value) => ({ kind: "report" as const, value })),
  fc.constantFrom({ kind: "hide" as const }, { kind: "show" as const })
);

describe("webVitalsHistograms", () => {
  it("should name each histogram after its web vital", async () => {
    const { webVitalsHistograms } = await loadModule();

    expect(webVitalsHistograms.lcp.id).toBe(METRICS_METER_WEB_VITALS_LCP);
    expect(webVitalsHistograms.inp.id).toBe(METRICS_METER_WEB_VITALS_INP);
    expect(webVitalsHistograms.cls.id).toBe(METRICS_METER_WEB_VITALS_CLS);
    expect(webVitalsHistograms.fcp.id).toBe(METRICS_METER_WEB_VITALS_FCP);
    expect(webVitalsHistograms.ttfb.id).toBe(METRICS_METER_WEB_VITALS_TTFB);
  });
});

describe("webVitalsAttributes", () => {
  it("should keep the navigation type and the rating, and drop the delta", async () => {
    const { webVitalsAttributes } = await loadModule();

    const attributes = webVitalsAttributes(report("v1", 120, "poor", "reload"));

    expect(attributes).toEqual({ navigation_type: "reload", rating: "poor" });
  });
});

describe("reportWebVitals", () => {
  it("should register each reporter and both hide listeners once", async () => {
    const { reportWebVitals } = await loadModule();

    reportWebVitals();
    reportWebVitals();

    for (const reporter of [onLCP, onINP, onCLS, onFCP, onTTFB]) {
      expect(reporter).toHaveBeenCalledOnce();
    }

    expect(listeners.visibilitychange).toHaveLength(1);
    expect(listeners.pagehide).toHaveLength(1);
  });

  it("should record LCP, FCP and TTFB at once with semconv attributes", async () => {
    const module = await startReporting();

    callbackOf(onLCP)(report("v1", 120));
    callbackOf(onFCP)(report("v2", 120));
    callbackOf(onTTFB)(report("v3", 120));

    for (const key of ["lcp", "fcp", "ttfb"] as const) {
      expect(samplesOf(module, key)).toEqual([
        { attributes: goodNavigation, count: 1, sum: 120 },
      ]);
    }
  });

  it("should ignore a second report of an LCP id that it already recorded", async () => {
    const module = await startReporting();
    callbackOf(onLCP)(report("v1", 120));

    callbackOf(onLCP)(report("v1", 200));

    expect(samplesOf(module, "lcp")).toEqual([
      { attributes: goodNavigation, count: 1, sum: 120 },
    ]);
  });

  it("should not record CLS or INP while the page stays visible", async () => {
    const module = await startReporting();
    callbackOf(onCLS)(report("cls-1", 0.05));
    callbackOf(onINP)(report("inp-1", 80));

    show();

    expect(samplesOf(module, "cls")).toEqual([]);
    expect(samplesOf(module, "inp")).toEqual([]);
    expect(forceFlush).not.toHaveBeenCalled();
  });

  it("should record the latest CLS and INP values once when the page hides", async () => {
    const module = await startReporting();
    callbackOf(onCLS)(report("cls-1", 0.05));
    callbackOf(onCLS)(report("cls-1", 0.12, "needs-improvement"));
    callbackOf(onINP)(report("inp-1", 80));

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
      { attributes: goodNavigation, count: 1, sum: 80 },
    ]);
    expect(forceFlush).toHaveBeenCalledOnce();
  });

  it("should keep the first hidden-time CLS value when CLS reports again later", async () => {
    const module = await startReporting();
    callbackOf(onCLS)(report("cls-1", 0.12));
    hide();

    callbackOf(onCLS)(report("cls-1", 0.4, "poor"));
    hide();

    expect(samplesOf(module, "cls")).toEqual([
      { attributes: goodNavigation, count: 1, sum: 0.12 },
    ]);
  });

  it("should flush the reader on hide even when nothing is pending", async () => {
    const module = await startReporting();

    hide();

    expect(samplesOf(module, "cls")).toEqual([]);
    expect(samplesOf(module, "inp")).toEqual([]);
    expect(forceFlush).toHaveBeenCalledOnce();
  });

  it("should still flush on pagehide as a backup", async () => {
    const module = await startReporting();
    callbackOf(onINP)(
      report("inp-2", 240, "needs-improvement", "back-forward-cache")
    );

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

    fire("pagehide");
    fire("pagehide");

    expect(samplesOf(module, "inp")).toEqual(expected);
  });

  it("should swallow a failed export, since the page is going away", async () => {
    await startReporting();
    forceFlush.mockImplementationOnce(async () => {
      await Promise.reject(new Error("offline"));
    });

    hide();
    await Promise.resolve();
    await Promise.resolve();

    expect(forceFlush).toHaveBeenCalledOnce();
  });

  it("should always record the first value of an LCP id and nothing after it", async () => {
    const module = await startReporting();
    let run = 0;

    fc.assert(
      fc.property(fc.array(vitalValueArb, { minLength: 1 }), (values) => {
        startRun();
        run += 1;
        const id = `lcp-${String(run)}`;

        for (const value of values) {
          callbackOf(onLCP)(report(id, value));
        }

        expect(samplesOf(module, "lcp")).toEqual([
          { attributes: goodNavigation, count: 1, sum: values[0] },
        ]);
      })
    );
  });

  it("should never record one CLS id twice, whatever the reports, hides and shows", async () => {
    const module = await startReporting();
    let run = 0;

    fc.assert(
      fc.property(fc.array(deferredEventArb), (events) => {
        startRun();
        run += 1;
        const id = `cls-${String(run)}`;

        for (const event of events) {
          if (event.kind === "report") {
            callbackOf(onCLS)(report(id, event.value));
          } else if (event.kind === "hide") {
            hide();
          } else {
            show();
          }
        }

        const [sample] = samplesOf(module, "cls");
        expect(sample?.count ?? 0).toBeLessThanOrEqual(1);
      })
    );
  });
});
