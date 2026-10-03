import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { formatProductPrice } from '@/lib/pricing'
import { cn } from '@/lib/utils'
import type { PolarProduct } from '@socialista/types'
import { ArrowUpRight, Check } from 'lucide-react'
import Link from 'next/link'

import { FAQ_SECTION } from './content'
import { FadeIn } from './fade-in'
import { LandingFinalCta } from './landing-final-cta'
import { LandingPricing } from './landing-pricing'
import {
  landingBodySm,
  landingContentGap,
  landingEyebrow,
  landingGlassLight,
  landingH3,
  landingInsetPanel,
  landingNavLink,
  landingSectionLead,
  landingSectionTitle,
  landingSectionTitleAccentSerif,
  landingSupportingSectionY,
} from './landing-classes'
import { PRICING_FAQ_ITEMS, PRICING_PAGE } from './pricing-content'
import { Section } from './section'

type PricingPageProps = {
  products: PolarProduct[]
  loadError?: string | null
}

function PlanSnapshotList({ products }: { products: PolarProduct[] }) {
  if (products.length === 0) return null

  return (
    <ul
      className={cn(
        landingGlassLight,
        'mx-auto mt-8 max-w-2xl divide-y divide-[color-mix(in_srgb,var(--landing-ink)_6%,transparent)] rounded-[var(--landing-panel-radius)] px-5 py-1 sm:px-6',
      )}
    >
      {products.map(product => {
        const price = formatProductPrice(product)
        const priceLine = price.intervalLabel
          ? `${price.amount} ${price.intervalLabel}`
          : price.amount

        return (
          <li
            key={product.id}
            className="flex flex-col gap-0.5 py-4 text-center sm:flex-row sm:items-baseline sm:justify-between sm:text-left"
          >
            <span className="font-medium tracking-[-0.02em] text-[var(--landing-ink)]">{product.name}</span>
            <span className="text-[0.875rem] text-[var(--landing-muted)]">
              {priceLine}
              {price.billingNote ? ` · ${price.billingNote}` : null}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

export function PricingPage({ products, loadError = null }: PricingPageProps) {
  const hasProducts = products.length > 0 && !loadError
  const { hero, included, billing, compare } = PRICING_PAGE

  return (
    <>
      <Section labelledBy="pricing-page-heading">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <p className={cn(landingEyebrow, 'mb-4 sm:mb-5')}>{hero.eyebrow}</p>
            <h1 id="pricing-page-heading" className={landingSectionTitle}>
              {hero.title}{' '}
              <span className={landingSectionTitleAccentSerif}>{hero.titleAccent}</span>
            </h1>
            <p className={cn(landingSectionLead, 'mt-4 sm:mt-5')}>{hero.description}</p>
          </div>
          {hasProducts ? <PlanSnapshotList products={products} /> : null}
        </FadeIn>
      </Section>

      <LandingPricing
        products={products}
        loadError={loadError}
        showIntro={false}
        landingDivider
        sectionId="plans"
      />

      <Section id="included" landingDivider labelledBy="included-heading" className={landingSupportingSectionY}>
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="included-heading" className={landingSectionTitle}>
              {included.title}
            </h2>
            <p className={cn(landingSectionLead, 'mt-4 sm:mt-5')}>{included.description}</p>
          </div>
          <ul className={cn('mt-10 grid gap-4 sm:mt-12 md:grid-cols-3', landingContentGap)}>
            {included.groups.map(group => (
              <li
                key={group.title}
                className={cn(landingGlassLight, 'rounded-[var(--landing-panel-radius)] p-5 sm:p-6')}
              >
                <h3 className={cn(landingH3, 'text-[var(--landing-ink)]')}>{group.title}</h3>
                <ul className="mt-4 space-y-3">
                  {group.items.map(item => (
                    <li key={item} className="flex gap-2.5 text-left">
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-[var(--landing-muted)]"
                        strokeWidth={2.5}
                        aria-hidden="true"
                      />
                      <span className={cn(landingBodySm, 'text-[var(--landing-muted)]')}>{item}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </FadeIn>
      </Section>

      <Section id="billing" landingDivider labelledBy="billing-heading">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="billing-heading" className={landingSectionTitle}>
              {billing.title}
            </h2>
            <p className={cn(landingSectionLead, 'mt-4 sm:mt-5')}>{billing.description}</p>
          </div>
          <ol className={cn('mx-auto mt-10 max-w-2xl sm:mt-12', landingContentGap)}>
            {billing.steps.map((step, index) => (
              <li
                key={step.name}
                className={cn(landingInsetPanel, 'flex gap-4 p-5 sm:gap-5 sm:p-6')}
              >
                <span
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklch,var(--accent-orange)_12%,transparent)] text-[0.8125rem] font-semibold text-[var(--landing-ink)]"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <div className="min-w-0 text-left">
                  <h3 className={cn(landingH3, 'text-[var(--landing-ink)]')}>{step.name}</h3>
                  <p className={cn(landingBodySm, 'mt-2 text-[var(--landing-muted)]')}>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </FadeIn>
      </Section>

      <Section id="pricing-faq" landingDivider labelledBy="pricing-faq-heading">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <p className={cn(landingEyebrow, 'mb-4 sm:mb-5')}>FAQ</p>
            <h2 id="pricing-faq-heading" className={landingSectionTitle}>
              Pricing questions
            </h2>
            <p className={cn(landingSectionLead, 'mt-4 sm:mt-5')}>
              Billing, credits, seats, and cancellations—answered before you check out.
            </p>
          </div>
          <Accordion
            type="single"
            collapsible
            className={cn(
              landingGlassLight,
              landingContentGap,
              'mx-auto mt-10 max-w-2xl overflow-hidden rounded-[var(--landing-panel-radius)] px-1 sm:mt-12 sm:px-2',
              'divide-y divide-[color-mix(in_srgb,var(--landing-ink)_6%,transparent)]',
            )}
          >
            {PRICING_FAQ_ITEMS.map((item, index) => (
              <AccordionItem key={item.question} value={`pricing-faq-${index}`} className="border-none">
                <AccordionTrigger
                  className={cn(
                    landingH3,
                    'px-4 py-5 text-left text-[var(--landing-ink)] hover:no-underline sm:px-5',
                  )}
                >
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className={cn(landingBodySm, 'px-4 pb-5 text-[var(--landing-muted)] sm:px-5')}>
                  <p>{item.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <p className="mt-8 text-center text-sm text-[var(--landing-muted)]">
            {FAQ_SECTION.contactLead}{' '}
            <a href={FAQ_SECTION.contactHref} className={cn(landingNavLink, 'font-medium text-[var(--landing-ink)]')}>
              {FAQ_SECTION.contactCta}
            </a>
          </p>
        </FadeIn>
      </Section>

      <Section id="compare-pricing" landingDivider labelledBy="compare-pricing-heading">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="compare-pricing-heading" className={landingSectionTitle}>
              {compare.title}
            </h2>
            <p className={cn(landingSectionLead, 'mt-4 sm:mt-5')}>{compare.description}</p>
            <Link
              href={compare.href}
              className={cn(
                landingNavLink,
                'mt-6 inline-flex items-center gap-0.5 text-sm font-medium text-[var(--landing-ink)]',
              )}
            >
              {compare.cta}
              <ArrowUpRight className="size-3.5 opacity-70" strokeWidth={2} aria-hidden="true" />
            </Link>
          </div>
        </FadeIn>
      </Section>

      <LandingFinalCta />
    </>
  )
}
