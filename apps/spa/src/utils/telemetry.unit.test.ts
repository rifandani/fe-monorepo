import { describe, expect, it } from "@effect/vitest";
import { fc, test } from "@fast-check/vitest";
import { Effect, Exit, Schema, Tracer } from "effect";

import { recordException, toReportedError } from "./telemetry";

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

const unstringableThrownArb = fc.anything().map((toString) => ({ toString }));

describe("toReportedError", () => {
  it("should read the message, the name and the stack of an Error", () => {
    const error = new TypeError("boom");

    const reported = toReportedError(error);

    expect(reported).toEqual({
      message: "boom",
      name: "TypeError",
      stack: error.stack,
    });
  });

  it("should stringify a thrown value that is not an Error", () => {
    const reported = toReportedError("boom");

    expect(reported).toEqual({
      message: "boom",
      name: undefined,
      stack: undefined,
    });
  });

  it("should keep extra fields but never let them overwrite the message", () => {
    const extra = { componentStack: "at App", message: "spoofed" };

    const reported = toReportedError(new Error("boom"), extra);

    expect(reported).toMatchObject({
      componentStack: "at App",
      message: "boom",
    });
  });

  it("should report a thrown object with no prototype by its tag", () => {
    const thrown: unknown = Object.create(null);

    const reported = toReportedError(thrown);

    expect(reported.message).toBe("[object Object]");
  });

  test.prop([fc.string(), fc.string()])(
    "should always read the message of an Error, whatever the extra fields hold",
    (message, spoofed) => {
      const reported = toReportedError(new Error(message), {
        message: spoofed,
      });

      expect(reported.message).toBe(message);
    }
  );

  test.prop([fc.anything({ withNullPrototype: true })])(
    "should never throw, whatever was thrown",
    (thrown) => {
      const reported = toReportedError(thrown);

      expect(reported.message).toEqual(expect.any(String));
    }
  );

  test.prop([unstringableThrownArb])(
    "should report an object that String() cannot convert by its tag",
    (thrown) => {
      const reported = toReportedError(thrown);

      expect(reported.message).toBe("[object Object]");
    }
  );
});

describe("recordException", () => {
  it.effect(
    "should record one failed span that carries the error as attributes",
    () =>
      Effect.gen(function* () {
        const { spans, tracer } = recordingTracer();

        const error = {
          message: "boom",
          stack: "at App",
          componentStack: "at Root",
        };

        const exit = yield* Effect.exit(
          recordException("reactEntry.onCaughtError", error).pipe(
            Effect.withTracer(tracer)
          )
        );

        expect(Exit.isSuccess(exit)).toBe(true);
        expect(spans).toHaveLength(1);
        const [span] = spans;
        expect(span?.name).toBe("reactEntry.onCaughtError");
        expect(span?.attributes.get("error.message")).toBe("boom");
        expect(span?.attributes.get("error.stack")).toBe("at App");
        expect(span?.attributes.get("error.componentStack")).toBe("at Root");
        expect(
          span?.status._tag === "Ended" && Exit.isFailure(span.status.exit)
        ).toBe(true);
      })
  );

  it.effect.prop(
    "should always succeed, so reporting a failure never becomes one",
    [Schema.String, Schema.String],
    ([name, message]) =>
      Effect.gen(function* () {
        const { tracer } = recordingTracer();

        const exit = yield* Effect.exit(
          recordException(name, { message }).pipe(Effect.withTracer(tracer))
        );

        expect(Exit.isSuccess(exit)).toBe(true);
      })
  );
});
