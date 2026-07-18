import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMetadata, createWebPage, createWebSite } from "./seo";

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
