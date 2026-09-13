import { FAQ_ITEMS, PAGE_METADATA } from '@/components/landing/content'
import { LandingAudience } from '@/components/landing/landing-audience'
import { LandingCompare } from '@/components/landing/landing-compare'
import { LandingContext } from '@/components/landing/landing-context'
import { LandingFaq } from '@/components/landing/landing-faq'
import { LandingFinalCta } from '@/components/landing/landing-final-cta'
import { LandingGallery } from '@/components/landing/landing-gallery'
import { LandingHero } from '@/components/landing/landing-hero'
import { LandingInfluencer } from '@/components/landing/landing-influencer'
import { LandingLoop } from '@/components/landing/landing-loop'
import { LandingMeasure } from '@/components/landing/landing-measure'
import { LandingPlatforms } from '@/components/landing/landing-platforms'
import { LandingPricing } from '@/components/landing/landing-pricing'
import { LandingProblem } from '@/components/landing/landing-problem'
import { LandingPublish } from '@/components/landing/landing-publish'
import { LandingStudio } from '@/components/landing/landing-studio'
import { LandingUgcReel } from '@/components/landing/landing-ugc-reel'
import { LandingWorkflow } from '@/components/landing/landing-workflow'
import { formatProductPrice } from '@/lib/pricing'
import { getPolarProducts } from '@/services/billing.service'
import type { PolarProduct } from '@socialista/types'
import type { Metadata } from 'next'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://socialista.app'

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
    url: '/',
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
            url: APP_URL,
          }
        })
      : undefined

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${APP_URL}/#organization`,
        name: 'Socialista',
        url: APP_URL,
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${APP_URL}/#app`,
        name: 'Socialista',
        url: APP_URL,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        description: PAGE_METADATA.description,
        publisher: { '@id': `${APP_URL}/#organization` },
        ...(offers ? { offers } : {}),
      },
      {
        '@type': 'WebPage',
        '@id': `${APP_URL}/#webpage`,
        url: APP_URL,
        name: PAGE_METADATA.title,
        description: PAGE_METADATA.description,
        isPartOf: { '@id': `${APP_URL}/#organization` },
        about: { '@id': `${APP_URL}/#app` },
      },
      {
        '@type': 'FAQPage',
        '@id': `${APP_URL}/#faq-page`,
        mainEntity: FAQ_ITEMS.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
    ],
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
      <LandingPlatforms />
      <LandingInfluencer />
      <LandingStudio />
      <LandingPublish />
      <LandingProblem />
      <LandingLoop />
      <LandingUgcReel />
      <LandingGallery />
      <LandingContext />
      <LandingMeasure />
      <LandingAudience />
      <LandingWorkflow />
      <LandingCompare />
      <LandingPricing
        products={products}
        loadError={polarResponse.success ? null : (polarResponse.message ?? 'Failed to load plans')}
      />
      <LandingFaq />
      <LandingFinalCta />
    </>
  )
}
