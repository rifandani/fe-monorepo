import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  METRICS_METER_WEB_VITALS,
  METRICS_METER_WEB_VITALS_CLS,
  METRICS_METER_WEB_VITALS_FCP,
  METRICS_METER_WEB_VITALS_INP,
  METRICS_METER_WEB_VITALS_LCP,
  METRICS_METER_WEB_VITALS_TTFB,
} from "@/core/constants/global";

import { reportWebVitals } from "./web-vitals";

const {
  onLCP,
  onINP,
  onCLS,
  onFCP,
  onTTFB,
  createHistogram,
  getMeter,
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
  const mockGgetMeter = vi.fn(() => ({ createHistogram: mockCreateHistogram }));
  return {
    onLCP: vi.fn(),
    onINP: vi.fn(),
    onCLS: vi.fn(),
    onFCP: vi.fn(),
    onTTFB: vi.fn(),
    createHistogram: mockCreateHistogram,
    getMeter: mockGgetMeter,
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
  },
}));

describe("reportWebVitals", () => {
  beforeEach(() => {
    onLCP.mockClear();
    onINP.mockClear();
    onCLS.mockClear();
    onFCP.mockClear();
    onTTFB.mockClear();
    for (const record of Object.values(records)) {
      record.mockClear();
    }
  });

  it("registers meters and web-vitals listeners at import", () => {
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

  it("wires each web-vital callback to its histogram", () => {
    reportWebVitals();

    expect(onLCP).toHaveBeenCalledOnce();
    expect(onINP).toHaveBeenCalledOnce();
    expect(onCLS).toHaveBeenCalledOnce();
    expect(onFCP).toHaveBeenCalledOnce();
    expect(onTTFB).toHaveBeenCalledOnce();

    const metric = {
      value: 120,
      delta: 10,
      navigationType: "navigate",
      rating: "good",
    } as const;

    onLCP.mock.calls[0]?.[0]?.(metric as never);
    onINP.mock.calls[0]?.[0]?.(metric as never);
    onCLS.mock.calls[0]?.[0]?.(metric as never);
    onFCP.mock.calls[0]?.[0]?.(metric as never);
    onTTFB.mock.calls[0]?.[0]?.(metric as never);

    const attrs = {
      delta: 10,
      navigationType: "navigate",
      rating: "good",
    };
    expect(records.lcp).toHaveBeenCalledWith(120, attrs);
    expect(records.inp).toHaveBeenCalledWith(120, attrs);
    expect(records.cls).toHaveBeenCalledWith(120, attrs);
    expect(records.fcp).toHaveBeenCalledWith(120, attrs);
    expect(records.ttfb).toHaveBeenCalledWith(120, attrs);
  });
});
