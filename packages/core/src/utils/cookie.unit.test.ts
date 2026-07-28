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

  it("treats valueless attributes as undefined", () => {
    const cookies = parseSetCookieHeader(
      "id=1; Max-Age=; Expires=; Domain=; Path="
    );
    const cookie = cookies.get("id");
    expect(cookie?.["max-age"]).toBeUndefined();
    expect(cookie?.expires).toBeUndefined();
    expect(cookie?.domain).toBeUndefined();
    expect(cookie?.path).toBeUndefined();
  });

  it("keeps unknown attributes, flagging valueless ones as true", () => {
    const cookies = parseSetCookieHeader("id=1; Priority=High; Partitioned");
    expect(cookies.get("id")?.priority).toBe("High");
    expect(cookies.get("id")?.partitioned).toBe(true);
  });

  it("keeps '=' inside values", () => {
    const cookies = parseSetCookieHeader("data=a=b; Priority=a=b");
    expect(cookies.get("data")?.value).toBe("a=b");
    expect(cookies.get("data")?.priority).toBe("a=b");
  });

  it("skips entries with no name and keeps valueless ones", () => {
    const cookies = parseSetCookieHeader("=orphan, novalue, ok=1");
    expect(cookies.size).toBe(2);
    expect(cookies.get("novalue")?.value).toBe("");
    expect(cookies.get("ok")?.value).toBe("1");
  });

  it("parses multiple comma-separated cookies", () => {
    const cookies = parseSetCookieHeader("a=1; Path=/, b=2; Secure");
    expect(cookies.get("a")?.path).toBe("/");
    expect(cookies.get("b")?.secure).toBe(true);
  });
});
