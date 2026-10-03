import type { Metadata } from 'next'

type OpenGraphInput = {
  title: string
  description: string
  /** Path resolved against `metadataBase`, e.g. `/features`. */
  path: string
  type?: 'website' | 'article'
}

export function buildOpenGraph({
  title,
  description,
  path,
  type = 'website',
}: OpenGraphInput): NonNullable<Metadata['openGraph']> {
  return {
    title,
    description,
    type,
    siteName: 'Socialista',
    locale: 'en_US',
    url: path,
  }
}

export function buildTwitter({
  title,
  description,
}: {
  title: string
  description: string
}): NonNullable<Metadata['twitter']> {
  return {
    card: 'summary_large_image',
    title,
    description,
  }
}
