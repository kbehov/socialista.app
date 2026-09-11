import { PAGE_METADATA } from '@/components/landing/content'
import { LandingBento } from '@/components/landing/landing-bento'
import { LandingFaq } from '@/components/landing/landing-faq'
import { LandingFinalCta } from '@/components/landing/landing-final-cta'
import { LandingHero } from '@/components/landing/landing-hero'
import { LandingOutcomes } from '@/components/landing/landing-outcomes'
import { LandingPainPoints } from '@/components/landing/landing-pain-points'
import { LandingPricing } from '@/components/landing/landing-pricing'
import { LandingWorkflow } from '@/components/landing/landing-workflow'
import { PlatformsMarquee } from '@/components/landing/platforms-marquee'
import { StudioIndex } from '@/components/landing/studio-index'
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
      <LandingPainPoints />
      <LandingOutcomes />
      <LandingBento />
      <StudioIndex />
      <LandingWorkflow />
      <LandingPricing products={products} loadError={polarResponse.success ? null : (polarResponse.message ?? 'Failed to load plans')} />
      <LandingFaq />
      <LandingFinalCta />
    </>
  )
}
