import type { NextRequest } from "next/server";
import type * as NextServer from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const securityMiddleware = vi.hoisted(() =>
  vi.fn(() => new Response("secured", { status: 200 }))
);
const createMiddleware = vi.hoisted(() => vi.fn(() => securityMiddleware));

vi.mock("@nosecone/next", () => ({
  createMiddleware,
  defaults: { xFrameOptions: "DENY" },
}));

const nextResponseNext = vi.hoisted(() =>
  vi.fn((init?: { request?: { headers?: Headers } }) => {
    const headers = new Headers();
    return {
      headers,
      requestHeaders: init?.request?.headers,
    };
  })
);

vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<typeof NextServer>();
  return {
    ...actual,
    NextResponse: {
      ...actual.NextResponse,
      next: nextResponseNext,
    },
  };
});

const mockRequest = (headers?: HeadersInit): NextRequest =>
  ({
    headers: new Headers(headers),
  }) as NextRequest;

const loadSut = () => import("./proxy");

describe("proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("exports matcher config that skips api and static assets", async () => {
    const { config } = await loadSut();
    expect(config.matcher).toEqual([
      "/((?!api|_next/static|_next/image|ingest|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|sitemap.xml|robots.txt).*)",
    ]);
  });

  it("creates nosecone middleware with CSP disabled", async () => {
    await loadSut();
    expect(createMiddleware).toHaveBeenCalledWith(
      expect.objectContaining({
        contentSecurityPolicy: false,
        xFrameOptions: "DENY",
      })
    );
  });

  it("forwards request id and returns security middleware response", async () => {
    const { default: proxy } = await loadSut();
    const uuidSpy = vi
      .spyOn(crypto, "randomUUID")
      .mockReturnValue("11111111-1111-1111-1111-111111111111");

    const response = await proxy(mockRequest());

    expect(nextResponseNext).toHaveBeenCalled();
    const init = nextResponseNext.mock.calls[0]?.[0];
    expect(init?.request?.headers?.get("x-request-id")).toBe(
      "11111111-1111-1111-1111-111111111111"
    );
    expect(init?.request?.headers?.get("x-evlog-start")).toMatch(/^\d+$/u);
    expect(securityMiddleware).toHaveBeenCalled();
    expect(response).toBeInstanceOf(Response);
    expect(await response.text()).toBe("secured");

    uuidSpy.mockRestore();
  });

  it("reuses existing x-request-id", async () => {
    const { default: proxy } = await loadSut();
    await proxy(mockRequest({ "x-request-id": "existing-id" }));

    const init = nextResponseNext.mock.calls[0]?.[0];
    expect(init?.request?.headers?.get("x-request-id")).toBe("existing-id");
  });
});
