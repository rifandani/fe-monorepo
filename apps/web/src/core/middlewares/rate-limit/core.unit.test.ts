import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { rateLimiter } from "./core";
import type { Store } from "./types";

vi.mock("./store", () => ({
  DbStore: class {
    increment = vi.fn();
  },
}));

const mockRequest = (headers?: HeadersInit): NextRequest =>
  ({
    headers: new Headers(headers),
  }) as NextRequest;

describe("rateLimiter", () => {
  const store: Store = {
    init: vi.fn(),
    increment: vi.fn(),
    decrement: vi.fn(),
    resetKey: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws when store.increment is missing", () => {
    expect(() =>
      rateLimiter({
        keyGenerator: () => "k",
        store: {} as Store,
      })
    ).toThrow("The store is not correctly implemented!");
  });

  it("initializes store and allows requests under the limit", async () => {
    vi.mocked(store.increment).mockResolvedValue({
      totalHits: 2,
      resetTime: new Date(),
    });

    const middleware = rateLimiter({
      keyGenerator: () => "client-1",
      limit: 5,
      store,
      standardHeaders: "draft-6",
    });

    expect(store.init).toHaveBeenCalled();
    const result = await middleware(mockRequest());
    expect(result).toBeUndefined();
    expect(store.increment).toHaveBeenCalledWith("client-1");
    expect(store.decrement).toHaveBeenCalledWith("client-1");
  });

  it("returns 429 handler response when limit exceeded", async () => {
    vi.mocked(store.increment).mockResolvedValue({
      totalHits: 6,
      resetTime: new Date(Date.now() + 10_000),
    });

    const middleware = rateLimiter({
      keyGenerator: () => "client-2",
      limit: 5,
      message: "Too many",
      store,
      standardHeaders: "draft-6",
    });

    const request = mockRequest();
    const response = await middleware(request);

    expect(response).toBeInstanceOf(Response);
    expect(response?.status).toBe(429);
    expect(await response?.text()).toBe("Too many");
    expect(store.decrement).not.toHaveBeenCalled();
    expect(request.headers.get("RateLimit-Limit")).toBe("5");
    expect(request.headers.has("Retry-After")).toBe(true);
  });

  it("sets draft-7 headers when configured", async () => {
    vi.mocked(store.increment).mockResolvedValue({
      totalHits: 1,
      resetTime: new Date(Date.now() + 5000),
    });

    const middleware = rateLimiter({
      keyGenerator: () => "client-3",
      limit: 5,
      store,
      standardHeaders: "draft-7",
    });

    const request = mockRequest();
    await middleware(request);
    expect(request.headers.get("RateLimit")).toContain("limit=5");
  });

  it("supports function limits and JSON error messages", async () => {
    vi.mocked(store.increment).mockResolvedValue({
      totalHits: 3,
      resetTime: new Date(),
    });

    const middleware = rateLimiter({
      keyGenerator: () => "client-4",
      limit: () => 2,
      message: { error: "rate_limited" },
      store,
    });

    const response = await middleware(mockRequest());
    expect(response?.status).toBe(429);
    expect(await response?.json()).toEqual({ error: "rate_limited" });
  });
});
