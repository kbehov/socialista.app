import { getIndustry, INDUSTRIES, industryPath } from '@/components/landing/industries'
import { IndustryDetail } from '@/components/landing/industries-page'
import { createMetadata } from '@/lib/seo/base'
import { breadcrumbJsonLd, faqPageJsonLd, JsonLd, webPageJsonLd } from '@/lib/seo/json-ld'
import { notFound } from 'next/navigation'

type IndustryPageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return INDUSTRIES.map(industry => ({ slug: industry.slug }))
}

export const dynamicParams = false

export async function generateMetadata({ params }: IndustryPageProps) {
  const { slug } = await params
  const industry = getIndustry(slug)
  if (!industry) return {}

  return createMetadata({
    title: industry.metaTitle,
    description: industry.metaDescription,
    path: industryPath(industry.slug),
  })
}

export default async function IndustryPage({ params }: IndustryPageProps) {
  const { slug } = await params
  const industry = getIndustry(slug)
  if (!industry) notFound()

  const path = industryPath(industry.slug)

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ name: industry.metaTitle, description: industry.metaDescription, path }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Industries', path: '/industries' },
            { name: industry.name, path },
          ]),
          faqPageJsonLd(industry.faqs, path),
        ]}
      />
      <IndustryDetail industry={industry} />
    </>
  )
}
