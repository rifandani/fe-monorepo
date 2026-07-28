import { parseSetCookieHeader } from "@workspace/core/utils/cookie";
import { describe, expect, it } from "vitest";

describe("parseSetCookieHeader", () => {
  it("parses name, value, and common attributes", () => {
    const cookies = parseSetCookieHeader(
      "session=abc123; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=3600"
    );
    const session = cookies.get("session");
    expect(session?.value).toBe("abc123");
    expect(session?.path).toBe("/");
    expect(session?.httponly).toBe(true);
    expect(session?.secure).toBe(true);
    expect(session?.samesite).toBe("lax");
    expect(session?.["max-age"]).toBe(3600);
  });

  it("parses Expires as Date", () => {
    const cookies = parseSetCookieHeader(
      "token=xyz; Expires=Wed, 21 Oct 2015 07:28:00 GMT"
    );
    expect(cookies.get("token")?.expires).toBeInstanceOf(Date);
  });

  it("parses Domain and empty SameSite", () => {
    const cookies = parseSetCookieHeader("id=1; Domain=example.com; SameSite=");
    expect(cookies.get("id")?.domain).toBe("example.com");
    expect(cookies.get("id")?.samesite).toBeUndefined();
  });
});
