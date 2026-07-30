import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createMetadata,
  createWebPage,
  createWebSite,
  JsonLd,
  jsonLdEscapeInternals,
} from "./seo";

vi.mock("@/core/constants/env", () => ({
  ENV: {
    NEXT_PUBLIC_APP_TITLE: "Test App",
    NEXT_PUBLIC_APP_URL: "https://web.test",
  },
}));

describe("createMetadata", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds default metadata with branded title", () => {
    const metadata = createMetadata({
      title: "Home",
      description: "Welcome",
    });

    expect(metadata.title).toBe("Home | Test App");
    expect(metadata.description).toBe("Welcome");
    expect(metadata.applicationName).toBe("Test App");
    expect(metadata.openGraph).toMatchObject({
      title: "Home | Test App",
      siteName: "Test App",
      url: "https://web.test",
      type: "website",
    });
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      title: "Home | Test App",
    });
  });

  it("overrides openGraph image when image is provided", () => {
    const metadata = createMetadata({
      title: "Post",
      description: "A post",
      image: "https://cdn.test/cover.png",
    });

    expect(metadata.openGraph?.images).toEqual([
      {
        alt: "Post",
        height: 630,
        url: "https://cdn.test/cover.png",
        width: 1200,
      },
    ]);
  });

  it("merges additional metadata properties", () => {
    const metadata = createMetadata({
      title: "About",
      description: "About page",
      category: "Portfolio",
    });

    expect(metadata.category).toBe("Portfolio");
  });
});

describe("createWebSite", () => {
  it("creates a WebSite node with defaults and props", () => {
    const site = createWebSite({
      url: "https://web.test",
      title: "Site",
      description: "Desc",
    });

    // `title` is merged from props; schema-dts WebSite types only `name`.
    expect(site).toMatchObject({
      "@type": "WebSite",
      url: "https://web.test",
      title: "Site",
      description: "Desc",
      name: "@workspace/web",
      inLanguage: ["en-US", "id-ID"],
    });
    expect(String(site["@id"])).toContain("https://web.test#");
  });
});

describe("createWebPage", () => {
  it("creates a WebPage node with defaults and props", () => {
    const page = createWebPage({
      url: "https://web.test/about",
      title: "About",
    });

    expect(page).toMatchObject({
      "@type": "WebPage",
      url: "https://web.test/about",
      title: "About",
      name: "@workspace/web",
    });
    expect(String(page["@id"])).toContain("https://web.test/about#");
  });
});

describe("JsonLd", () => {
  it("serializes the graph into a ld+json script element", () => {
    const graphs = [createWebPage({ url: "https://web.test/about" })];
    const element = JsonLd({ graphs });

    expect(element.type).toBe("script");
    expect(element.props.type).toBe("application/ld+json");
    expect(
      JSON.parse(element.props.dangerouslySetInnerHTML.__html as string)
    ).toMatchObject({
      "@context": "https://schema.org",
      "@graph": [{ "@type": "WebPage", url: "https://web.test/about" }],
    });
  });

  it("escapes characters that would break out of the script tag", () => {
    const graphs = [
      createWebPage({
        url: "https://web.test/about",
        title: "</script><script>alert(1)</script>",
      }),
    ];
    const html = JsonLd({ graphs }).props.dangerouslySetInnerHTML
      .__html as string;

    // No literal tag delimiters survive, so the payload cannot escape the tag.
    expect(html).not.toContain("</script");
    expect(html).not.toContain("<");
    expect(html).not.toContain(">");
    expect(html).toContain("\\u003c");

    // Escaping is transparent: the parsed value is still the original string.
    const parsed = JSON.parse(html) as {
      "@graph": [{ title: string }];
    };
    expect(parsed["@graph"][0].title).toBe(
      "</script><script>alert(1)</script>"
    );
  });

  // End-to-end cover for each character currently escaped. The map/pattern
  // sync invariant itself is asserted structurally in the test below.
  it.each([
    ["<", "less-than"],
    [">", "greater-than"],
    ["\u2028", "U+2028 line separator"],
    ["\u2029", "U+2029 paragraph separator"],
  ])("escapes %s (%s) without leaving a gap", (char) => {
    const title = `a${char}b`;
    const graphs = [createWebPage({ url: "https://web.test/about", title })];
    const html = JsonLd({ graphs }).props.dangerouslySetInnerHTML
      .__html as string;

    expect(html).not.toContain(char);
    expect(html).not.toContain("undefined");

    const parsed = JSON.parse(html) as { "@graph": [{ title: string }] };
    expect(parsed["@graph"][0].title).toBe(title);
  });

  // The pattern and the escape map are declared separately, so a key added to
  // the map without a matching character-class entry would go unescaped. This
  // catches that drift for any future key, not just the ones tabled above.
  it("matches every character the escape map declares", () => {
    const { escapes, pattern } = jsonLdEscapeInternals;
    // Fresh non-global copy: `pattern` is /g and .test() would advance lastIndex.
    const probe = new RegExp(pattern.source, "u");

    for (const char of Object.keys(escapes)) {
      expect(probe.test(char)).toBe(true);
    }
  });
});
