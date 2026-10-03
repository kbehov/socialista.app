import { PRICING_FAQ_ITEMS, PRICING_PAGE } from '@/components/landing/pricing-content'
import { PricingPage } from '@/components/landing/pricing-page'
import { getPolarProducts } from '@/lib/polar/polar-products'
import { createMetadata } from '@/lib/seo/base'
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  howToJsonLd,
  JsonLd,
  softwareApplicationJsonLd,
  webPageJsonLd,
} from '@/lib/seo/json-ld'

const title = 'Socialista pricing — AI UGC, ads, scheduling, and analytics plans'
const description =
  'Compare Socialista plans for AI UGC video, static ads, slideshows, and publishing. Start free without a card, then upgrade for more credits, seats, and connected social accounts.'

export const metadata = createMetadata({
  title,
  description,
  path: '/pricing',
  keywords: [
    'Socialista pricing',
    'AI UGC pricing',
    'social media scheduler pricing',
    'AI video ads cost',
    'UGC generator plans',
  ],
})

export default async function PricingRoutePage() {
  let products: Awaited<ReturnType<typeof getPolarProducts>> = []
  let loadError: string | null = null

  try {
    products = await getPolarProducts({ recurringOnly: true })
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Failed to load plans'
  }

  const heroDescription = `${PRICING_PAGE.hero.description} ${description}`

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ name: title, description: heroDescription, path: '/pricing' }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Pricing', path: '/pricing' },
          ]),
          softwareApplicationJsonLd(products),
          faqPageJsonLd(PRICING_FAQ_ITEMS, '/pricing'),
          howToJsonLd({
            name: PRICING_PAGE.billing.title,
            description: PRICING_PAGE.billing.description,
            steps: PRICING_PAGE.billing.steps,
            path: '/pricing',
          }),
        ]}
      />
      <PricingPage products={products} loadError={loadError} />
    </>
  )
}
