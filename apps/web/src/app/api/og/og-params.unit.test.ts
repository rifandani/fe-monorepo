import type { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { parseOgRequest, resolveOgLogoKey, rethrowNonError } from "./og-params";

// SAFETY: `parseOgRequest` reads only the url and the color-scheme hint header.
const mockReq = (url: string, colorScheme?: string): NextRequest =>
  ({
    url,
    headers: {
      get: (name: string) =>
        name === "Sec-CH-Prefers-Color-Scheme" ? (colorScheme ?? null) : null,
    },
  }) as NextRequest;

describe("parseOgRequest", () => {
  it("uses defaults", () => {
    expect(parseOgRequest(mockReq("https://web.test/api/og"))).toEqual({
      isLight: false,
      title: "@workspace/web",
      logo: "next",
    });
  });

  it("reads query and color scheme", () => {
    expect(
      parseOgRequest(
        mockReq("https://web.test/api/og?title=Hi&logo=react", "light")
      )
    ).toEqual({
      isLight: true,
      title: "Hi",
      logo: "react",
    });
  });
});

describe("resolveOgLogoKey", () => {
  it("pairs a known brand with the requested color scheme", () => {
    expect(resolveOgLogoKey("next", false)).toBe("next-dark");
    expect(resolveOgLogoKey("next", true)).toBe("next-light");
    expect(resolveOgLogoKey("react", false)).toBe("react-dark");
    expect(resolveOgLogoKey("react", true)).toBe("react-light");
  });

  it("falls back to the null-object key for an unknown or missing brand", () => {
    expect(resolveOgLogoKey("svelte", true)).toBe("none");
    expect(resolveOgLogoKey(null, false)).toBe("none");
  });
});

describe("rethrowNonError", () => {
  it("passes through an Error so the caller can wrap it", () => {
    expect(() => {
      rethrowNonError(new Error("boom"));
    }).not.toThrow();
  });

  it("re-throws a non-Error value untouched", () => {
    const signal = { digest: "NEXT_REDIRECT" };
    expect(() => {
      rethrowNonError(signal);
    }).toThrow(signal);
  });
});
