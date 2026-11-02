import { describe, expect, it } from "@effect/vitest";
import { Effect, Exit, Tracer } from "effect";

import { recordException, toReportedError } from "./telemetry";

/** A tracer that keeps every span it starts, so the test can read them back. */
const recordingTracer = () => {
  const spans: Tracer.NativeSpan[] = [];

  const tracer = Tracer.make({
    span: (options) => {
      const span = new Tracer.NativeSpan(options);
      spans.push(span);

      return span;
    },
  });

  return { spans, tracer };
};

describe("toReportedError", () => {
  it("reads message, name and stack off an Error", () => {
    const error = new TypeError("boom");

    expect(toReportedError(error)).toEqual({
      message: "boom",
      name: "TypeError",
      stack: error.stack,
    });
  });

  it("stringifies a thrown value that is not an Error", () => {
    expect(toReportedError("boom")).toEqual({
      message: "boom",
      name: undefined,
      stack: undefined,
    });
  });

  it("keeps extra fields, but never lets them overwrite the message", () => {
    expect(
      toReportedError(new Error("boom"), {
        componentStack: "at App",
        message: "spoofed",
      })
    ).toMatchObject({ componentStack: "at App", message: "boom" });
  });
});

describe("recordException", () => {
  it.effect("records one failed span carrying the error as attributes", () =>
    Effect.gen(function* () {
      const { spans, tracer } = recordingTracer();

      const exit = yield* Effect.exit(
        recordException("reactEntry.onCaughtError", {
          message: "boom",
          stack: "at App",
          componentStack: "at Root",
        }).pipe(Effect.withTracer(tracer))
      );

      expect(Exit.isSuccess(exit)).toBe(true);
      expect(spans).toHaveLength(1);

      const [span] = spans;

      expect(span?.name).toBe("reactEntry.onCaughtError");
      expect(span?.attributes.get("error.message")).toBe("boom");
      expect(span?.attributes.get("error.stack")).toBe("at App");
      expect(span?.attributes.get("error.componentStack")).toBe("at Root");
      expect(span?.status._tag).toBe("Ended");
      expect(
        span?.status._tag === "Ended" && Exit.isFailure(span.status.exit)
      ).toBe(true);
    })
  );
});
