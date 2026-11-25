import { fc, test } from "@fast-check/vitest";
import { HttpResponseError } from "@workspace/core/http/http-response-error";
import {
  idempotentMutation,
  isUnknownOutcome,
  notIdempotentMutation,
  toMutationErrorMessage,
  unknownOutcomeMessage,
} from "@workspace/core/http/retry-safety";
import type { ErrorResponseSchema } from "@workspace/core/http/schemas";
import { toErrorMessage } from "@workspace/core/utils/error";
import { Cause } from "effect";
import { describe, expect, it } from "vitest";

const loginResponseError = (
  status: number,
  data: ErrorResponseSchema | undefined
) =>
  new HttpResponseError({
    status,
    method: "POST",
    url: "https://api.test/auth/login",
    data,
    message: `Request failed with status code ${String(status)}`,
  });

describe("notIdempotentMutation", () => {
  it("should turn off retries and declare the mutation not idempotent", () => {
    const options = { ...notIdempotentMutation };

    expect(options).toEqual({
      meta: { retrySafety: "not-idempotent" },
      retry: 0,
    });
  });
});

describe("idempotentMutation", () => {
  it("should declare the mutation idempotent and keep the client retry policy", () => {
    const options = { ...idempotentMutation };

    expect(options).toEqual({ meta: { retrySafety: "idempotent" } });
  });
});

describe("isUnknownOutcome", () => {
  it("should be true for a timeout of a mutation that is not idempotent", () => {
    const error = new Cause.TimeoutError();

    const unknown = isUnknownOutcome(error, notIdempotentMutation.meta);

    expect(unknown).toBe(true);
  });

  it("should be false for a timeout of an idempotent mutation", () => {
    const error = new Cause.TimeoutError();

    const unknown = isUnknownOutcome(error, idempotentMutation.meta);

    expect(unknown).toBe(false);
  });

  it("should be false for a timeout of a mutation that declares nothing", () => {
    const error = new Cause.TimeoutError();

    const unknown = isUnknownOutcome(error, undefined);

    expect(unknown).toBe(false);
  });

  test.prop([fc.integer({ min: 400, max: 599 })])(
    "should never be true when the server answered with an error status",
    (status) => {
      const error = loginResponseError(status, undefined);

      const unknown = isUnknownOutcome(error, notIdempotentMutation.meta);

      expect(unknown).toBe(false);
    }
  );
});

describe("toMutationErrorMessage", () => {
  it("should say the outcome is unknown for a timeout of a mutation that is not idempotent", () => {
    const error = new Cause.TimeoutError();

    const message = toMutationErrorMessage(error, notIdempotentMutation.meta);

    expect(message).toBe(unknownOutcomeMessage);
  });

  it("should give the usual error message for a timeout of an idempotent mutation", () => {
    const error = new Cause.TimeoutError();

    const message = toMutationErrorMessage(error, idempotentMutation.meta);

    expect(message).toBe(toErrorMessage(error));
  });

  test.prop([fc.string({ minLength: 1 })])(
    "should always give the server message when the server answered",
    (serverMessage) => {
      const error = loginResponseError(400, { message: serverMessage });

      const message = toMutationErrorMessage(error, notIdempotentMutation.meta);

      expect(message).toBe(serverMessage);
    }
  );
});
