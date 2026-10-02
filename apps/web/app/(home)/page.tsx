import { FAQ_ITEMS, PAGE_METADATA } from '@/components/landing/content'
import { LandingFaq } from '@/components/landing/landing-faq'
import { LandingFinalCta } from '@/components/landing/landing-final-cta'
import { LandingHero } from '@/components/landing/landing-hero'
import { LandingImageTemplates } from '@/components/landing/landing-image-templates'
import { LandingInfluencer } from '@/components/landing/landing-influencer'
import { LandingModels } from '@/components/landing/landing-models'
import { LandingPlatforms } from '@/components/landing/landing-platforms'
import { LandingPricing } from '@/components/landing/landing-pricing'
import { LandingSlideshows } from '@/components/landing/landing-slideshows'
import { LandingStaticAds } from '@/components/landing/landing-static-ads'
import { LandingTestimonials } from '@/components/landing/landing-testimonials'
import { LandingUgcAds } from '@/components/landing/landing-ugc-ads'
import { LandingVideos } from '@/components/landing/landing-videos'
import { LandingShipIt } from '@/components/landing/landing-workflow'
import { StickyMobileCta } from '@/components/landing/sticky-mobile-cta'
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
      ? products.flatMap(product => {
          const pricing = formatProductPrice(product)
          const price = product.prices.find(p => p.priceAmount != null && p.priceAmount > 0)
          const amount =
            price?.priceAmount != null ? (price.priceAmount / 100).toFixed(2) : pricing.isFree ? '0.00' : null
          // schema.org Offer.price must be numeric — skip custom / contact-us plans
          if (amount == null) return []
          return [
            {
              '@type': 'Offer',
              name: product.name,
              price: amount,
              priceCurrency: price?.priceCurrency?.toUpperCase() ?? 'USD',
              availability: 'https://schema.org/InStock',
              url: APP_URL,
            },
          ]
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
        ...(offers && offers.length > 0 ? { offers } : {}),
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
      <div className="flex flex-col">
        <LandingHero />
        <LandingUgcAds />
        {/* <LandingHowItWorks /> */}
        <LandingPlatforms />
        <LandingInfluencer />
        <LandingStaticAds />
        <LandingSlideshows />
        <LandingImageTemplates />
        <LandingVideos />
        <LandingShipIt />
        <LandingTestimonials />
        <LandingModels />
        <LandingPricing
          products={products}
          loadError={polarResponse.success ? null : (polarResponse.message ?? 'Failed to load plans')}
        />
        <LandingFaq />
        <LandingFinalCta />
      </div>
      <StickyMobileCta />
    </>
  )
}
