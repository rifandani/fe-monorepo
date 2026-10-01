import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  METRICS_METER_WEB_VITALS,
  METRICS_METER_WEB_VITALS_CLS,
  METRICS_METER_WEB_VITALS_FCP,
  METRICS_METER_WEB_VITALS_INP,
  METRICS_METER_WEB_VITALS_LCP,
  METRICS_METER_WEB_VITALS_TTFB,
} from "@/core/constants/global";

const {
  onLCP,
  onINP,
  onCLS,
  onFCP,
  onTTFB,
  createHistogram,
  getMeter,
  forceFlush,
  records,
  resetHistogramIndex,
} = vi.hoisted(() => {
  const webVitalsRecords = {
    lcp: vi.fn(),
    inp: vi.fn(),
    cls: vi.fn(),
    fcp: vi.fn(),
    ttfb: vi.fn(),
  };
  const histograms = [
    { record: webVitalsRecords.lcp },
    { record: webVitalsRecords.inp },
    { record: webVitalsRecords.cls },
    { record: webVitalsRecords.fcp },
    { record: webVitalsRecords.ttfb },
  ];
  let i = 0;
  const mockCreateHistogram = vi.fn(() => {
    const histogram = histograms[i];
    i += 1;
    return histogram;
  });
  return {
    onLCP: vi.fn(),
    onINP: vi.fn(),
    onCLS: vi.fn(),
    onFCP: vi.fn(),
    onTTFB: vi.fn(),
    createHistogram: mockCreateHistogram,
    getMeter: vi.fn(() => ({ createHistogram: mockCreateHistogram })),
    forceFlush: vi.fn(() => Promise.resolve()),
    records: webVitalsRecords,
    resetHistogramIndex: () => {
      i = 0;
    },
  };
});

vi.mock("web-vitals", () => ({
  onLCP,
  onINP,
  onCLS,
  onFCP,
  onTTFB,
}));

vi.mock("@/instrumentation", () => ({
  meterProvider: {
    getMeter,
    forceFlush,
  },
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
      "handleEvent" in listener ? listener.handleEvent : listener
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
  metric as never;

const resetHarness = () => {
  listeners.pagehide.length = 0;
  listeners.visibilitychange.length = 0;
  documentStub.visibilityState = "visible";
  resetHistogramIndex();
  getMeter.mockClear();
  createHistogram.mockClear();
  onLCP.mockClear();
  onINP.mockClear();
  onCLS.mockClear();
  onFCP.mockClear();
  onTTFB.mockClear();
  forceFlush.mockClear();
  for (const record of Object.values(records)) {
    record.mockClear();
  }
  vi.stubGlobal("document", documentStub);
  vi.stubGlobal("addEventListener", capture);
  vi.resetModules();
};

const loadModule = () => {
  resetHarness();
  return import("./web-vitals");
};

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
  beforeEach(() => {
    forceFlush.mockClear();
    for (const record of Object.values(records)) {
      record.mockClear();
    }
  });

  it("registers meters at import", async () => {
    await loadModule();
    expect(getMeter).toHaveBeenCalledWith(METRICS_METER_WEB_VITALS);
    expect(createHistogram).toHaveBeenCalledWith(METRICS_METER_WEB_VITALS_LCP, {
      description: "Largest Contentful Paint",
      unit: "ms",
    });
    expect(createHistogram).toHaveBeenCalledWith(METRICS_METER_WEB_VITALS_INP, {
      description: "Interaction to Next Paint",
      unit: "ms",
    });
    expect(createHistogram).toHaveBeenCalledWith(METRICS_METER_WEB_VITALS_CLS, {
      description: "Cumulative Layout Shift",
      unit: "1",
    });
    expect(createHistogram).toHaveBeenCalledWith(METRICS_METER_WEB_VITALS_FCP, {
      description: "First Contentful Paint",
      unit: "ms",
    });
    expect(createHistogram).toHaveBeenCalledWith(
      METRICS_METER_WEB_VITALS_TTFB,
      {
        description: "Time to First Byte",
        unit: "ms",
      }
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
    const { reportWebVitals } = await loadModule();
    reportWebVitals();

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

    const attrs = {
      navigation_type: "navigate",
      rating: "good",
    };
    expect(records.lcp).toHaveBeenCalledWith(120, attrs);
    expect(records.fcp).toHaveBeenCalledWith(120, attrs);
    expect(records.ttfb).toHaveBeenCalledWith(120, attrs);

    onLCP.mock.calls[0]?.[0]?.(asMetric({ ...metric, value: 200 }));
    expect(records.lcp).toHaveBeenCalledOnce();
  });

  it("defers CLS/INP until the page hides and records the latest value once", async () => {
    const { reportWebVitals } = await loadModule();
    reportWebVitals();

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

    expect(records.cls).not.toHaveBeenCalled();
    expect(records.inp).not.toHaveBeenCalled();

    show();
    expect(records.cls).not.toHaveBeenCalled();
    expect(forceFlush).not.toHaveBeenCalled();

    hide();

    expect(records.cls).toHaveBeenCalledOnce();
    expect(records.cls).toHaveBeenCalledWith(0.12, {
      navigation_type: "navigate",
      rating: "needs-improvement",
    });
    expect(records.inp).toHaveBeenCalledOnce();
    expect(records.inp).toHaveBeenCalledWith(80, {
      navigation_type: "navigate",
      rating: "good",
    });
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
    expect(records.cls).toHaveBeenCalledOnce();
  });

  it("flushes the reader on hide even when nothing is pending", async () => {
    const { reportWebVitals } = await loadModule();
    reportWebVitals();

    hide();

    expect(records.cls).not.toHaveBeenCalled();
    expect(records.inp).not.toHaveBeenCalled();
    expect(forceFlush).toHaveBeenCalledOnce();
  });

  it("still flushes on pagehide as a backup", async () => {
    const { reportWebVitals } = await loadModule();
    reportWebVitals();

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

    expect(records.inp).toHaveBeenCalledOnce();
    expect(records.inp).toHaveBeenCalledWith(240, {
      navigation_type: "back-forward-cache",
      rating: "needs-improvement",
    });
    expect(forceFlush).toHaveBeenCalledOnce();

    fire("pagehide");
    expect(records.inp).toHaveBeenCalledOnce();
  });
});
