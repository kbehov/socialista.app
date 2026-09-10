'use client'

import { PricingCard } from '@/components/cards/pricing-card'
import { Button } from '@/components/ui/button'
import type { PolarProduct } from '@socialista/types'
import Link from 'next/link'

import { PRICING_SECTION } from './content'
import { FadeIn } from './fade-in'
import styles from './landing.module.css'
import { Section } from './section'
import { SectionHeader } from './section-header'

type LandingPricingProps = {
  products: PolarProduct[]
  loadError?: string | null
}

function pickFeaturedIndex(products: PolarProduct[]): number {
  if (products.length === 0) return -1
  if (products.length >= 3) return 1
  const firstPaid = products.findIndex(p => {
    const price = p.prices[0]
    return price && price.amountType !== 'free' && (price.priceAmount ?? 0) > 0
  })
  return firstPaid >= 0 ? firstPaid : 0
}

export function LandingPricing({ products, loadError = null }: LandingPricingProps) {
  const featuredIndex = pickFeaturedIndex(products)
  const hasProducts = products.length > 0 && !loadError

  return (
    <Section id="pricing" border alt>
      <FadeIn>
        <SectionHeader
          eyebrow={PRICING_SECTION.eyebrow}
          title={hasProducts ? PRICING_SECTION.title : PRICING_SECTION.fallbackTitle}
          description={hasProducts ? PRICING_SECTION.description : PRICING_SECTION.fallbackDescription}
          align="center"
        />
      </FadeIn>

      {hasProducts ? (
        <FadeIn delay={0.06} className={`${styles.pricingGrid} mt-12`}>
          {products.map((product, index) => (
            <PricingCard
              key={product.id}
              product={product}
              isFeatured={index === featuredIndex}
              ctaLabel="Get started"
              checkoutUrl={`/auth/signup?plan=${encodeURIComponent(product.id)}`}
            />
          ))}
        </FadeIn>
      ) : (
        <FadeIn delay={0.06} className="mt-10 flex justify-center">
          <Button asChild size="lg">
            <Link href="/auth/signup">Get started</Link>
          </Button>
        </FadeIn>
      )}
    </Section>
  )
}
