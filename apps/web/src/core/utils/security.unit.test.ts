import { afterEach, describe, expect, it, vi } from "vitest";

import { isBot, sanitizeInput } from "./security";

describe("isBot", () => {
  it("detects common bot user agents", () => {
    expect(isBot("Googlebot/2.1")).toBe(true);
    expect(isBot("Mozilla crawl")).toBe(true);
    expect(isBot("slurp")).toBe(true);
    expect(isBot("spider")).toBe(true);
    expect(isBot("mediapartners-google")).toBe(true);
  });

  it("returns false for normal browsers", () => {
    expect(
      isBot(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
      )
    ).toBe(false);
  });
});

describe("sanitizeInput", () => {
  it("escapes HTML special characters in node", () => {
    expect(sanitizeInput(`<script>alert("x")</script>`)).toBe(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;&#x2F;script&gt;"
    );
  });

  it("escapes ampersand, quotes, and backticks", () => {
    expect(sanitizeInput(`a&b'c\`d`)).toBe("a&amp;b&#x27;c&#x60;d");
  });

  it("returns unchanged safe strings", () => {
    expect(sanitizeInput("hello world")).toBe("hello world");
  });

  describe("in a browser-like environment", () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("escapes via a detached DOM element", () => {
      let html = "";
      const element = {
        get innerHTML() {
          return html;
        },
        get textContent() {
          return html;
        },
        // stand in for the browser's own text -> HTML escaping
        set textContent(value: string) {
          html = value.replaceAll("<", "&lt;");
        },
      };
      const createElement = vi.fn(() => element);
      vi.stubGlobal("document", { createElement });

      expect(sanitizeInput("<b>")).toBe("&lt;b>");
      expect(createElement).toHaveBeenCalledWith("div");
    });
  });
});
