import { COMPARE_COMPETITORS } from '@/components/landing/compare'
import { FEATURES } from '@/components/landing/features'
import { INDUSTRIES } from '@/components/landing/industries'
import { absoluteUrl } from '@/lib/seo/base'
import type { MetadataRoute } from 'next'

const HUB_PATHS = ['/features', '/industries', '/compare', '/pricing', '/about', '/privacy', '/terms'] as const
const LLM_PATHS = ['/llms.txt', '/llms-full.txt'] as const

function sitemapPriority(path: string): number {
  if (path === '/') return 1
  if (HUB_PATHS.includes(path as (typeof HUB_PATHS)[number])) return 0.8
  if (LLM_PATHS.includes(path as (typeof LLM_PATHS)[number])) return 0.5
  return 0.6
}

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    '/',
    ...HUB_PATHS,
    ...LLM_PATHS,
    ...FEATURES.map(feature => `/features/${feature.slug}`),
    ...INDUSTRIES.map(industry => `/industries/${industry.slug}`),
    ...COMPARE_COMPETITORS.map(competitor => `/compare/${competitor.slug}`),
  ]

  const lastModified = new Date()

  return paths.map(path => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency: path === '/' || LLM_PATHS.includes(path as (typeof LLM_PATHS)[number]) ? 'weekly' : 'monthly',
    priority: sitemapPriority(path),
  }))
}
