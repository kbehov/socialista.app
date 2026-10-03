import { FAQ_ITEMS } from '@/components/landing/content'
import { LandingCompare } from '@/components/landing/landing-compare'
import { LandingFaq } from '@/components/landing/landing-faq'
import { LandingFinalCta } from '@/components/landing/landing-final-cta'
import { LandingHero } from '@/components/landing/landing-hero'
import { LandingLogoCloud } from '@/components/landing/landing-logo-cloud'
import { LandingFeaturesMarquee } from '@/components/landing/landing-features-marquee'
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
import { createMetadata, SITE_CONFIG } from '@/lib/seo/base'
import { faqPageJsonLd, JsonLd, organizationJsonLd, softwareApplicationJsonLd, webPageJsonLd } from '@/lib/seo/json-ld'
import { getPolarProducts } from '@/services/billing.service'

export const metadata = createMetadata({ path: '/' })

export default async function HomePage() {
  const polarResponse = await getPolarProducts({ recurringOnly: true })
  const products = polarResponse.data?.products ?? []

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          softwareApplicationJsonLd(products),
          webPageJsonLd({
            name: SITE_CONFIG.title,
            description: SITE_CONFIG.description,
            path: '/',
          }),
          faqPageJsonLd(FAQ_ITEMS, '/'),
        ]}
      />
      <div className="flex flex-col">
        <LandingHero />
        <LandingLogoCloud />
        <LandingUgcAds />
        <LandingFeaturesMarquee />
        <LandingPlatforms />
        <LandingInfluencer />
        <LandingStaticAds />
        <LandingSlideshows />
        <LandingImageTemplates />
        <LandingVideos />
        <LandingShipIt />
        <LandingCompare />
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
