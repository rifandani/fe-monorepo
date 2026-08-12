import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/core/utils/i18n.ts");
const config: NextConfig = withNextIntl({
  // Expose portless's worktree-aware URL to the client bundle (see env.ts).
  env: {
    PORTLESS_URL: process.env.PORTLESS_URL ?? "",
  },
  typedRoutes: true, // stable since v15.5
  reactCompiler: true,
  output: "standalone", // for deploying
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    "@workspace/core",
    "@t3-oss/env-nextjs",
    "@t3-oss/env-core",
  ],
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // logging: {
  //   incomingRequests: true,
  //   fetches: {
  //     fullUrl: true,
  //   },
  // },
  experimental: {
    optimizePackageImports: ["@workspace/core"],
    testProxy: true, // for e2e testing server side
    turbopackFileSystemCacheForDev: true,
  },
});
export default config;
