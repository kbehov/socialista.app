'use client'

import { PricingCard } from '@/components/cards/pricing-card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { PolarProduct } from '@socialista/types'
import {
  ArrowUpRight,
  Building2,
  Check,
  CreditCard,
  RefreshCw,
  ShieldCheck,
  Users,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

import { HERO, PRICING_SECTION } from './content'
import { FadeIn } from './fade-in'
import {
  landingContentGap,
  landingCtaPrimaryLg,
  landingNavLink,
  landingPricingCardSurface,
  landingSectionLead,
  landingSectionPricing,
} from './landing-classes'
import { Section } from './section'
import { LandingSectionIntro } from './section-header'

type LandingPricingProps = {
  products: PolarProduct[]
  loadError?: string | null
}

const TRUST_ICONS: Record<(typeof PRICING_SECTION.trust)[number], LucideIcon> = {
  'Secure checkout': ShieldCheck,
  'Cancel anytime': RefreshCw,
  'No card to start': CreditCard,
  'You own your creatives': Check,
  'Shared team workspaces': Users,
  'Instant studio access': Zap,
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

function pricingGridClass(count: number) {
  return cn(
    'grid items-stretch gap-6 sm:gap-7 lg:gap-8',
    count === 1 && 'mx-auto max-w-md',
    count === 2 && 'md:mx-auto md:max-w-4xl md:grid-cols-2 md:gap-8',
    count === 3 && 'lg:mx-auto lg:max-w-6xl lg:grid-cols-3 lg:items-center lg:gap-7 xl:gap-9',
    count >= 4 && 'md:grid-cols-2 xl:grid-cols-4 xl:gap-7',
  )
}

function PricingEnterpriseCallout() {
  const { enterprise } = PRICING_SECTION

  return (
    <div
      className={cn(
        landingPricingCardSurface,
        'mx-auto flex w-full max-w-3xl flex-col items-center justify-between gap-3 rounded-xl border border-[color-mix(in_srgb,var(--landing-stone)_52%,var(--border))] px-4 py-3 sm:flex-row sm:gap-4 sm:px-5',
      )}
    >
      <p className="flex min-w-0 items-start gap-2 text-center text-[0.8125rem] leading-5 sm:items-center sm:text-left sm:text-sm sm:leading-snug">
        <Building2
          className="mt-0.5 size-4 shrink-0 text-[var(--landing-muted)] sm:mt-0"
          strokeWidth={1.75}
          aria-hidden="true"
        />
        <span>
          <span className="font-semibold tracking-[-0.02em] text-[var(--landing-ink)]">
            {enterprise.eyebrow}.
          </span>
          <span className="text-[var(--landing-muted)]"> {enterprise.description}</span>
        </span>
      </p>
      <Link
        href={enterprise.href}
        className={cn(
          landingNavLink,
          'inline-flex shrink-0 items-center gap-0.5 text-sm font-medium text-[var(--landing-ink)]',
        )}
      >
        {enterprise.cta}
        <ArrowUpRight className="size-3.5 opacity-70" strokeWidth={2} aria-hidden="true" />
      </Link>
    </div>
  )
}

function PricingTrustIndicators({ className }: { className?: string }) {
  return (
    <ul
      className={cn(
        'grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3',
        className,
      )}
    >
      {PRICING_SECTION.trust.map(label => {
        const Icon = TRUST_ICONS[label]
        return (
          <li
            key={label}
            className={cn(
              landingPricingCardSurface,
              'flex items-center gap-2.5 rounded-xl border border-[color-mix(in_srgb,var(--landing-stone)_50%,var(--border))] px-4 py-3',
              'text-[0.8125rem] font-medium tracking-[-0.015em] text-[var(--landing-ink)]',
            )}
          >
            <span
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklch,var(--accent-orange)_16%,white)] text-[var(--landing-ink)]"
              aria-hidden="true"
            >
              <Icon className="size-3.5" strokeWidth={2} />
            </span>
            {label}
          </li>
        )
      })}
    </ul>
  )
}

export function LandingPricing({ products, loadError = null }: LandingPricingProps) {
  const featuredIndex = pickFeaturedIndex(products)
  const hasProducts = products.length > 0 && !loadError
  const emphasizeFeatured = products.length >= 3 && featuredIndex >= 0

  return (
    <Section id="pricing" landingDivider alt containerClassName={landingSectionPricing}>
      <FadeIn>
        {hasProducts ? (
          <LandingSectionIntro
            titleId="pricing-heading"
            title={PRICING_SECTION.title}
            titleAccent={PRICING_SECTION.titleAccent}
            description={PRICING_SECTION.description}
          />
        ) : (
          <LandingSectionIntro
            titleId="pricing-heading"
            title={PRICING_SECTION.fallbackTitle}
            description={PRICING_SECTION.fallbackDescription}
          />
        )}
      </FadeIn>

      {hasProducts ? (
        <>
          <div className={cn(landingContentGap, pricingGridClass(products.length))}>
            {products.map((product, index) => {
              const isFeatured = index === featuredIndex
              return (
                <FadeIn
                  key={product.id}
                  delay={0.05 + index * 0.05}
                  className={cn(
                    'flex min-w-0',
                    emphasizeFeatured && isFeatured && 'lg:relative lg:z-10 lg:-translate-y-1.5',
                  )}
                >
                  <PricingCard
                    product={product}
                    isFeatured={isFeatured}
                    tierIndex={index}
                    ctaLabel={PRICING_SECTION.cta}
                    checkoutUrl={`/auth/signup?plan=${encodeURIComponent(product.id)}`}
                    className="w-full"
                  />
                </FadeIn>
              )
            })}
          </div>

          <FadeIn delay={0.12} className={cn(landingContentGap, 'mt-10 sm:mt-12')}>
            <PricingTrustIndicators />
          </FadeIn>

          <FadeIn delay={0.14} className={cn(landingContentGap, 'mt-8 sm:mt-9')}>
            <PricingEnterpriseCallout />
          </FadeIn>

          <FadeIn delay={0.16}>
            <p
              className={cn(
                landingSectionLead,
                'mt-8 text-center text-[0.9375rem] sm:mt-9',
              )}
            >
              {PRICING_SECTION.footnote}
            </p>
          </FadeIn>
        </>
      ) : (
        <FadeIn delay={0.06} className={cn(landingContentGap, 'flex flex-col items-center gap-8')}>
          <PricingTrustIndicators className="w-full max-w-3xl" />
          <PricingEnterpriseCallout />
          <Button asChild size="lg" className={landingCtaPrimaryLg}>
            <Link href="/auth/signup">{HERO.primaryCta}</Link>
          </Button>
        </FadeIn>
      )}
    </Section>
  )
}
