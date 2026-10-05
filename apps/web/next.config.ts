import type { NextConfig } from 'next'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const monorepoRoot = path.join(dirname, '..', '..')
const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://socialista.app').replace(/\/$/, '')
const llmsDescribedBy = `<${appUrl}/llms.txt>; rel="describedby"`

const nextConfig: NextConfig = {
  outputFileTracingRoot: monorepoRoot,
  serverExternalPackages: ['@google-cloud/vision', 'mongoose', '@socialista/db'],
  transpilePackages: ['@socialista/types'],
  allowedDevOrigins: ['dev.socialista.app'],
  images: {
    qualities: [75, 80, 85, 88, 90, 92, 95, 100],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.socialista.app',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
      },
    ],
  },
  turbopack: {
    root: monorepoRoot,
  },
  experimental: {
    proxyClientMaxBodySize: '52mb',
    serverActions: {
      bodySizeLimit: '52mb',
    },
  },
  async headers() {
    const noIndex = [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }]

    return [
      {
        source: '/:path*',
        headers: [{ key: 'Link', value: llmsDescribedBy }],
      },
      { source: '/dashboard', headers: noIndex },
      { source: '/dashboard/:path*', headers: noIndex },
      { source: '/manager', headers: noIndex },
      { source: '/manager/:path*', headers: noIndex },
    ]
  },
}

export default nextConfig
