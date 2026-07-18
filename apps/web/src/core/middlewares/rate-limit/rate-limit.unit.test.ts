import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { rateLimit } from "./rate-limit";

vi.mock("server-only", () => ({}));

const storeMocks = vi.hoisted(() => ({
  init: vi.fn(),
  increment: vi.fn(),
  decrement: vi.fn(),
  resetKey: vi.fn(),
  get: vi.fn(),
}));

vi.mock("./store", () => ({
  DbStore: class {
    init = storeMocks.init;
    increment = storeMocks.increment;
    decrement = storeMocks.decrement;
    resetKey = storeMocks.resetKey;
    get = storeMocks.get;
  },
}));

const getSession = vi.hoisted(() => vi.fn());

vi.mock("@/auth/utils/auth", () => ({
  auth: {
    api: {
      getSession,
    },
  },
}));

const mockRequest = (headers?: HeadersInit): NextRequest =>
  ({
    headers: new Headers(headers),
  }) as NextRequest;

describe("rateLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storeMocks.increment.mockResolvedValue({
      totalHits: 1,
      resetTime: new Date(),
    });
  });

  it("keys authenticated requests by session id", async () => {
    getSession.mockResolvedValue({
      session: { id: "sess-abc" },
      user: { id: "u1" },
    });

    await rateLimit(mockRequest());

    expect(storeMocks.increment).toHaveBeenCalledWith("session:sess-abc");
    expect(storeMocks.decrement).toHaveBeenCalledWith("session:sess-abc");
  });

  it("keys anonymous requests by client IP", async () => {
    getSession.mockResolvedValue(null);

    await rateLimit(
      mockRequest({
        "x-forwarded-for": "9.9.9.9",
      })
    );

    expect(storeMocks.increment).toHaveBeenCalledWith("ip:9.9.9.9");
  });

  it("falls back to anonymous UUID when IP is missing", async () => {
    getSession.mockResolvedValue(null);

    await rateLimit(mockRequest());

    expect(storeMocks.increment).toHaveBeenCalledWith(
      expect.stringMatching(/^ip:anonymous:[0-9a-f-]+$/iu)
    );
  });
});
