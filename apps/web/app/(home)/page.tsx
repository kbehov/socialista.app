import { FeatureChapter } from '@/components/landing/feature-chapter'
import { MEASURE_CHAPTER, PAGE_METADATA, PUBLISH_CHAPTER } from '@/components/landing/content'
import { LandingFaq } from '@/components/landing/landing-faq'
import { LandingFinalCta } from '@/components/landing/landing-final-cta'
import { LandingHero } from '@/components/landing/landing-hero'
import { LandingPricing } from '@/components/landing/landing-pricing'
import { MockupAnalytics } from '@/components/landing/mockups/mockup-analytics'
import { MockupComposer } from '@/components/landing/mockups/mockup-composer'
import { PlatformsMarquee } from '@/components/landing/platforms-marquee'
import { StudioTour } from '@/components/landing/studio-tour'
import { formatProductPrice } from '@/lib/pricing'
import { getPolarProducts } from '@/services/billing.service'
import type { PolarProduct } from '@socialista/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    absolute: PAGE_METADATA.title,
  },
  description: PAGE_METADATA.description,
  openGraph: {
    title: PAGE_METADATA.title,
    description: PAGE_METADATA.description,
    type: 'website',
    siteName: 'Socialista',
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_METADATA.title,
    description: PAGE_METADATA.description,
  },
  alternates: {
    canonical: '/',
  },
}

function buildJsonLd(products: PolarProduct[] | undefined) {
  const offers =
    products && products.length > 0
      ? products.map(product => {
          const pricing = formatProductPrice(product)
          const price = product.prices.find(p => p.priceAmount != null && p.priceAmount > 0)
          return {
            '@type': 'Offer',
            name: product.name,
            price: price?.priceAmount != null ? (price.priceAmount / 100).toFixed(2) : pricing.amount,
            priceCurrency: price?.priceCurrency?.toUpperCase() ?? 'USD',
            availability: 'https://schema.org/InStock',
          }
        })
      : undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Socialista',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: PAGE_METADATA.description,
    ...(offers ? { offers } : {}),
  }
}

export default async function HomePage() {
  const polarResponse = await getPolarProducts({ recurringOnly: true })
  const products = polarResponse.data?.products ?? []
  const jsonLd = buildJsonLd(polarResponse.data?.products)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LandingHero />
      <PlatformsMarquee />
      <StudioTour />
      <FeatureChapter
        id="publish"
        eyebrow={PUBLISH_CHAPTER.eyebrow}
        title={PUBLISH_CHAPTER.title}
        description={PUBLISH_CHAPTER.description}
        points={PUBLISH_CHAPTER.points}
        visual={<MockupComposer />}
      />
      <FeatureChapter
        id="measure"
        eyebrow={MEASURE_CHAPTER.eyebrow}
        title={MEASURE_CHAPTER.title}
        description={MEASURE_CHAPTER.description}
        points={MEASURE_CHAPTER.points}
        visual={<MockupAnalytics />}
        reverse
        alt
      />
      <LandingPricing
        products={products}
        loadError={polarResponse.success ? null : (polarResponse.message ?? 'Failed to load plans')}
      />
      <LandingFaq />
      <LandingFinalCta />
    </>
  )
}
