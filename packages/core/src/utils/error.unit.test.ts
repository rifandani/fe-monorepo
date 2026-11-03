import { HttpResponseError } from "@workspace/core/http/http-response-error";
import type { ErrorResponseSchema } from "@workspace/core/http/schemas";
import { toErrorMessage } from "@workspace/core/utils/error";
import { Effect, Schema } from "effect";
import { describe, expect, it } from "vitest";

/**
 * Tests build the error directly rather than through MSW: this module neither
 * builds nor decodes a request, so ADR-0002's rule of thumb points at the Module
 * Boundary.
 */
const httpError = (
  data?: ErrorResponseSchema | Record<string, string> | string,
  status = 401
) =>
  new HttpResponseError({
    status,
    method: "GET",
    url: "https://api.test/things",
    data,
    message: `Request failed with status code ${status}: GET https://api.test/things`,
  });

describe("toErrorMessage", () => {
  it("reads the Error Envelope", () => {
    expect(toErrorMessage(httpError({ message: "Invalid credentials" }))).toBe(
      "Invalid credentials"
    );
  });

  it("reads an error body that is plain text", () => {
    expect(toErrorMessage(httpError("Service unavailable", 503))).toBe(
      "Service unavailable"
    );
  });

  it("falls back to the error's message when there is no body", () => {
    const error = httpError();

    expect(toErrorMessage(error)).toBe(error.message);
  });

  it("falls back to the error's message when the body is not an Error Envelope", () => {
    const error = httpError({ detail: "nope" });

    expect(toErrorMessage(error)).toBe(error.message);
  });

  it("does not leak schema detail when the response shape is wrong", () => {
    // A SchemaError means the server sent something we cannot read. That is not
    // actionable by the person using the app, and naming the offending field
    // leaks our internals into a toast.
    const failure = Effect.runSync(
      Effect.flip(
        Schema.decodeUnknownEffect(Schema.Struct({ email: Schema.Finite }))({
          email: "nope",
        })
      )
    );

    const message = toErrorMessage(failure);

    expect(failure._tag).toBe("SchemaError");
    expect(message).not.toContain("email");
    expect(message).toBe("Something went wrong. Please try again.");
  });

  it("reads any other Error's message", () => {
    expect(toErrorMessage(new Error("Request timed out"))).toBe(
      "Request timed out"
    );
  });

  it("falls back when something that is not an Error is thrown", () => {
    expect(toErrorMessage("boom")).toBe(
      "Something went wrong. Please try again."
    );
  });
});
