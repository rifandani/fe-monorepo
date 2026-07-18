import { describe, expect, it } from "vitest";

import { AUTH_COOKIE_NAME } from "./auth";

describe("AUTH_COOKIE_NAME", () => {
  it("matches better-auth secure session cookie", () => {
    expect(AUTH_COOKIE_NAME).toBe("__Secure-better-auth.session_token");
  });
});
