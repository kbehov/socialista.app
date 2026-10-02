import { COMPARE_COMPETITORS, getCompareCompetitor } from '@/components/landing/compare'
import { CompareDetail } from '@/components/landing/compare-page'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

type CompareSlugPageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return COMPARE_COMPETITORS.map(competitor => ({ slug: competitor.slug }))
}

export const dynamicParams = false

export async function generateMetadata({ params }: CompareSlugPageProps): Promise<Metadata> {
  const { slug } = await params
  const competitor = getCompareCompetitor(slug)
  if (!competitor) return {}

  return {
    title: { absolute: `Socialista vs ${competitor.name}` },
    description: competitor.difference,
    alternates: {
      canonical: `/compare/${competitor.slug}`,
    },
  }
}

export default async function CompareSlugPage({ params }: CompareSlugPageProps) {
  const { slug } = await params
  const competitor = getCompareCompetitor(slug)
  if (!competitor) notFound()

  return <CompareDetail competitor={competitor} />
}
