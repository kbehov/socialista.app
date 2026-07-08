'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  formatProductPrice,
  getDefaultCtaLabel,
  getDefaultPricingFootnote,
  getProductFeatures,
} from '@/lib/pricing'
import { cn } from '@/lib/utils'
import type { PolarProduct } from '@socialista/types'
import { ArrowRightIcon, CheckIcon, SparklesIcon } from 'lucide-react'
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
  onSelect?: (product: PolarProduct) => void
  disabled?: boolean
  className?: string
}

function PricingFeatureList({ features }: { features: string[] }) {
  if (features.length === 0) return null

  return (
    <ul className="space-y-3">
      {features.map((feature, index) => (
        <li key={`${feature}-${index}`} className="flex items-start gap-3 text-sm leading-5 text-foreground/90">
          <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckIcon className="size-2.5 stroke-[3]" />
          </span>
          <span>{feature}</span>
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
  isFeatured,
  onSelect,
  product,
}: Pick<
  PricingCardProps,
  'checkoutUrl' | 'ctaLabel' | 'disabled' | 'isCurrentPlan' | 'isFeatured' | 'onSelect' | 'product'
>) {
  const label = ctaLabel ?? getDefaultCtaLabel(product, { isCurrentPlan, isFeatured })
  const isDisabled = disabled || isCurrentPlan

  const buttonClassName = cn(
    'h-11 w-full rounded-[min(var(--radius-md),12px)] text-sm font-medium',
    isFeatured && !isCurrentPlan && 'shadow-sm',
  )

  if (checkoutUrl && !isDisabled) {
    return (
      <Button asChild size="lg" variant={isFeatured ? 'default' : 'outline'} className={buttonClassName}>
        <Link href={checkoutUrl}>
          {label}
          <ArrowRightIcon className="size-4 opacity-80" />
        </Link>
      </Button>
    )
  }

  return (
    <Button
      type="button"
      size="lg"
      variant={isCurrentPlan ? 'secondary' : isFeatured ? 'default' : 'outline'}
      className={buttonClassName}
      disabled={isDisabled}
      onClick={() => onSelect?.(product)}
    >
      {label}
      {!isCurrentPlan ? <ArrowRightIcon className="size-4 opacity-80" /> : null}
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
  badge,
  onSelect,
  disabled = false,
  className,
}: PricingCardProps) {
  const pricing = formatProductPrice(product)
  const featureList = getProductFeatures(product, features)
  const resolvedFeatured = isFeatured || product.metadata.featured === true
  const resolvedBadge =
    badge ??
    (typeof product.metadata.badge === 'string' ? product.metadata.badge : undefined) ??
    (resolvedFeatured ? 'Most popular' : undefined)
  const resolvedFootnote = footnote === undefined ? getDefaultPricingFootnote(product) : footnote

  return (
    <article
      className={cn(
        'relative flex h-full flex-col rounded-2xl bg-card p-6 text-card-foreground',
        resolvedFeatured
          ? 'z-10 shadow-lg ring-2 ring-primary/70'
          : 'shadow-xs ring-1 ring-foreground/10 transition-[box-shadow,ring-color,transform] duration-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-foreground/15',
        isCurrentPlan && 'ring-primary/30',
        className,
      )}
    >
      {resolvedFeatured ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent"
        />
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            {resolvedFeatured ? <SparklesIcon className="size-4 shrink-0 text-amber-500" /> : null}
            <h3 className="truncate text-lg font-semibold tracking-tight">{product.name}</h3>
          </div>
          {product.description ? (
            <p className="text-sm leading-5 text-muted-foreground">{product.description}</p>
          ) : null}
        </div>

        {resolvedBadge ? (
          <Badge
            variant={resolvedFeatured ? 'default' : 'secondary'}
            className={cn(
              'shrink-0 px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase',
              resolvedFeatured && 'bg-primary text-primary-foreground',
            )}
          >
            {resolvedBadge}
          </Badge>
        ) : null}
      </div>

      <div className="mt-6 border-b border-border/70 pb-6">
        <div className="flex items-end gap-2">
          <p className="text-4xl font-semibold tracking-tight text-foreground tabular-nums">{pricing.amount}</p>
          {pricing.intervalLabel ? (
            <p className="pb-1 text-sm font-medium text-muted-foreground">/{pricing.intervalLabel.replace('per ', '')}</p>
          ) : null}
        </div>
        {pricing.billingNote ? <p className="mt-2 text-xs text-muted-foreground">{pricing.billingNote}</p> : null}
      </div>

      <div className="mt-6 flex-1">
        <PricingFeatureList features={featureList} />
      </div>

      <div className="mt-8 space-y-2">
        <PricingCardCta
          checkoutUrl={checkoutUrl}
          ctaLabel={ctaLabel}
          disabled={disabled}
          isCurrentPlan={isCurrentPlan}
          isFeatured={resolvedFeatured}
          onSelect={onSelect}
          product={product}
        />
        {resolvedFootnote ? <p className="text-center text-[11px] leading-4 text-muted-foreground">{resolvedFootnote}</p> : null}
      </div>
    </article>
  )
}
