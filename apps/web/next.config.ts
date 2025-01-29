import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@workspace/core'],
  // output: 'standalone', // for deploying
  experimental: {
    // testProxy: true, // need to enable for e2e testing
  },
}

export default nextConfig
