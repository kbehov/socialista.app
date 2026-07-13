import type { NextConfig } from 'next'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const monorepoRoot = path.join(dirname, '..', '..')

const nextConfig: NextConfig = {
  outputFileTracingRoot: monorepoRoot,
  serverExternalPackages: ['@google-cloud/vision'],
  transpilePackages: ['@socialista/types'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  turbopack: {
    root: monorepoRoot,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '52mb', // matches the 50 MB video upload limit + overhead
    },
  },
}

export default nextConfig
