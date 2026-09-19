'use client'

import { landingCtaPress, landingPricingCardSurface } from '@/components/landing/landing-classes'
import { Button } from '@/components/ui/button'
import { ShimmerBorder } from '@/components/ui/shimmer-border'
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

export type PricingCardAppearance = 'light' | 'dark'

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
  /** @deprecated Landing uses light cards; kept for paywall compatibility */
  appearance?: PricingCardAppearance
  className?: string
}

const FEATURE_ICON_BASE =
  'flex size-[1.125rem] shrink-0 items-center justify-center rounded-full mt-0.5'

function featureIconClass(included: boolean, appearance: PricingCardAppearance) {
  if (!included) {
    return cn(
      FEATURE_ICON_BASE,
      appearance === 'dark'
        ? 'bg-white/[0.05] text-white/30 ring-1 ring-white/[0.07]'
        : 'bg-[color-mix(in_srgb,var(--landing-stone)_40%,white)] text-[var(--landing-muted)] ring-1 ring-[color-mix(in_srgb,var(--landing-stone)_50%,transparent)]',
    )
  }

  return cn(
    FEATURE_ICON_BASE,
    appearance === 'dark'
      ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-400/25'
      : 'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-600/18',
  )
}

function PricingFeatureStatusIcon({
  included,
  appearance,
}: {
  included: boolean
  appearance: PricingCardAppearance
}) {
  if (included) {
    return (
      <span className={featureIconClass(true, appearance)}>
        <CheckIcon className="size-2.5 stroke-[3]" aria-hidden />
      </span>
    )
  }

  return (
    <span className={featureIconClass(false, appearance)}>
      <XIcon className="size-2.5 stroke-[2.5]" aria-hidden />
    </span>
  )
}

function PricingFeatureList({
  features,
  appearance,
}: {
  features: ProductFeatureLine[]
  appearance: PricingCardAppearance
}) {
  if (features.length === 0) return null

  return (
    <ul className="mt-3.5 space-y-2.5">
      {features.map(feature => (
        <li key={feature.id} className="flex items-start gap-2.5">
          <PricingFeatureStatusIcon included={feature.included} appearance={appearance} />
          <span
            className={cn(
              'min-w-0 pt-px text-pretty text-[0.875rem] font-normal leading-5 tracking-[-0.011em]',
              appearance === 'dark'
                ? feature.included
                  ? 'text-white/82'
                  : 'text-white/38'
                : feature.included
                  ? 'text-[color-mix(in_oklch,var(--landing-ink)_92%,transparent)]'
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
  appearance,
}: Pick<
  PricingCardProps,
  'checkoutUrl' | 'ctaLabel' | 'disabled' | 'isCurrentPlan' | 'onSelect' | 'product' | 'appearance'
>) {
  const label = ctaLabel ?? getDefaultCtaLabel(product, { isCurrentPlan })
  const isDisabled = disabled || isCurrentPlan

  const buttonClassName = cn(
    'h-11 w-full rounded-full text-sm font-semibold tracking-[-0.02em]',
    landingCtaPress,
    !isCurrentPlan &&
      appearance === 'dark' &&
      'border-0 !bg-white !text-[var(--landing-charcoal)] shadow-[0_1px_0_0_rgba(255,255,255,0.35)_inset,0_10px_28px_-16px_rgba(0,0,0,0.55)] hover:!bg-[color-mix(in_oklch,white,black_5%)] hover:!text-[var(--landing-charcoal)]',
    !isCurrentPlan &&
      appearance !== 'dark' &&
      'border-0 !bg-[var(--landing-charcoal)] !text-white shadow-none hover:!bg-[color-mix(in_oklch,var(--landing-charcoal),white_10%)] hover:!text-white',
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

function PricingPopularBadge({ label }: { label: string }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[0.6875rem] font-medium tracking-[-0.01em]',
        'border-[color-mix(in_oklch,var(--accent-orange)_32%,var(--border))] bg-[color-mix(in_oklch,var(--accent-orange)_8%,white)] text-[var(--landing-ink)]',
      )}
    >
      <span className="pricing-badge-fire text-[0.75rem] leading-none" aria-hidden="true">
        🔥
      </span>
      {label}
    </span>
  )
}

const cardShellClass = (featured: boolean) =>
  cn(
    'group/pricing relative flex h-full flex-col overflow-hidden rounded-2xl border',
    landingPricingCardSurface,
    'transition-[box-shadow,border-color] duration-200 ease-[cubic-bezier(0.2,0,0,1)]',
    'shadow-[0_1px_2px_oklch(0_0_0/0.04),0_12px_40px_-24px_oklch(0_0_0/0.1)]',
    featured
      ? 'border-transparent shadow-[0_8px_40px_-20px_color-mix(in_oklch,var(--accent-orange)_22%,transparent)]'
      : [
          'border-[color-mix(in_srgb,var(--landing-stone)_55%,var(--border))]',
          'ring-1 ring-inset ring-[oklch(0_0_0/0.04)]',
          '[@media(hover:hover)_and_(pointer:fine)]:hover:border-[color-mix(in_srgb,var(--landing-stone)_68%,var(--border))]',
          '[@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_1px_2px_oklch(0_0_0/0.05),0_16px_44px_-26px_oklch(0_0_0/0.12)]',
        ],
  )

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
  appearance = 'light',
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
  const showPopularBadge = resolvedFeatured && resolvedBadge
  const isDark = appearance === 'dark'
  const useLightLandingShell = !isDark

  const article = (
    <article className="relative flex h-full flex-col px-6 py-8 sm:px-8 sm:py-9">
      <header className="flex items-start justify-between gap-3">
        <h3
          className={cn(
            'text-base font-semibold tracking-[-0.02em]',
            isDark ? 'text-white' : 'text-[var(--landing-ink)]',
          )}
        >
          {product.name}
        </h3>
        {resolvedBadge ? (
          showPopularBadge ? (
            <PricingPopularBadge label={resolvedBadge} />
          ) : (
            <span
              className={cn(
                'shrink-0 rounded-full border px-2.5 py-1 text-[0.6875rem] font-medium tracking-[-0.01em]',
                isDark
                  ? 'border-white/12 bg-white/[0.06] text-white/55'
                  : 'border-[color-mix(in_srgb,var(--landing-stone)_60%,var(--border))] bg-[color-mix(in_srgb,var(--landing-stone)_28%,white)] text-[var(--landing-muted)]',
              )}
            >
              {resolvedBadge}
            </span>
          )
        ) : null}
      </header>

      <div className="mt-6 flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
        <p
          className={cn(
            'text-[clamp(2.375rem,2rem+1.25vw,3rem)] font-semibold leading-none tracking-[-0.04em] tabular-nums',
            isDark ? 'text-white' : 'text-[var(--landing-ink)]',
          )}
        >
          {pricing.amount}
        </p>
        {intervalLabel ? (
          <span
            className={cn(
              'text-[0.9375rem] font-normal leading-6',
              isDark ? 'text-white/45' : 'text-[var(--landing-muted)]',
            )}
          >
            / {intervalLabel}
          </span>
        ) : null}
      </div>

      {tagline ? (
        <p
          className={cn(
            'mt-3 max-w-[32ch] text-pretty text-[0.9375rem] leading-6',
            isDark ? 'text-white/52' : 'text-[var(--landing-muted)]',
          )}
        >
          {tagline}
        </p>
      ) : null}

      <div className="mt-8">
        <PricingCardCta
          checkoutUrl={checkoutUrl}
          ctaLabel={ctaLabel}
          disabled={disabled}
          isCurrentPlan={isCurrentPlan}
          onSelect={onSelect}
          product={product}
          appearance={appearance}
        />
      </div>

      {featureLines.length > 0 ? (
        <div
          className={cn(
            'mt-8 flex-1 border-t pt-8',
            isDark ? 'border-white/[0.1]' : 'border-[color-mix(in_srgb,var(--landing-stone)_55%,var(--border))]',
          )}
        >
          <p
            className={cn(
              'text-[0.8125rem] font-medium tracking-[-0.02em]',
              isDark ? 'text-white/45' : 'text-[var(--landing-muted)]',
            )}
          >
            What&apos;s included
          </p>
          <PricingFeatureList features={featureLines} appearance={appearance} />
        </div>
      ) : (
        <div className="flex-1" />
      )}

      {resolvedFootnote ? (
        <p
          className={cn(
            'mt-6 text-xs leading-5',
            isDark ? 'text-white/38' : 'text-[var(--landing-muted)]',
          )}
        >
          {resolvedFootnote}
        </p>
      ) : null}
    </article>
  )

  if (useLightLandingShell && resolvedFeatured) {
    return (
      <ShimmerBorder
        className={cn('h-full', className)}
        contentClassName="h-full"
        borderRadius="1rem"
        borderWidth="1.5px"
        shimmerColor="color-mix(in oklch, var(--landing-orange) 65%, white)"
        shimmerDuration="4.5s"
        background="#ffffff"
      >
        <div className={cardShellClass(true)}>{article}</div>
      </ShimmerBorder>
    )
  }

  return (
    <div
      className={cn(
        cardShellClass(false),
        isDark && [
          'border-white/[0.1] bg-[#0c0c0c] text-white dark:bg-[#0c0c0c]',
          'shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset,0_28px_56px_-32px_rgba(0,0,0,0.75)]',
          'ring-1 ring-inset ring-white/[0.06]',
        ],
        className,
      )}
    >
      {article}
    </div>
  )
}
