import { COMPARE_COMPETITORS, comparePath, getCompareCompetitor } from '@/components/landing/compare'
import { CompareDetail } from '@/components/landing/compare-page'
import { createMetadata } from '@/lib/seo/base'
import { breadcrumbJsonLd, faqPageJsonLd, JsonLd, webPageJsonLd } from '@/lib/seo/json-ld'
import { notFound } from 'next/navigation'

type CompareSlugPageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return COMPARE_COMPETITORS.map(competitor => ({ slug: competitor.slug }))
}

export const dynamicParams = false

export async function generateMetadata({ params }: CompareSlugPageProps) {
  const { slug } = await params
  const competitor = getCompareCompetitor(slug)
  if (!competitor) return {}

  return createMetadata({
    title: competitor.metaTitle,
    description: competitor.metaDescription,
    path: comparePath(competitor.slug),
    keywords: [
      `Socialista vs ${competitor.name}`,
      competitor.category,
      'AI UGC ads',
      'social media studio',
    ],
  })
}

export default async function CompareSlugPage({ params }: CompareSlugPageProps) {
  const { slug } = await params
  const competitor = getCompareCompetitor(slug)
  if (!competitor) notFound()

  const path = comparePath(competitor.slug)
  const name = competitor.metaTitle

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ name, description: competitor.metaDescription, path }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Compare', path: '/compare' },
            { name: `Socialista vs ${competitor.name}`, path },
          ]),
          faqPageJsonLd(competitor.faqs, path),
        ]}
      />
      <CompareDetail competitor={competitor} />
    </>
  )
}
