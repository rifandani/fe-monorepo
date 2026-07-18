import { describe, expect, it, vi } from "vitest";

import {
  setDraft6Headers,
  setDraft7Headers,
  setRetryAfterHeader,
} from "./headers";
import type { RateLimitInfo } from "./types";

describe("rate-limit headers", () => {
  const info: RateLimitInfo = {
    limit: 10,
    remaining: 7,
    used: 3,
    resetTime: new Date(Date.now() + 30_000),
  };

  it("setDraft6Headers sets RateLimit-* fields", () => {
    vi.spyOn(Date, "now").mockReturnValue(1_000_000);
    info.resetTime = new Date(1_000_000 + 30_000);
    const headers = new Headers();

    setDraft6Headers(headers, info, 60_000);

    expect(headers.get("RateLimit-Policy")).toBe("10;w=60");
    expect(headers.get("RateLimit-Limit")).toBe("10");
    expect(headers.get("RateLimit-Remaining")).toBe("7");
    expect(headers.get("RateLimit-Reset")).toBe("30");
  });

  it("setDraft6Headers omits Reset when resetTime is missing", () => {
    const headers = new Headers();
    setDraft6Headers(headers, { ...info, resetTime: undefined }, 60_000);
    expect(headers.has("RateLimit-Reset")).toBe(false);
  });

  it("setDraft7Headers sets combined RateLimit header", () => {
    vi.spyOn(Date, "now").mockReturnValue(1_000_000);
    const headers = new Headers();
    setDraft7Headers(
      headers,
      { ...info, resetTime: new Date(1_000_000 + 45_000) },
      60_000
    );

    expect(headers.get("RateLimit-Policy")).toBe("10;w=60");
    expect(headers.get("RateLimit")).toBe("limit=10, remaining=7, reset=45");
  });

  it("setRetryAfterHeader sets Retry-After from reset window", () => {
    vi.spyOn(Date, "now").mockReturnValue(1_000_000);
    const headers = new Headers();
    setRetryAfterHeader(
      headers,
      { ...info, resetTime: new Date(1_000_000 + 12_000) },
      60_000
    );
    expect(headers.get("Retry-After")).toBe("12");
  });

  it("setRetryAfterHeader uses windowMs when resetTime is missing", () => {
    const headers = new Headers();
    setRetryAfterHeader(headers, { ...info, resetTime: undefined }, 15_000);
    expect(headers.get("Retry-After")).toBe("15");
  });
});
