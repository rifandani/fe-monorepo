import { toErrorMessage } from "@workspace/core/utils/error";
import { HTTPError } from "ky";
import type { NormalizedOptions } from "ky";
import { describe, expect, it } from "vitest";
import { z } from "zod";

/**
 * ky populates `data` itself, eagerly, before the error is thrown. Tests build
 * the error directly rather than through MSW: this module neither builds nor
 * parses a request, so ADR-0002's rule of thumb points at the Module Boundary.
 */
const httpError = (data?: string | Record<string, string>, status = 401) => {
  // SAFETY: `toErrorMessage` reads only `data` and `message`; ky's normalized
  // options are untouched by this module, so an empty object stands in.
  const options = {} as NormalizedOptions;
  const error = new HTTPError(
    new Response(null, { status }),
    new Request("https://api.test/things"),
    options
  );
  error.data = data;
  return error;
};

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

  it("falls back to ky's message when there is no body", () => {
    const error = httpError();

    expect(toErrorMessage(error)).toBe(error.message);
  });

  it("falls back to ky's message when the body is not an Error Envelope", () => {
    const error = httpError({ detail: "nope" });

    expect(toErrorMessage(error)).toBe(error.message);
  });

  it("does not leak schema detail when the response shape is wrong", () => {
    // A ZodError means the server sent something we cannot read. That is not
    // actionable by the person using the app, and naming the offending field
    // leaks our internals into a toast.
    const parsed = z.object({ email: z.email() }).safeParse({ email: "nope" });
    const error = parsed.success ? null : parsed.error;

    const message = toErrorMessage(error);

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
