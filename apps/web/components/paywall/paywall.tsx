'use client'

import { PricingCard } from '@/components/cards/pricing-card'
import { ErrorState } from '@/components/common/error-state'
import { LoadingState } from '@/components/common/loading-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getProductCheckoutUrl } from '@/lib/billing-urls'
import {
  getPaywallCopy,
  mapWorkspacePlanToProduct,
  resolveFeaturedProductId,
  type PaywallCopy,
  type PaywallReason,
} from '@/lib/paywall'
import { cn } from '@/lib/utils'
import type { PolarProduct } from '@socialista/types'
import { LockIcon, RefreshCwIcon, ShieldCheckIcon, SparklesIcon, ZapIcon } from 'lucide-react'

export type PaywallProps = {
  products: PolarProduct[]
  workspaceId?: string
  currentPlan?: 'free' | 'pro' | 'enterprise'
  reason?: PaywallReason
  title?: string
  description?: string
  eyebrow?: string
  featuredProductId?: string
  variant?: 'page' | 'embedded'
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
  onDismiss?: () => void
  dismissLabel?: string
  className?: string
}

const trustSignals = [
  { icon: ShieldCheckIcon, label: 'Secure checkout' },
  { icon: RefreshCwIcon, label: 'Cancel anytime' },
  { icon: ZapIcon, label: 'Instant access' },
] as const

function PaywallHeader({
  copy,
  variant,
}: {
  copy: PaywallCopy
  variant: NonNullable<PaywallProps['variant']>
}) {
  const isPage = variant === 'page'

  return (
    <div className={cn('mx-auto text-center', isPage ? 'max-w-3xl' : 'max-w-2xl')}>
      <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-[11px] font-medium tracking-wide uppercase">
        <SparklesIcon className="size-3.5 text-amber-500" />
        {copy.eyebrow}
      </Badge>

      <h1
        className={cn(
          'mt-4 font-semibold tracking-tight text-balance text-foreground',
          isPage ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-[1.75rem]',
        )}
      >
        {copy.title}
      </h1>

      <p
        className={cn(
          'mt-3 text-pretty text-muted-foreground',
          isPage ? 'text-base leading-7 sm:text-lg' : 'text-sm leading-6 sm:text-[15px]',
        )}
      >
        {copy.description}
      </p>
    </div>
  )
}

function PaywallTrustRow({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-muted-foreground',
        className,
      )}
    >
      {trustSignals.map(signal => (
        <span key={signal.label} className="inline-flex items-center gap-1.5">
          <signal.icon className="size-3.5 shrink-0 text-primary/80" />
          {signal.label}
        </span>
      ))}
    </div>
  )
}

function PaywallProductGrid({
  products,
  workspaceId,
  currentPlan,
  featuredProductId,
  variant,
}: {
  products: PolarProduct[]
  workspaceId?: string
  currentPlan?: PaywallProps['currentPlan']
  featuredProductId?: string
  variant: NonNullable<PaywallProps['variant']>
}) {
  const featuredId = resolveFeaturedProductId(products, featuredProductId)
  const currentProductId = mapWorkspacePlanToProduct(products, currentPlan)

  return (
    <div
      className={cn(
        'grid gap-4',
        variant === 'page'
          ? 'md:grid-cols-2 xl:grid-cols-3'
          : products.length > 1
            ? 'sm:grid-cols-2'
            : 'grid-cols-1',
      )}
    >
      {products.map(product => (
        <PricingCard
          key={product.id}
          product={product}
          checkoutUrl={getProductCheckoutUrl(product.id, workspaceId)}
          isFeatured={product.id === featuredId}
          isCurrentPlan={product.id === currentProductId}
          className={cn(product.id === featuredId && products.length > 1 && 'md:-translate-y-1')}
        />
      ))}
    </div>
  )
}

export function Paywall({
  products,
  workspaceId,
  currentPlan = 'free',
  reason = 'generic',
  title,
  description,
  eyebrow,
  featuredProductId,
  variant = 'embedded',
  isLoading = false,
  error = null,
  onRetry,
  onDismiss,
  dismissLabel = 'Not now',
  className,
}: PaywallProps) {
  const copy = getPaywallCopy(reason, {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(eyebrow ? { eyebrow } : {}),
  })

  const isPage = variant === 'page'

  return (
    <section
      className={cn(
        'relative w-full',
        isPage && 'rounded-3xl border border-border/70 bg-gradient-to-b from-muted/30 via-background to-background px-4 py-10 sm:px-8 sm:py-14',
        className,
      )}
    >
      {isPage ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
        />
      ) : null}

      <div className={cn('mx-auto flex w-full flex-col', isPage ? 'max-w-6xl gap-10' : 'gap-8')}>
        <PaywallHeader copy={copy} variant={variant} />

        {isLoading ? (
          <LoadingState message="Loading plans…" className="items-center py-10">
            <div className="mt-4 grid w-full gap-4 sm:grid-cols-2">
              <div className="h-[28rem] rounded-2xl bg-muted/50" />
              <div className="hidden h-[28rem] rounded-2xl bg-muted/40 sm:block" />
            </div>
          </LoadingState>
        ) : null}

        {!isLoading && error ? (
          <ErrorState
            title="Unable to load plans"
            description={error}
            action={
              onRetry ? (
                <Button type="button" size="sm" onClick={onRetry}>
                  Try again
                </Button>
              ) : undefined
            }
            className="mx-auto max-w-lg"
          />
        ) : null}

        {!isLoading && !error && products.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-10 text-center">
            <div className="flex size-11 items-center justify-center rounded-full bg-muted">
              <LockIcon className="size-5 text-muted-foreground" />
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">Plans are unavailable right now</p>
            <p className="mt-1 text-sm text-muted-foreground">Please try again in a moment.</p>
          </div>
        ) : null}

        {!isLoading && !error && products.length > 0 ? (
          <>
            <PaywallProductGrid
              products={products}
              workspaceId={workspaceId}
              currentPlan={currentPlan}
              featuredProductId={featuredProductId}
              variant={variant}
            />
            <PaywallTrustRow />
          </>
        ) : null}

        {onDismiss ? (
          <div className="flex justify-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={onDismiss}
            >
              {dismissLabel}
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
