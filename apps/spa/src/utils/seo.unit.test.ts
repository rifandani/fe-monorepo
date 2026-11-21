import { fc, test } from "@fast-check/vitest";
import { describe, expect, it, vi } from "vitest";

import { buildSeoMetadata, ldParams, resolveOgImage } from "./seo";

vi.mock("@/lib/layers/env", () => ({
  EnvConfig: {},
  readEnv: () => "https://spa.test",
}));

vi.mock("@/shared/constants/global", () => ({
  SERVICE_NAME: "Test App",
}));

const rootRelativePathArb = fc
  .array(fc.webSegment())
  .map(
    (segments) => `/${segments.filter((segment) => segment !== "").join("/")}`
  );

describe("resolveOgImage", () => {
  it("should default to the packaged og image", () => {
    const image = resolveOgImage();

    expect(image).toBe("https://spa.test/og.png");
  });

  it("should absolutize a relative path against the app origin", () => {
    const image = resolveOgImage("/custom.png");

    expect(image).toBe("https://spa.test/custom.png");
  });

  it("should leave an absolute url alone", () => {
    const image = resolveOgImage("https://cdn.test/x.png");

    expect(image).toBe("https://cdn.test/x.png");
  });

  test.prop([rootRelativePathArb])(
    "should always put a root-relative path on the app origin",
    (path) => {
      const image = new URL(resolveOgImage(path));

      expect(image.origin).toBe("https://spa.test");
    }
  );

  test.prop([fc.webUrl()])(
    "should never change an absolute url, apart from normalizing it",
    (url) => {
      const image = resolveOgImage(url);

      expect(image).toBe(new URL(url).href);
    }
  );
});

describe("ldParams", () => {
  it("should carry the app identity that both schema.org nodes use", () => {
    expect(ldParams).toEqual({
      author: { name: "Rizeki Rifandani", url: "https://spa.test" },
      inLanguage: ["en-US", "id-ID"],
      name: "Test App",
      url: "https://spa.test",
    });
  });
});

describe("buildSeoMetadata", () => {
  it("should brand the title and mirror it across the og tags", () => {
    const { metadata, title, description } = buildSeoMetadata({
      title: "Home",
      description: "Welcome",
    });

    expect(title).toBe("Home | Test App");
    expect(description).toBe("Welcome");
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
    });
  });

  it("should fall back to the layout title and the template description", () => {
    const { metadata, title } = buildSeoMetadata({});

    expect(title).toBe("Layout | Test App");
    expect(metadata.description).toBe("Bulletproof React.js 19 Template");
  });

  it("should accept a missing params object", () => {
    const { title } = buildSeoMetadata();

    expect(title).toBe("Layout | Test App");
  });

  it("should absolutize a caller-supplied image path", () => {
    const { metadata } = buildSeoMetadata({
      title: "Post",
      ogImage: "/post.png",
    });

    expect(metadata.ogImage).toBe("https://spa.test/post.png");
  });

  it("should leave the structured image form untouched", () => {
    const ogImage = [{ url: "https://cdn.test/a.png", width: 1, height: 2 }];

    const { metadata } = buildSeoMetadata({ title: "Post", ogImage });

    expect(metadata.ogImage).toBe(ogImage);
  });

  test.prop([fc.string(), fc.string()])(
    "should always brand every derived title tag with the app name",
    (pageTitle, pageDescription) => {
      const { metadata } = buildSeoMetadata({
        title: pageTitle,
        description: pageDescription,
      });

      expect(metadata.appleMobileWebAppTitle).toBe(`${pageTitle} | Test App`);
      expect(metadata.ogTitle).toBe(`${pageTitle} | Test App`);
      expect(metadata.ogDescription).toBe(pageDescription);
    }
  );
});
