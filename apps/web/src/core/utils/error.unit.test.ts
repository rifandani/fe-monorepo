import type { Span } from "@opentelemetry/api";
import { SpanStatusCode } from "@opentelemetry/api";
import { HTTPError, TimeoutError } from "ky";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { serverErrorMapper } from "./error";

vi.mock("server-only", () => ({}));

const log = vi.hoisted(() => ({
  error: vi.fn(),
  info: vi.fn(),
}));

vi.mock("@/core/utils/evlog", () => ({ log }));

/** The parsed error body ky hangs off `HTTPError.data`, schema-shaped or not. */
type HttpErrorBody = Record<string, string>;
interface HttpErrorWithData {
  data?: HttpErrorBody;
}

const makeHttpError = (data?: HttpErrorBody) => {
  const request = new Request("https://api.example.com/x");
  const response = new Response(null, { status: 400 });
  // SAFETY: `HTTPError` wants ky's full internal request context; the mapper
  // under test reads only `data` and `message` off the error it builds.
  const error = new HTTPError(response, request, {
    request,
    response,
    options: {},
    state: {},
  } as never);
  if (data !== undefined) {
    // SAFETY: ky assigns the parsed body to `data` at runtime; the published
    // `HTTPError` type does not declare it.
    (error as HttpErrorWithData).data = data;
  }
  return error;
};

describe("serverErrorMapper", () => {
  const span = {
    recordException: vi.fn(),
    setStatus: vi.fn(),
  };
  // SAFETY: `serverErrorMapper` calls only `recordException` and `setStatus`, so
  // the stub covers its whole use of the span.
  const spanStub: Span = span as never;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps HTTPError with parsed error body", () => {
    const error = makeHttpError({ message: "invalid credentials" });
    const result = serverErrorMapper(error, spanStub);

    expect(result).toBe("invalid credentials");
    expect(log.error).toHaveBeenCalledWith(
      expect.objectContaining({
        area: "serverErrorMapper",
        kind: "HTTPError",
        response: { message: "invalid credentials" },
      })
    );
    expect(span.recordException).toHaveBeenCalled();
    expect(span.setStatus).toHaveBeenCalledWith({
      code: SpanStatusCode.ERROR,
      message: error.message,
    });
  });

  it("maps HTTPError without parseable body to err.message", () => {
    const error = makeHttpError({ not: "schema" });
    const result = serverErrorMapper(error);

    expect(result).toBe(error.message);
  });

  it("maps TimeoutError", () => {
    const error = new TimeoutError(new Request("https://api.example.com/x"));
    const result = serverErrorMapper(error, spanStub);

    expect(result).toBe(error.message);
    expect(log.error).toHaveBeenCalledWith(
      expect.objectContaining({
        area: "serverErrorMapper",
        kind: "TimeoutError",
      })
    );
  });

  it("maps ZodError with prettified message", () => {
    const parsed = z.object({ email: z.email() }).safeParse({ email: "nope" });
    expect(parsed.success).toBe(false);
    if (parsed.success) {
      return;
    }

    const result = serverErrorMapper(parsed.error, spanStub);
    expect(result).toContain("email");
    expect(log.error).toHaveBeenCalledWith(
      expect.objectContaining({
        area: "serverErrorMapper",
        kind: "ZodError",
      })
    );
  });

  it("maps unknown errors", () => {
    const error = new Error("unexpected");
    const result = serverErrorMapper(error, spanStub);

    expect(result).toBe("unexpected");
    expect(log.error).toHaveBeenCalledWith(
      expect.objectContaining({
        area: "serverErrorMapper",
        kind: "UnknownError",
      })
    );
  });
});
