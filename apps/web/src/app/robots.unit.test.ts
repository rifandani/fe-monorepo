import { describe, expect, it, vi } from "vitest";

// `robots.ts` resolves its host once, at module scope, so each branch needs a
// fresh module registry rather than a re-invocation.
const importRobots = async () => {
  vi.resetModules();
  const mod = await import("./robots");
  return mod.default;
};

describe("robots", () => {
  it("points the sitemap at the local host outside production", async () => {
    vi.stubEnv("NODE_ENV", "development");

    const robots = await importRobots();

    expect(robots().sitemap).toBe(
      "https://web.fe-monorepo.localhost/sitemap.xml"
    );
  });

  it("points the sitemap at the production host in production", async () => {
    vi.stubEnv("NODE_ENV", "production");

    const robots = await importRobots();

    expect(robots().sitemap).toBe("https://web.com/sitemap.xml");
  });

  it("allows every user agent at the root", async () => {
    const robots = await importRobots();

    expect(robots().rules).toEqual({ allow: "/", userAgent: "*" });
  });
});
