import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/core/utils/i18n.ts')

const config: NextConfig = withNextIntl({
  typedRoutes: true, // stable since v15.5
  reactCompiler: true,
  output: 'standalone', // for deploying
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    '@workspace/core',
    '@t3-oss/env-nextjs',
    '@t3-oss/env-core',
  ],
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // logging: {
  //   incomingRequests: true,
  //   fetches: {
  //     fullUrl: true,
  //   },
  // },
  experimental: {
    turbopackFileSystemCacheForDev: true,
    testProxy: true, // for e2e testing server side
    optimizePackageImports: ['@workspace/core'],
  },
})

export default config
