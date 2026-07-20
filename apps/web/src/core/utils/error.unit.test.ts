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

const makeHttpError = (data?: unknown) => {
  const request = new Request("https://api.example.com/x");
  const response = new Response(null, { status: 400 });
  const error = new HTTPError(response, request, {
    request,
    response,
    options: {},
    state: {},
  } as never);
  if (data !== undefined) {
    (error as { data?: unknown }).data = data;
  }
  return error;
};

describe("serverErrorMapper", () => {
  const span = {
    recordException: vi.fn(),
    setStatus: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps HTTPError with parsed error body", () => {
    const error = makeHttpError({ message: "invalid credentials" });
    const result = serverErrorMapper(error, span as never);

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
    const result = serverErrorMapper(error, span as never);

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

    const result = serverErrorMapper(parsed.error, span as never);
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
    const result = serverErrorMapper(error, span as never);

    expect(result).toBe("unexpected");
    expect(log.error).toHaveBeenCalledWith(
      expect.objectContaining({
        area: "serverErrorMapper",
        kind: "UnknownError",
      })
    );
  });
});
