import type { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

import { getAllowedHosts, isAllowedOrigin, parseIngestBody } from "./ingest";

vi.mock("@/core/constants/env", () => ({
  ENV: { NEXT_PUBLIC_APP_URL: "https://web.localhost" },
}));

vi.mock("@/core/utils/evlog", () => ({
  createError: (opts: { message: string }) => {
    const error = new Error(opts.message);
    Object.assign(error, opts);
    return error;
  },
}));

const mockRequest = (init: {
  origin?: string | null;
  host?: string;
}): NextRequest => {
  const headers = new Headers();
  if (init.origin) {
    headers.set("origin", init.origin);
  }
  if (init.host) {
    headers.set("host", init.host);
  }
  return { headers } as NextRequest;
};

describe("ingest", () => {
  it("getAllowedHosts includes app url host", () => {
    const hosts = getAllowedHosts(mockRequest({ host: "web.localhost" }));
    expect(hosts.has("web.localhost")).toBe(true);
  });

  it("isAllowedOrigin accepts matching hosts", () => {
    const req = mockRequest({ host: "web.localhost" });
    expect(isAllowedOrigin(req, "https://web.localhost")).toBe(true);
  });

  it("parseIngestBody accepts valid payloads", () => {
    expect(
      parseIngestBody({ timestamp: 1, level: "info", message: "hi" })
    ).toMatchObject({ level: "info" });
  });

  it("parseIngestBody rejects invalid bodies", () => {
    expect(() => parseIngestBody(null)).toThrow("Invalid request body");
    expect(() => parseIngestBody({ level: "info" })).toThrow(
      "Missing timestamp"
    );
    expect(() => parseIngestBody({ timestamp: 1, level: "nope" })).toThrow(
      "Invalid level"
    );
  });
});
