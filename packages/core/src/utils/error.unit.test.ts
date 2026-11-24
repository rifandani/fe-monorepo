import { describe, expect, it } from "@effect/vitest";
import { fc, test } from "@fast-check/vitest";
import { HttpResponseError } from "@workspace/core/http/http-response-error";
import type { ErrorResponseSchema } from "@workspace/core/http/schemas";
import {
  genericErrorMessage,
  toErrorMessage,
} from "@workspace/core/utils/error";
import { Effect, Schema } from "effect";

const httpError = (
  data?: ErrorResponseSchema | Record<string, string> | string,
  status = 401
) =>
  new HttpResponseError({
    status,
    method: "GET",
    url: "https://api.test/things",
    data,
    message: `Request failed with status code ${String(status)}: GET https://api.test/things`,
  });

describe("toErrorMessage", () => {
  it("should read the Error Envelope", () => {
    const error = httpError({ message: "Invalid credentials" });

    const message = toErrorMessage(error);

    expect(message).toBe("Invalid credentials");
  });

  it("should read an error body that is plain text", () => {
    const error = httpError("Service unavailable", 503);

    const message = toErrorMessage(error);

    expect(message).toBe("Service unavailable");
  });

  it("should fall back to the error's message when there is no body", () => {
    const error = httpError();

    const message = toErrorMessage(error);

    expect(message).toBe(error.message);
  });

  it("should fall back to the error's message when the body is not an Error Envelope", () => {
    const error = httpError({ detail: "nope" });

    const message = toErrorMessage(error);

    expect(message).toBe(error.message);
  });

  it.effect(
    "should not leak schema detail when the response shape is wrong",
    () =>
      Effect.gen(function* () {
        const failure = yield* Effect.flip(
          Schema.decodeUnknownEffect(Schema.Struct({ email: Schema.Finite }))({
            email: "nope",
          })
        );

        const message = toErrorMessage(failure);

        expect(failure).toBeInstanceOf(Schema.SchemaError);
        expect(message).toBe(genericErrorMessage);
      })
  );

  it("should read the message of any other Error", () => {
    const error = new Error("Request timed out");

    const message = toErrorMessage(error);

    expect(message).toBe("Request timed out");
  });

  it("should fall back to the generic message when the failure is not an Error", () => {
    const failure = "boom";

    const message = toErrorMessage(failure);

    expect(message).toBe(genericErrorMessage);
  });

  test.prop([fc.string(), fc.integer({ min: 400, max: 599 })])(
    "should always prefer the Error Envelope message",
    (envelopeMessage, status) => {
      const error = httpError({ message: envelopeMessage }, status);

      const message = toErrorMessage(error);

      expect(message).toBe(envelopeMessage);
    }
  );

  test.prop([fc.string()])(
    "should always read the message of a plain Error",
    (errorMessage) => {
      const error = new Error(errorMessage);

      const message = toErrorMessage(error);

      expect(message).toBe(errorMessage);
    }
  );

  test.prop([fc.anything()])(
    "should never throw for a failure that is not an Error",
    (failure) => {
      const message = toErrorMessage(failure);

      expect(message).toBe(genericErrorMessage);
    }
  );
});
