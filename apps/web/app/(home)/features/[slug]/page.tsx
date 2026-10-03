import { FEATURES, featurePath, getFeature } from '@/components/landing/features'
import { FeatureDetail } from '@/components/landing/features-page'
import { createMetadata } from '@/lib/seo/base'
import { breadcrumbJsonLd, faqPageJsonLd, howToJsonLd, JsonLd, webPageJsonLd } from '@/lib/seo/json-ld'
import { notFound } from 'next/navigation'

type FeaturePageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return FEATURES.map(feature => ({ slug: feature.slug }))
}

export const dynamicParams = false

export async function generateMetadata({ params }: FeaturePageProps) {
  const { slug } = await params
  const feature = getFeature(slug)
  if (!feature) return {}

  return createMetadata({
    title: feature.metaTitle,
    description: feature.metaDescription,
    path: featurePath(feature.slug),
  })
}

export default async function FeaturePage({ params }: FeaturePageProps) {
  const { slug } = await params
  const feature = getFeature(slug)
  if (!feature) notFound()

  const path = featurePath(feature.slug)

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ name: feature.metaTitle, description: feature.metaDescription, path }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Features', path: '/features' },
            { name: feature.name, path },
          ]),
          howToJsonLd({
            name: feature.name,
            description: feature.description,
            path,
            steps: feature.steps.map(step => ({ name: step.title, text: step.description })),
          }),
          faqPageJsonLd(feature.faqs, path),
        ]}
      />
      <FeatureDetail feature={feature} />
    </>
  )
}
