import { fc, test } from "@fast-check/vitest";
import { parseSetCookieHeader } from "@workspace/core/utils/cookie";
import { describe, expect, it } from "vitest";

const cookieNameArb = fc.stringMatching(/^[\w!#$%&'*+.^`|~-]+$/u);

const cookieValueArb = fc.stringMatching(
  /^[\w!#$%&'()*+./:<=>?@[\]^`{|}~-]*$/u
);

describe("parseSetCookieHeader", () => {
  it("should parse the name, the value and the common attributes", () => {
    const header =
      "session=abc123; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=3600";

    const cookies = parseSetCookieHeader(header);

    expect(cookies.get("session")).toEqual({
      value: "abc123",
      path: "/",
      httponly: true,
      secure: true,
      samesite: "lax",
      "max-age": 3600,
    });
  });

  it("should parse Expires as a Date", () => {
    const header = "token=xyz; Expires=Wed, 21 Oct 2015 07:28:00 GMT";

    const cookies = parseSetCookieHeader(header);

    expect(cookies.get("token")?.expires).toBeInstanceOf(Date);
  });

  it("should parse Domain and drop an empty SameSite", () => {
    const header = "id=1; Domain=example.com; SameSite=";

    const cookies = parseSetCookieHeader(header);

    expect(cookies.get("id")?.domain).toBe("example.com");
    expect(cookies.get("id")?.samesite).toBeUndefined();
  });

  it("should leave valueless known attributes undefined", () => {
    const header = "id=1; Max-Age=; Expires=; Domain=; Path=";

    const cookies = parseSetCookieHeader(header);

    const cookie = cookies.get("id");
    expect(cookie?.["max-age"]).toBeUndefined();
    expect(cookie?.expires).toBeUndefined();
    expect(cookie?.domain).toBeUndefined();
    expect(cookie?.path).toBeUndefined();
  });

  it("should keep unknown attributes and flag valueless ones as true", () => {
    const header = "id=1; Priority=High; Partitioned";

    const cookies = parseSetCookieHeader(header);

    expect(cookies.get("id")?.priority).toBe("High");
    expect(cookies.get("id")?.partitioned).toBe(true);
  });

  it("should keep an '=' inside a value", () => {
    const header = "data=a=b; Priority=a=b";

    const cookies = parseSetCookieHeader(header);

    expect(cookies.get("data")?.value).toBe("a=b");
    expect(cookies.get("data")?.priority).toBe("a=b");
  });

  it("should skip a nameless entry and keep a valueless one", () => {
    const header = "=orphan, novalue, ok=1";

    const cookies = parseSetCookieHeader(header);

    expect([...cookies.keys()]).toEqual(["novalue", "ok"]);
    expect(cookies.get("novalue")?.value).toBe("");
  });

  it("should parse cookies separated by a comma", () => {
    const header = "a=1; Path=/, b=2; Secure";

    const cookies = parseSetCookieHeader(header);

    expect(cookies.get("a")?.path).toBe("/");
    expect(cookies.get("b")?.secure).toBe(true);
  });

  test.prop([cookieNameArb, cookieValueArb])(
    "should always read back the name and the value of one cookie",
    (name, value) => {
      const header = `${name}=${value}; Path=/`;

      const cookies = parseSetCookieHeader(header);

      expect(cookies.get(name)?.value).toBe(value);
    }
  );

  test.prop([fc.uniqueArray(cookieNameArb, { minLength: 1 })])(
    "should keep one entry for each distinct cookie name",
    (names) => {
      const header = names.map((name) => `${name}=1; Secure`).join(", ");

      const cookies = parseSetCookieHeader(header);

      expect([...cookies.keys()]).toEqual(names);
    }
  );

  test.prop([fc.integer()])(
    "should parse any integer Max-Age as a number",
    (maxAge) => {
      const header = `id=1; Max-Age=${String(maxAge)}`;

      const cookies = parseSetCookieHeader(header);

      expect(cookies.get("id")?.["max-age"]).toBe(maxAge);
    }
  );

  test.prop([
    fc.mixedCase(fc.constant("samesite")),
    fc
      .constantFrom("strict", "lax", "none")
      .chain((sameSite) =>
        fc.tuple(fc.constant(sameSite), fc.mixedCase(fc.constant(sameSite)))
      ),
  ])(
    "should read SameSite whatever the letter case",
    (attribute, [sameSite, written]) => {
      const header = `id=1; ${attribute}=${written}`;

      const cookies = parseSetCookieHeader(header);

      expect(cookies.get("id")?.samesite).toBe(sameSite);
    }
  );
});
