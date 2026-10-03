import type { Metadata } from 'next'

import { iconsMetadata } from './favicon'
import { buildOpenGraph, buildTwitter } from './open-graph'

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://socialista.app').replace(/\/$/, '')

export const SITE_CONFIG = {
  name: 'Socialista',
  url: APP_URL,
  title: 'Socialista — Realistic AI UGC ads, no creators needed',
  description:
    'Create realistic UGC video ads with AI creators, plus static ads, slideshows, and videos. Publish and schedule to every channel from one studio.',
  locale: 'en_US',
  email: 'sales@socialista.app',
  logoPath: '/socialista-logo.webp',
  keywords: [
    'AI UGC ads',
    'AI creator',
    'UGC video generator',
    'social media scheduler',
    'social media content studio',
  ],
} as const

/** Absolute URL for a site path. `/` resolves to the origin with no trailing slash. */
export function absoluteUrl(path = '/'): string {
  if (path === '/') return SITE_CONFIG.url
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${SITE_CONFIG.url}${normalized}`
}

type PageMetadataInput = {
  title?: string
  description?: string
  /** Canonical path, e.g. `/features/ai-influencers`. Omit for the root layout defaults. */
  path?: string
  keywords?: readonly string[]
}

/**
 * Site-wide defaults when called with no page fields.
 * Page metadata (absolute title, canonical, Open Graph, Twitter) when `path` or copy is passed.
 */
export function createMetadata(input: PageMetadataInput = {}): Metadata {
  const { title, description, path, keywords } = input
  const isPage = path != null || title != null || description != null

  if (!isPage) {
    return {
      metadataBase: new URL(SITE_CONFIG.url),
      applicationName: SITE_CONFIG.name,
      title: {
        default: SITE_CONFIG.name,
        template: `%s · ${SITE_CONFIG.name}`,
      },
      description: SITE_CONFIG.description,
      keywords: [...SITE_CONFIG.keywords],
      icons: iconsMetadata,
      openGraph: buildOpenGraph({
        title: SITE_CONFIG.title,
        description: SITE_CONFIG.description,
        path: '/',
      }),
      twitter: buildTwitter({
        title: SITE_CONFIG.title,
        description: SITE_CONFIG.description,
      }),
    }
  }

  const pageTitle = title ?? SITE_CONFIG.title
  const pageDescription = description ?? SITE_CONFIG.description
  const pagePath = path ?? '/'

  return {
    title: { absolute: pageTitle },
    description: pageDescription,
    ...(keywords ? { keywords: [...keywords] } : {}),
    alternates: { canonical: pagePath },
    openGraph: buildOpenGraph({
      title: pageTitle,
      description: pageDescription,
      path: pagePath,
    }),
    twitter: buildTwitter({
      title: pageTitle,
      description: pageDescription,
    }),
  }
}
