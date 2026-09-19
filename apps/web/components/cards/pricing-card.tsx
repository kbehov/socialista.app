'use client'

import { Button } from '@/components/ui/button'
import {
  formatProductPrice,
  getDefaultCtaLabel,
  getDefaultPricingFootnote,
  getProductFeatureLines,
  type ProductFeatureLine,
} from '@/lib/pricing'
import { cn } from '@/lib/utils'
import type { PolarProduct } from '@socialista/types'
import { CheckIcon, XIcon } from 'lucide-react'
import Link from 'next/link'

export type PricingCardProps = {
  product: PolarProduct
  features?: string[]
  checkoutUrl?: string
  ctaLabel?: string
  footnote?: string | null
  isCurrentPlan?: boolean
  isFeatured?: boolean
  badge?: string
  tierIndex?: number
  onSelect?: (product: PolarProduct) => void
  disabled?: boolean
  className?: string
}

/** Reference-inspired accent — vivid check chips on a light card */
const FEATURE_INCLUDED_ICON_CLASS =
  'flex size-5 shrink-0 items-center justify-center rounded-full bg-[#c8ef4a] text-[#141414] dark:bg-[#b8e035] dark:text-[#0a0a0a]'

const FEATURE_EXCLUDED_ICON_CLASS =
  'flex size-5 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--landing-stone)_55%,#e8e6e1)] text-[var(--landing-muted)] dark:bg-muted dark:text-muted-foreground'

function PricingFeatureStatusIcon({ included }: { included: boolean }) {
  if (included) {
    return (
      <span className={cn(FEATURE_INCLUDED_ICON_CLASS, 'mt-0.5')}>
        <CheckIcon className="size-3 stroke-[3]" aria-hidden />
      </span>
    )
  }

  return (
    <span className={cn(FEATURE_EXCLUDED_ICON_CLASS, 'mt-0.5')}>
      <XIcon className="size-3 stroke-[2.5]" aria-hidden />
    </span>
  )
}

function PricingFeatureList({ features }: { features: ProductFeatureLine[] }) {
  if (features.length === 0) return null

  return (
    <ul className="mt-5 space-y-4">
      {features.map(feature => (
        <li key={feature.id} className="flex items-start gap-3">
          <PricingFeatureStatusIcon included={feature.included} />
          <span
            className={cn(
              'min-w-0 text-pretty text-[0.9375rem] leading-[1.5]',
              feature.included
                ? 'text-[var(--landing-ink)]/88'
                : 'text-[var(--landing-muted)]',
            )}
          >
            <span className="sr-only">{feature.included ? 'Included:' : 'Not included:'}</span>
            {feature.text}
          </span>
        </li>
      ))}
    </ul>
  )
}

function PricingCardCta({
  checkoutUrl,
  ctaLabel,
  disabled,
  isCurrentPlan,
  onSelect,
  product,
}: Pick<PricingCardProps, 'checkoutUrl' | 'ctaLabel' | 'disabled' | 'isCurrentPlan' | 'onSelect' | 'product'>) {
  const label = ctaLabel ?? getDefaultCtaLabel(product, { isCurrentPlan })
  const isDisabled = disabled || isCurrentPlan

  const buttonClassName = cn(
    'h-11 w-full rounded-lg text-sm font-semibold tracking-[-0.01em]',
    'transition-[transform,background-color] duration-150 ease-[cubic-bezier(0.2,0,0,1)] active:scale-[0.98]',
    !isCurrentPlan &&
      'border-0 bg-[var(--landing-charcoal)] text-white shadow-none hover:bg-[color-mix(in_oklch,var(--landing-charcoal),white_10%)] dark:bg-foreground dark:text-background dark:hover:bg-foreground/90',
  )

  const variant = isCurrentPlan ? 'secondary' : 'default'

  if (checkoutUrl && !isDisabled) {
    return (
      <Button asChild size="lg" variant={variant} className={buttonClassName}>
        <Link href={checkoutUrl}>{label}</Link>
      </Button>
    )
  }

  return (
    <Button
      type="button"
      size="lg"
      variant={variant}
      className={buttonClassName}
      disabled={isDisabled}
      onClick={() => onSelect?.(product)}
    >
      {label}
    </Button>
  )
}

export function PricingCard({
  product,
  features,
  checkoutUrl,
  ctaLabel,
  footnote,
  isCurrentPlan = false,
  isFeatured = false,
  onSelect,
  disabled = false,
  className,
  badge,
}: PricingCardProps) {
  const pricing = formatProductPrice(product)
  const featureLines = getProductFeatureLines(product, features)
  const resolvedFeatured = isFeatured || product.metadata.featured === true
  const resolvedFootnote = footnote === undefined ? getDefaultPricingFootnote(product) : footnote
  const resolvedBadge =
    badge ??
    (typeof product.metadata.badge === 'string' ? product.metadata.badge : undefined) ??
    (resolvedFeatured ? 'Popular' : undefined)
  const tagline =
    product.description?.trim() ||
    (typeof product.metadata.tagline === 'string' ? product.metadata.tagline.trim() : '')

  const intervalLabel = pricing.intervalLabel?.replace(/^per\s+/i, '') ?? null

  return (
    <div
      className={cn(
        'relative flex h-full flex-col rounded-2xl border border-[color-mix(in_srgb,var(--landing-stone)_48%,#e8e6e1)] bg-white',
        'shadow-[0_1px_2px_oklch(0_0_0/0.04),0_12px_40px_-20px_oklch(0_0_0/0.12)]',
        'dark:border-border/80 dark:bg-card dark:shadow-[0_1px_2px_oklch(0_0_0/0.2),0_16px_48px_-24px_oklch(0_0_0/0.45)]',
        className,
      )}
    >
      <article className="flex h-full flex-col px-8 py-9 sm:px-9 sm:py-10">
        <header className="flex items-start justify-between gap-4">
          <h3 className="text-base font-medium tracking-[-0.015em] text-[var(--landing-ink)]">{product.name}</h3>
          {resolvedBadge ? (
            <span
              className="shrink-0 rounded-full border border-[color-mix(in_srgb,var(--landing-stone)_70%,transparent)] bg-[color-mix(in_srgb,var(--landing-stone)_35%,white)] px-2.5 py-1 text-[0.6875rem] font-medium tracking-[-0.01em] text-[var(--landing-muted)]"
            >
              {resolvedBadge}
            </span>
          ) : null}
        </header>

        <div className="mt-6 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <p className="text-[clamp(2.5rem,2.15rem+1.5vw,3.25rem)] font-semibold leading-none tracking-[-0.04em] text-[var(--landing-ink)] tabular-nums">
            {pricing.amount}
          </p>
          {intervalLabel ? (
            <p className="text-[0.9375rem] font-normal leading-snug text-[var(--landing-muted)]">
              per {intervalLabel}
            </p>
          ) : null}
        </div>

        {tagline ? (
          <p className="mt-4 max-w-[28ch] text-[0.9375rem] leading-[1.55] text-[var(--landing-muted)]">{tagline}</p>
        ) : null}

        <div className={cn('mt-8', !tagline && 'mt-7')}>
          <PricingCardCta
            checkoutUrl={checkoutUrl}
            ctaLabel={ctaLabel}
            disabled={disabled}
            isCurrentPlan={isCurrentPlan}
            onSelect={onSelect}
            product={product}
          />
        </div>

        {featureLines.length > 0 ? (
          <div className="mt-8 flex-1 border-t border-[color-mix(in_srgb,var(--landing-stone)_55%,#e5e7eb)] pt-8 dark:border-border/70">
            <p className="text-[0.6875rem] font-semibold tracking-[0.12em] text-[var(--landing-muted)] uppercase">
              Features
            </p>
            <PricingFeatureList features={featureLines} />
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {resolvedFootnote ? (
          <p className="mt-6 text-[0.6875rem] leading-4 text-[var(--landing-muted)]">{resolvedFootnote}</p>
        ) : null}
      </article>
    </div>
  )
}
