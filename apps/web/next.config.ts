import path from "node:path";

import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/core/utils/i18n.ts");

/**
 * Self-hosting (Docker / plain Node) opts in explicitly via BUILD_STANDALONE=1.
 *
 * Vercel must NOT build with `output: "standalone"` — it builds Next natively
 * and runs its own output tracing, so standalone output is both unnecessary and
 * unsupported there.
 * @see https://nextjs.org/docs/app/guides/self-hosting
 */
const { BUILD_STANDALONE, BUILD_ID, DEPLOYMENT_ID } = process.env;

const config: NextConfig = {
  // Expose portless's worktree-aware URL to the client bundle (see env.ts).
  env: {
    PORTLESS_URL: process.env.PORTLESS_URL ?? "",
  },
  typedRoutes: true, // stable since v15.5
  reactCompiler: true,
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    "@workspace/core",
    "@t3-oss/env-nextjs",
    "@t3-oss/env-core",
  ],
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["@workspace/core"],
    testProxy: true, // for e2e testing server side
  },
};

/**
 * Version-skew protection for rolling self-hosted deploys: stamps assets with
 * `?dpl=` and hard-navigates on mismatch. Vercel handles this itself, so we only
 * opt in when the platform hands us an explicit id.
 */
if (DEPLOYMENT_ID) {
  config.deploymentId = DEPLOYMENT_ID;
}

/**
 * Every container serving one release must agree on the build id, or clients hit
 * missing chunks and "Failed to find Server Action" errors.
 */
if (BUILD_ID) {
  config.generateBuildId = () => Promise.resolve(BUILD_ID);
}

if (BUILD_STANDALONE === "1") {
  config.output = "standalone";
  /**
   * Monorepo: trace from the workspace root so hoisted node_modules land in
   * `.next/standalone` alongside the app.
   */
  config.outputFileTracingRoot = path.join(import.meta.dirname, "../..");
  /**
   * Streaming / Suspense behind a buffering reverse proxy (nginx) needs
   * buffering explicitly disabled, or responses arrive in one shot.
   */
  config.headers = () =>
    Promise.resolve([
      {
        source: "/:path*{/}?",
        headers: [{ key: "X-Accel-Buffering", value: "no" }],
      },
    ]);
}

export default withNextIntl(config);
