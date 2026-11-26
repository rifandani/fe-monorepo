import { fc, test } from "@fast-check/vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const exporters = vi.hoisted(() => ({
  flushed: new Array<string>(),
  metricReader: { forceFlush: async () => {} },
  spanProcessor: { forceFlush: async () => {} },
}));

vi.mock("@/lib/layers/telemetry", () => ({
  metricReader: {
    forceFlush: async () => {
      exporters.flushed.push("metrics");
      await exporters.metricReader.forceFlush();
    },
  },
  spanProcessor: {
    forceFlush: async () => {
      exporters.flushed.push("spans");
      await exporters.spanProcessor.forceFlush();
    },
  },
}));

type HideEvent = "pagehide" | "visibilitychange";

const listeners: Record<HideEvent, EventListener[]> = {
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

const failWhen = (fails: boolean) => async () => {
  if (fails) {
    await Promise.reject(new Error("offline"));
  }
};

beforeEach(() => {
  exporters.flushed = [];
  exporters.metricReader.forceFlush = async () => {};

  exporters.spanProcessor.forceFlush = async () => {};

  listeners.pagehide.length = 0;
  listeners.visibilitychange.length = 0;
  documentStub.visibilityState = "visible";
  vi.stubGlobal("document", documentStub);
  vi.stubGlobal("addEventListener", capture);
  vi.resetModules();
});

describe("deliverTelemetryOnHide", () => {
  it("should flush the spans and the metrics when the page becomes hidden", async () => {
    const { deliverTelemetryOnHide } = await import("./telemetry-delivery");
    deliverTelemetryOnHide();

    hide();

    expect(exporters.flushed.toSorted()).toEqual(["metrics", "spans"]);
  });

  it("should flush the spans and the metrics on pagehide", async () => {
    const { deliverTelemetryOnHide } = await import("./telemetry-delivery");
    deliverTelemetryOnHide();

    fire("pagehide");

    expect(exporters.flushed.toSorted()).toEqual(["metrics", "spans"]);
  });

  it("should not flush while the page stays visible", async () => {
    const { deliverTelemetryOnHide } = await import("./telemetry-delivery");
    deliverTelemetryOnHide();

    show();

    expect(exporters.flushed).toEqual([]);
  });

  it("should add its listeners only once", async () => {
    const { deliverTelemetryOnHide } = await import("./telemetry-delivery");

    deliverTelemetryOnHide();
    deliverTelemetryOnHide();

    expect(listeners.visibilitychange).toHaveLength(1);
    expect(listeners.pagehide).toHaveLength(1);
  });

  it("should run the flush hooks before it flushes the exporters", async () => {
    const { deliverTelemetryOnHide, onBeforeTelemetryFlush } =
      await import("./telemetry-delivery");

    deliverTelemetryOnHide();
    onBeforeTelemetryFlush(() => {
      exporters.flushed.push("hook");
    });

    hide();

    expect(exporters.flushed[0]).toBe("hook");
  });
});

describe("flushTelemetry", () => {
  it("should still flush both exporters when a flush hook throws", async () => {
    const { flushTelemetry, onBeforeTelemetryFlush } =
      await import("./telemetry-delivery");

    onBeforeTelemetryFlush(() => {
      throw new Error("config missing");
    });

    const flushed = flushTelemetry();

    await expect(flushed).resolves.toBeUndefined();
    expect(exporters.flushed.toSorted()).toEqual(["metrics", "spans"]);
  });

  it("should still flush the metrics when the span export fails", async () => {
    const { flushTelemetry } = await import("./telemetry-delivery");
    exporters.spanProcessor.forceFlush = failWhen(true);

    const flushed = flushTelemetry();

    await expect(flushed).resolves.toBeUndefined();
    expect(exporters.flushed.toSorted()).toEqual(["metrics", "spans"]);
  });

  test.prop([fc.boolean(), fc.boolean()])(
    "should never reject, whichever exporter fails",
    async (spans, metrics) => {
      const { flushTelemetry } = await import("./telemetry-delivery");
      exporters.spanProcessor.forceFlush = failWhen(spans);
      exporters.metricReader.forceFlush = failWhen(metrics);

      const flushed = flushTelemetry();

      await expect(flushed).resolves.toBeUndefined();
    }
  );
});
