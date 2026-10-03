import { SITE_CONFIG } from '@/lib/seo/base'
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/manager', '/api/', '/auth/', '/invite/'],
    },
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
  }
}
