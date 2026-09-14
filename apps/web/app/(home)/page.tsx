import { FAQ_ITEMS, PAGE_METADATA } from '@/components/landing/content'
import { LandingAdditionalFeatures } from '@/components/landing/landing-additional-features'
import { LandingAnalytics } from '@/components/landing/landing-analytics'
import { LandingFaq } from '@/components/landing/landing-faq'
import { LandingFinalCta } from '@/components/landing/landing-final-cta'
import { LandingHero } from '@/components/landing/landing-hero'
import { LandingInfluencer } from '@/components/landing/landing-influencer'
import { LandingPlatforms } from '@/components/landing/landing-platforms'
import { LandingPricing } from '@/components/landing/landing-pricing'
import { LandingStudio } from '@/components/landing/landing-studio'
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
      <LandingStudio />
      <LandingInfluencer />
      <LandingPlatforms />
      <LandingAdditionalFeatures />
      {/* <LandingPublish /> */}
      <LandingAnalytics />
      <LandingPricing
        products={products}
        loadError={polarResponse.success ? null : (polarResponse.message ?? 'Failed to load plans')}
      />
      <LandingFaq />
      <LandingFinalCta />
    </>
  )
}
