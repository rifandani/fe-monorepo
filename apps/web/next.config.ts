import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/core/i18n/request.ts')

const nextConfig: NextConfig = {
  output: 'standalone', // for deploying
  transpilePackages: [
    '@workspace/core',
    '@t3-oss/env-nextjs',
    '@t3-oss/env-core',
  ],
  experimental: {
    // testProxy: true, // need to enable for e2e testing
  },
}

export default withNextIntl(nextConfig)
