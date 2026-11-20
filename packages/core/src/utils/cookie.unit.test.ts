import { fc, test } from "@fast-check/vitest";
import { parseSetCookieHeader } from "@workspace/core/utils/cookie";
import { describe, expect, it } from "vitest";

// Helpers

/** An RFC 6265 cookie name: a token, so no `=`, `;`, `,` or space. */
const cookieNameArb = fc.stringMatching(/^[\w!#$%&'*+.^`|~-]+$/u);

/** An RFC 6265 cookie value: no space, `"`, `,`, `;` or `\`. */
const cookieValueArb = fc.stringMatching(
  /^[\w!#$%&'()*+./:<=>?@[\]^`{|}~-]*$/u
);

describe("parseSetCookieHeader", () => {
  it("should parse the name, the value and the common attributes", () => {
    // Arrange
    const header =
      "session=abc123; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=3600";

    // Act
    const cookies = parseSetCookieHeader(header);

    // Assert
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
    // Arrange
    const header = "token=xyz; Expires=Wed, 21 Oct 2015 07:28:00 GMT";

    // Act
    const cookies = parseSetCookieHeader(header);

    // Assert
    expect(cookies.get("token")?.expires).toBeInstanceOf(Date);
  });

  it("should parse Domain and drop an empty SameSite", () => {
    // Arrange
    const header = "id=1; Domain=example.com; SameSite=";

    // Act
    const cookies = parseSetCookieHeader(header);

    // Assert
    expect(cookies.get("id")?.domain).toBe("example.com");
    expect(cookies.get("id")?.samesite).toBeUndefined();
  });

  it("should leave valueless known attributes undefined", () => {
    // Arrange
    const header = "id=1; Max-Age=; Expires=; Domain=; Path=";

    // Act
    const cookies = parseSetCookieHeader(header);

    // Assert
    const cookie = cookies.get("id");
    expect(cookie?.["max-age"]).toBeUndefined();
    expect(cookie?.expires).toBeUndefined();
    expect(cookie?.domain).toBeUndefined();
    expect(cookie?.path).toBeUndefined();
  });

  it("should keep unknown attributes and flag valueless ones as true", () => {
    // Arrange
    const header = "id=1; Priority=High; Partitioned";

    // Act
    const cookies = parseSetCookieHeader(header);

    // Assert
    expect(cookies.get("id")?.priority).toBe("High");
    expect(cookies.get("id")?.partitioned).toBe(true);
  });

  it("should keep an '=' inside a value", () => {
    // Arrange
    const header = "data=a=b; Priority=a=b";

    // Act
    const cookies = parseSetCookieHeader(header);

    // Assert
    expect(cookies.get("data")?.value).toBe("a=b");
    expect(cookies.get("data")?.priority).toBe("a=b");
  });

  it("should skip a nameless entry and keep a valueless one", () => {
    // Arrange
    const header = "=orphan, novalue, ok=1";

    // Act
    const cookies = parseSetCookieHeader(header);

    // Assert
    expect([...cookies.keys()]).toEqual(["novalue", "ok"]);
    expect(cookies.get("novalue")?.value).toBe("");
  });

  it("should parse cookies separated by a comma", () => {
    // Arrange
    const header = "a=1; Path=/, b=2; Secure";

    // Act
    const cookies = parseSetCookieHeader(header);

    // Assert
    expect(cookies.get("a")?.path).toBe("/");
    expect(cookies.get("b")?.secure).toBe(true);
  });

  test.prop([cookieNameArb, cookieValueArb])(
    "should always read back the name and the value of one cookie",
    (name, value) => {
      // Arrange
      const header = `${name}=${value}; Path=/`;

      // Act
      const cookies = parseSetCookieHeader(header);

      // Assert
      expect(cookies.get(name)?.value).toBe(value);
    }
  );

  test.prop([fc.uniqueArray(cookieNameArb, { minLength: 1 })])(
    "should keep one entry for each distinct cookie name",
    (names) => {
      // Arrange
      const header = names.map((name) => `${name}=1; Secure`).join(", ");

      // Act
      const cookies = parseSetCookieHeader(header);

      // Assert
      expect([...cookies.keys()]).toEqual(names);
    }
  );

  test.prop([fc.integer()])(
    "should parse any integer Max-Age as a number",
    (maxAge) => {
      // Arrange
      const header = `id=1; Max-Age=${String(maxAge)}`;

      // Act
      const cookies = parseSetCookieHeader(header);

      // Assert
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
      // Arrange
      const header = `id=1; ${attribute}=${written}`;

      // Act
      const cookies = parseSetCookieHeader(header);

      // Assert
      expect(cookies.get("id")?.samesite).toBe(sameSite);
    }
  );
});
