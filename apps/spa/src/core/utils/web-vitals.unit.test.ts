import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

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

// `environment: "node"`, so the browser globals the module touches don't exist.
interface DocumentStub {
  addEventListener: typeof capture;
  visibilityState: DocumentVisibilityState;
}

const documentStub: DocumentStub = {
  addEventListener: capture,
  visibilityState: "visible",
};

/**
 * SAFETY: web-vitals' `Metric` is a per-metric discriminated union carrying
 * `entries` arrays of `PerformanceEntry`. The reporter under test reads only the
 * five fields below, so the fixtures supply those and the cast stands in for the
 * performance-timeline data no assertion here depends on.
 */
const asMetric = (metric: {
  id: string;
  value: number;
  delta: number;
  navigationType: string;
  rating: string;
}) => metric as never;

vi.stubGlobal("document", documentStub);
vi.stubGlobal("addEventListener", capture);

const { reportWebVitals } = await import("./web-vitals");

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
  beforeAll(() => {
    reportWebVitals();
  });

  beforeEach(() => {
    forceFlush.mockClear();
    for (const record of Object.values(records)) {
      record.mockClear();
    }
  });

  it("registers meters at import", () => {
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

  it("wires listeners once and is idempotent", () => {
    reportWebVitals();

    expect(onLCP).toHaveBeenCalledOnce();
    expect(onINP).toHaveBeenCalledOnce();
    expect(onCLS).toHaveBeenCalledOnce();
    expect(onFCP).toHaveBeenCalledOnce();
    expect(onTTFB).toHaveBeenCalledOnce();
    // web-vitals finalizes CLS/INP/LCP on visibilitychange; pagehide is a backup
    expect(listeners.visibilitychange).toHaveLength(1);
    expect(listeners.pagehide).toHaveLength(1);
  });

  it("records LCP/FCP/TTFB immediately with semconv attrs", () => {
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

    // same id must not double-record
    onLCP.mock.calls[0]?.[0]?.(asMetric({ ...metric, value: 200 }));
    expect(records.lcp).toHaveBeenCalledOnce();
  });

  it("defers CLS/INP until the page hides and records the latest value once", () => {
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

    // a visibilitychange back to visible must not flush
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

    // a CLS increase under an already-exported id is dropped: a histogram
    // sample cannot be retracted, so the first hidden-time value wins
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

  it("flushes the reader on hide even when nothing is pending", () => {
    hide();

    expect(records.cls).not.toHaveBeenCalled();
    expect(records.inp).not.toHaveBeenCalled();
    // LCP/FCP/TTFB are recorded immediately but only leave on the reader tick
    expect(forceFlush).toHaveBeenCalledOnce();
  });

  it("still flushes on pagehide as a backup", () => {
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
