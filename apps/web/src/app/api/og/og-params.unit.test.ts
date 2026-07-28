import type { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { parseOgRequest } from "./og-params";

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
