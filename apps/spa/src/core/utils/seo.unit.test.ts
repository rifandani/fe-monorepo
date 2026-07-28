import { describe, expect, it, vi } from "vitest";

import { buildSeoMetadata, ldParams, resolveOgImage } from "./seo";

vi.mock("@/core/constants/env", () => ({
  ENV: {
    VITE_APP_URL: "https://spa.test",
  },
}));

vi.mock("@/core/constants/global", () => ({
  SERVICE_NAME: "Test App",
}));

describe("resolveOgImage", () => {
  it("defaults to the packaged og image", () => {
    expect(resolveOgImage()).toBe("https://spa.test/og.png");
  });

  it("absolutizes a relative path against the app origin", () => {
    expect(resolveOgImage("/custom.png")).toBe("https://spa.test/custom.png");
  });

  it("leaves an already absolute url alone", () => {
    expect(resolveOgImage("https://cdn.test/x.png")).toBe(
      "https://cdn.test/x.png"
    );
  });
});

describe("ldParams", () => {
  it("carries the app identity used by both schema.org nodes", () => {
    expect(ldParams).toEqual({
      author: { name: "Rizeki Rifandani", url: "https://spa.test" },
      inLanguage: ["en-US", "id-ID"],
      name: "Test App",
      url: "https://spa.test",
    });
  });
});

describe("buildSeoMetadata", () => {
  it("brands the title and mirrors it across og and twitter", () => {
    const { metadata, title, description } = buildSeoMetadata({
      title: "Home",
      description: "Welcome",
    });

    expect(title).toBe("Home | Test App");
    expect(description).toBe("Welcome");
    // `<title>` keeps the caller's raw value because the merge lets `params`
    // win, while every derived title tag carries the branded suffix.
    expect(metadata).toMatchObject({
      title: "Home",
      description: "Welcome",
      appleMobileWebAppTitle: "Home | Test App",
      ogTitle: "Home | Test App",
      ogDescription: "Welcome",
      ogUrl: "https://spa.test",
      ogImage: "https://spa.test/og.png",
      ogImageHeight: 441,
      ogImageWidth: 843,
      twitterTitle: "Home | Test App",
      twitterDescription: "Welcome",
      twitterSite: "@https://spa.test",
      twitterImage: "https://spa.test/og.png",
    });
  });

  it("falls back to the layout title and template description", () => {
    const { metadata, title } = buildSeoMetadata({});

    expect(title).toBe("Layout | Test App");
    expect(metadata.description).toBe("Bulletproof React.js 19 Template");
  });

  it("handles a missing params object", () => {
    expect(buildSeoMetadata(undefined as never).title).toBe(
      "Layout | Test App"
    );
  });

  it("absolutizes caller-supplied image paths", () => {
    const { metadata } = buildSeoMetadata({
      title: "Post",
      ogImage: "/post.png",
      twitterImage: "/post-tw.png",
    });

    expect(metadata.ogImage).toBe("https://spa.test/post.png");
    expect(metadata.twitterImage).toBe("https://spa.test/post-tw.png");
  });

  it("leaves the structured image form untouched", () => {
    const ogImage = [{ url: "https://cdn.test/a.png", width: 1, height: 2 }];
    const twitterImage = [{ url: "https://cdn.test/b.png" }];
    const { metadata } = buildSeoMetadata({
      title: "Post",
      ogImage,
      twitterImage,
    });

    expect(metadata.ogImage).toBe(ogImage);
    expect(metadata.twitterImage).toBe(twitterImage);
  });
});
