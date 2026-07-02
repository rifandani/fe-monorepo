import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/core/utils/i18n.ts");
const config: NextConfig = withNextIntl({
  experimental: {
    optimizePackageImports: ["@workspace/core"],
    // for e2e testing server side
    testProxy: true,
    turbopackFileSystemCacheForDev: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // for deploying
  output: "standalone",
  reactCompiler: true,
  transpilePackages: [
    "@workspace/core",
    "@t3-oss/env-core",
    "@t3-oss/env-nextjs",
  ],
  // stable since v15.5
  typedRoutes: true,
});
export default config;
