import { COMPARE_COMPETITORS } from '@/components/landing/compare'
import { FEATURES } from '@/components/landing/features'
import { INDUSTRIES } from '@/components/landing/industries'
import { absoluteUrl } from '@/lib/seo/base'
import type { MetadataRoute } from 'next'

const HUB_PATHS = ['/features', '/industries', '/compare', '/pricing'] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    '/',
    ...HUB_PATHS,
    ...FEATURES.map(feature => `/features/${feature.slug}`),
    ...INDUSTRIES.map(industry => `/industries/${industry.slug}`),
    ...COMPARE_COMPETITORS.map(competitor => `/compare/${competitor.slug}`),
  ]

  return paths.map(path => ({
    url: absoluteUrl(path),
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : HUB_PATHS.includes(path as (typeof HUB_PATHS)[number]) ? 0.8 : 0.6,
  }))
}
