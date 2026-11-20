import { describe, expect, it } from "@effect/vitest";
import { fc, test } from "@fast-check/vitest";
import { Effect, Exit, Tracer } from "effect";

import { recordException, toReportedError } from "./telemetry";

// Helpers

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

/**
 * An object that `String()` cannot convert: its `toString` is not a function,
 * so the conversion falls through to `valueOf`, which returns the object.
 */
const unstringableThrownArb = fc.anything().map((toString) => ({ toString }));

describe("toReportedError", () => {
  it("should read the message, the name and the stack of an Error", () => {
    // Arrange
    const error = new TypeError("boom");

    // Act
    const reported = toReportedError(error);

    // Assert
    expect(reported).toEqual({
      message: "boom",
      name: "TypeError",
      stack: error.stack,
    });
  });

  it("should stringify a thrown value that is not an Error", () => {
    // Act
    const reported = toReportedError("boom");

    // Assert
    expect(reported).toEqual({
      message: "boom",
      name: undefined,
      stack: undefined,
    });
  });

  it("should keep extra fields but never let them overwrite the message", () => {
    // Arrange
    const extra = { componentStack: "at App", message: "spoofed" };

    // Act
    const reported = toReportedError(new Error("boom"), extra);

    // Assert
    expect(reported).toMatchObject({
      componentStack: "at App",
      message: "boom",
    });
  });

  it("should report a thrown object with no prototype by its tag", () => {
    // Arrange
    const thrown: unknown = Object.create(null);

    // Act
    const reported = toReportedError(thrown);

    // Assert
    expect(reported.message).toBe("[object Object]");
  });

  test.prop([fc.string(), fc.string()])(
    "should always read the message of an Error, whatever the extra fields hold",
    (message, spoofed) => {
      // Act
      const reported = toReportedError(new Error(message), {
        message: spoofed,
      });

      // Assert
      expect(reported.message).toBe(message);
    }
  );

  test.prop([fc.anything({ withNullPrototype: true })])(
    "should never throw, whatever was thrown",
    (thrown) => {
      // Act
      const reported = toReportedError(thrown);

      // Assert
      expect(reported.message).toEqual(expect.any(String));
    }
  );

  test.prop([unstringableThrownArb])(
    "should report an object that String() cannot convert by its tag",
    (thrown) => {
      // Act
      const reported = toReportedError(thrown);

      // Assert
      expect(reported.message).toBe("[object Object]");
    }
  );
});

describe("recordException", () => {
  it.effect(
    "should record one failed span that carries the error as attributes",
    () =>
      Effect.gen(function* () {
        // Arrange
        const { spans, tracer } = recordingTracer();

        const error = {
          message: "boom",
          stack: "at App",
          componentStack: "at Root",
        };

        // Act
        const exit = yield* Effect.exit(
          recordException("reactEntry.onCaughtError", error).pipe(
            Effect.withTracer(tracer)
          )
        );

        // Assert
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

  test.prop([fc.string(), fc.string()])(
    "should always succeed, so reporting a failure never becomes one",
    async (name, message) => {
      // Arrange
      const { tracer } = recordingTracer();

      // Act
      const exit = await Effect.runPromiseExit(
        recordException(name, { message }).pipe(Effect.withTracer(tracer))
      );

      // Assert
      expect(Exit.isSuccess(exit)).toBe(true);
    }
  );
});
