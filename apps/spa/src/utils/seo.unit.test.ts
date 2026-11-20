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

// Helpers

/**
 * A root-relative path such as `/blog/post.png`. Empty segments are dropped:
 * a path that starts with `//` is protocol-relative, so it names another host.
 */
const rootRelativePathArb = fc
  .array(fc.webSegment())
  .map(
    (segments) => `/${segments.filter((segment) => segment !== "").join("/")}`
  );

describe("resolveOgImage", () => {
  it("should default to the packaged og image", () => {
    // Act
    const image = resolveOgImage();

    // Assert
    expect(image).toBe("https://spa.test/og.png");
  });

  it("should absolutize a relative path against the app origin", () => {
    // Act
    const image = resolveOgImage("/custom.png");

    // Assert
    expect(image).toBe("https://spa.test/custom.png");
  });

  it("should leave an absolute url alone", () => {
    // Act
    const image = resolveOgImage("https://cdn.test/x.png");

    // Assert
    expect(image).toBe("https://cdn.test/x.png");
  });

  test.prop([rootRelativePathArb])(
    "should always put a root-relative path on the app origin",
    (path) => {
      // Act
      const image = new URL(resolveOgImage(path));

      // Assert
      expect(image.origin).toBe("https://spa.test");
    }
  );

  test.prop([fc.webUrl()])(
    "should never change an absolute url, apart from normalizing it",
    (url) => {
      // Act
      const image = resolveOgImage(url);

      // Assert
      expect(image).toBe(new URL(url).href);
    }
  );
});

describe("ldParams", () => {
  it("should carry the app identity that both schema.org nodes use", () => {
    // Assert
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
    // Act
    const { metadata, title, description } = buildSeoMetadata({
      title: "Home",
      description: "Welcome",
    });

    // Assert
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
    });
  });

  it("should fall back to the layout title and the template description", () => {
    // Act
    const { metadata, title } = buildSeoMetadata({});

    // Assert
    expect(title).toBe("Layout | Test App");
    expect(metadata.description).toBe("Bulletproof React.js 19 Template");
  });

  it("should accept a missing params object", () => {
    // Act
    const { title } = buildSeoMetadata();

    // Assert
    expect(title).toBe("Layout | Test App");
  });

  it("should absolutize a caller-supplied image path", () => {
    // Act
    const { metadata } = buildSeoMetadata({
      title: "Post",
      ogImage: "/post.png",
    });

    // Assert
    expect(metadata.ogImage).toBe("https://spa.test/post.png");
  });

  it("should leave the structured image form untouched", () => {
    // Arrange
    const ogImage = [{ url: "https://cdn.test/a.png", width: 1, height: 2 }];

    // Act
    const { metadata } = buildSeoMetadata({ title: "Post", ogImage });

    // Assert
    expect(metadata.ogImage).toBe(ogImage);
  });

  test.prop([fc.string(), fc.string()])(
    "should always brand every derived title tag with the app name",
    (pageTitle, pageDescription) => {
      // Act
      const { metadata } = buildSeoMetadata({
        title: pageTitle,
        description: pageDescription,
      });

      // Assert
      expect(metadata.appleMobileWebAppTitle).toBe(`${pageTitle} | Test App`);
      expect(metadata.ogTitle).toBe(`${pageTitle} | Test App`);
      expect(metadata.ogDescription).toBe(pageDescription);
    }
  );
});
