import { fc, test } from "@fast-check/vitest";
import { MutationObserver, QueryClient } from "@tanstack/react-query";
import type { UseMutationOptions } from "@tanstack/react-query";
import { Failures } from "@workspace/core/http/failure";
import type { FailurePresenter } from "@workspace/core/http/failure";
import { HttpResponseError } from "@workspace/core/http/http-response-error";
import {
  idempotentMutation,
  isUnknownOutcome,
  notIdempotentMutation,
  toMutationFailure,
  withRetrySafety,
} from "@workspace/core/http/retry-safety";
import type { ErrorResponseSchema } from "@workspace/core/http/schemas";
import { makeTestQueryClient } from "@workspace/core/utils/test-query-client";
import { Cause } from "effect";
import { describe, expect, it } from "vitest";

const recordingPresenter = (shown: string[]): FailurePresenter => ({
  translate: (key) => key,
  showError: (message) => {
    shown.push(message);
  },
  reportDefect: () => {},
});

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

describe("toMutationFailure", () => {
  it("should be an Unknown Outcome for a timeout of a mutation that is not idempotent", () => {
    const error = new Cause.TimeoutError();

    const failure = toMutationFailure(error, notIdempotentMutation.meta);

    expect(failure).toEqual(Failures.Expected({ key: "errorUnknownOutcome" }));
  });

  it("should be a usual timeout for a timeout of an idempotent mutation", () => {
    const error = new Cause.TimeoutError();

    const failure = toMutationFailure(error, idempotentMutation.meta);

    expect(failure).toEqual(Failures.Expected({ key: "errorTimeout" }));
  });

  it("should be a defect when the mutation throws a bug", () => {
    const error = new TypeError("Cannot read properties of undefined");

    const failure = toMutationFailure(error, notIdempotentMutation.meta);

    expect(failure).toEqual(Failures.Defect({ cause: error }));
  });

  test.prop([fc.string({ minLength: 1 })])(
    "should always keep the server message when the server answered",
    (serverMessage) => {
      const error = loginResponseError(400, { message: serverMessage });

      const failure = toMutationFailure(error, notIdempotentMutation.meta);

      expect(failure).toEqual(
        Failures.Expected({ key: "errorRequestRejected", serverMessage })
      );
    }
  );
});

const retryingClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { networkMode: "always", retry: 2, retryDelay: 0 },
    },
  });

const timingOutMutation = (
  retrySafety: typeof notIdempotentMutation | typeof idempotentMutation
) => {
  let attempts = 0;

  const owned: UseMutationOptions = {
    ...retrySafety,
    mutationFn: async () => {
      attempts += 1;

      return await Promise.reject(new Cause.TimeoutError());
    },
  };

  return { owned, attempts: () => attempts };
};

describe("withRetrySafety", () => {
  it("should show the unknown outcome for a timeout of a mutation that is not idempotent", async () => {
    const shown: string[] = [];
    const { owned } = timingOutMutation(notIdempotentMutation);

    const observer = new MutationObserver(
      makeTestQueryClient(),
      withRetrySafety(owned, undefined, recordingPresenter(shown))
    );

    await observer.mutate().catch(() => {});

    expect(shown).toEqual(["errorUnknownOutcome"]);
  });

  it("should call the caller onError after it shows the message", async () => {
    const calls: string[] = [];
    const { owned } = timingOutMutation(notIdempotentMutation);

    const observer = new MutationObserver(
      makeTestQueryClient(),
      withRetrySafety(
        owned,
        {
          onError: () => {
            calls.push("caller");
          },
        },
        {
          ...recordingPresenter([]),
          showError: () => {
            calls.push("show");
          },
        }
      )
    );

    await observer.mutate().catch(() => {});

    expect(calls).toEqual(["show", "caller"]);
  });

  it("should keep the declared retry safety when a caller sends retry and meta", async () => {
    const shown: string[] = [];
    const { owned, attempts } = timingOutMutation(notIdempotentMutation);

    const untypedCaller: UseMutationOptions<unknown, unknown> = {
      retry: 3,
      meta: idempotentMutation.meta,
    };

    const observer = new MutationObserver(
      retryingClient(),
      withRetrySafety(owned, untypedCaller, recordingPresenter(shown))
    );

    await observer.mutate().catch(() => {});

    expect(attempts()).toBe(1);
    expect(shown).toEqual(["errorUnknownOutcome"]);
  });

  it("should keep the client retry policy for an idempotent mutation", async () => {
    const { owned, attempts } = timingOutMutation(idempotentMutation);

    const untypedCaller: UseMutationOptions<unknown, unknown> = {
      retry: 0,
    };

    const observer = new MutationObserver(
      retryingClient(),
      withRetrySafety(owned, untypedCaller, recordingPresenter([]))
    );

    await observer.mutate().catch(() => {});

    expect(attempts()).toBe(3);
  });

  it("should report a defect and show the generic message", async () => {
    const shown: string[] = [];
    const reported: unknown[] = [];
    const bug = new TypeError("Cannot read properties of undefined");

    const observer = new MutationObserver(
      makeTestQueryClient(),
      withRetrySafety(
        {
          ...notIdempotentMutation,
          mutationFn: async () => {
            await Promise.reject(bug);
          },
        },
        undefined,
        {
          ...recordingPresenter(shown),
          reportDefect: (cause) => {
            reported.push(cause);
          },
        }
      )
    );

    await observer.mutate().catch(() => {});

    expect({ shown, reported }).toEqual({
      shown: ["errorGeneric"],
      reported: [bug],
    });
  });
});
