import type { NextConfig } from 'next'
import withBundleAnalyzer from '@next/bundle-analyzer'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/core/utils/i18n.ts')

// eslint-disable-next-line import/no-mutable-exports
let config: NextConfig = withNextIntl({
  typedRoutes: true, // stable since v15.5
  eslint: {
    ignoreDuringBuilds: true,
  },
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
    testProxy: true, // for e2e testing server side
    optimizePackageImports: ['@workspace/core'],
  },
})

function withAnalyzer(sourceConfig: NextConfig): NextConfig {
  return withBundleAnalyzer()(sourceConfig)
}

if (process.env.ANALYZE === 'true') {
  config = withAnalyzer(withNextIntl(config))
}

export default config
