import type * as ReactQuery from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  isServer: true,
}));

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof ReactQuery>();
  return {
    ...actual,
    get isServer() {
      return mocks.isServer;
    },
  };
});

const query = (status: string, dataUpdatedAt = 1) =>
  ({
    state: { status, data: undefined, dataUpdatedAt, fetchStatus: "idle" },
    meta: undefined,
  }) as never;

describe("getQueryClient", () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.isServer = true;
  });

  it("creates a new client per call on the server", async () => {
    mocks.isServer = true;
    const { getQueryClient } = await import("./client");
    const a = getQueryClient();
    const b = getQueryClient();
    expect(a).not.toBe(b);
    expect(a.getDefaultOptions().queries?.staleTime).toBe(30_000);
  });

  it("reuses a singleton client in the browser", async () => {
    mocks.isServer = false;
    const { getQueryClient } = await import("./client");
    const a = getQueryClient();
    const b = getQueryClient();
    expect(a).toBe(b);
  });

  it("dehydrates pending queries on top of the default predicate", async () => {
    const { getQueryClient } = await import("./client");
    const shouldDehydrateQuery =
      getQueryClient().getDefaultOptions().dehydrate?.shouldDehydrateQuery;

    // success passes the default predicate; pending only passes via the override
    expect(shouldDehydrateQuery?.(query("success"))).toBe(true);
    expect(shouldDehydrateQuery?.(query("pending"))).toBe(true);
    expect(shouldDehydrateQuery?.(query("error"))).toBe(false);
  });
});
