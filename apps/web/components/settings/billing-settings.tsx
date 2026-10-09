'use client'

import { DashboardSection, dashboardSurface } from '@/components/dashboard'
import { WorkspaceUsageStats } from '@/components/settings/workspace-usage-stats'
import { Button } from '@/components/ui/button'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { getBillingPortalUrl } from '@/utils/billing-urls'
import { formatCredits, formatDate } from '@/utils/format'
import type { WorkspaceBalanceResponse, WorkspaceResponse } from '@socialista/types'
import { ArrowUpRightIcon } from 'lucide-react'
import Link from 'next/link'

type BillingSettingsProps = {
  workspace: WorkspaceResponse
  balance: WorkspaceBalanceResponse | null
}

function planLabel(plan: WorkspaceResponse['billing']['plan']) {
  if (plan === 'pro') return 'Pro'
  if (plan === 'enterprise') return 'Enterprise'
  return 'Free'
}

function statusLabel(status: WorkspaceResponse['billing']['status']) {
  if (status === 'active') return 'Active'
  if (status === 'cancelled') return 'Canceled'
  if (status === 'expired') return 'Expired'
  if (status === 'pending') return 'Payment issue'
  return 'Inactive'
}

function isFutureDate(value: Date | string | undefined) {
  if (!value) return false
  const date = new Date(value)
  return !Number.isNaN(date.getTime()) && date.getTime() > Date.now()
}

function formatCharge(cents: number) {
  const hasFraction = Math.abs(cents % 100) > 0
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

export function BillingSettings({ workspace, balance }: BillingSettingsProps) {
  const billing = workspace.billing
  const isPaid = billing.plan !== 'free'
  const usage = balance?.usage
  const periodEnd = billing.currentPeriodEnd ?? billing.nextBillingDate
  const cancelsAtPeriodEnd = billing.status === 'cancelled' && isFutureDate(periodEnd)
  const renews = isPaid && billing.status === 'active' && isFutureDate(periodEnd)
  const showNextCharge = isPaid && billing.nextBillingAmount > 0 && billing.status !== 'cancelled'
  const planName = billing.polarProductName?.trim() || planLabel(billing.plan)

  return (
    <div className="flex flex-col gap-5">
      <DashboardSection
        title="Plan"
        description="Billing is handled by Polar. Manage invoices and payment methods in the portal."
        action={
          isPaid ? (
            <Button type="button" size="sm" className="h-8 rounded-full px-3" asChild>
              <a href={getBillingPortalUrl(workspace.id)}>
                Manage billing
                <ArrowUpRightIcon className="size-3.5" strokeWidth={1.75} />
              </a>
            </Button>
          ) : (
            <Button type="button" size="sm" className="h-8 rounded-full px-3" asChild>
              <Link href={DASHBOARD_ROUTES.UPGRADE}>Upgrade</Link>
            </Button>
          )
        }
      >
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className={dashboardSurface.metricLabel}>Current plan</dt>
            <dd className={dashboardSurface.metricValueSm}>{planName}</dd>
          </div>
          <div>
            <dt className={dashboardSurface.metricLabel}>Status</dt>
            <dd className={dashboardSurface.metricValueSm}>
              {cancelsAtPeriodEnd && periodEnd ? `Cancels on ${formatDate(periodEnd)}` : statusLabel(billing.status)}
            </dd>
            {billing.status === 'pending' ? (
              <dd className="mt-1 text-sm text-muted-foreground">
                Update your payment method in the{' '}
                <a href={getBillingPortalUrl(workspace.id)} className="underline underline-offset-2">
                  billing portal
                </a>
                .
              </dd>
            ) : null}
          </div>
          <div>
            <dt className={dashboardSurface.metricLabel}>AI credits</dt>
            <dd className={dashboardSurface.metricValueSm}>{formatCredits(billing.aiCreditsBalance)}</dd>
            {typeof billing.aiCreditsAllotment === 'number' ? (
              <dd className="mt-1 text-sm font-normal text-muted-foreground">
                {formatCredits(billing.aiCreditsAllotment)} included per period
              </dd>
            ) : null}
          </div>
          <div>
            <dt className={dashboardSurface.metricLabel}>
              {renews ? 'Renews' : cancelsAtPeriodEnd ? 'Access until' : isPaid ? 'Current period' : 'Next billing'}
            </dt>
            <dd className="text-sm font-medium tracking-tight">{periodEnd ? formatDate(periodEnd) : '—'}</dd>
          </div>
          {showNextCharge ? (
            <div>
              <dt className={dashboardSurface.metricLabel}>Next charge</dt>
              <dd className="text-sm font-medium tracking-tight">
                {formatCharge(billing.nextBillingAmount)}
                {periodEnd ? ` on ${formatDate(periodEnd)}` : ''}
              </dd>
            </div>
          ) : null}
        </dl>
      </DashboardSection>

      {usage ? (
        <DashboardSection title="Usage" description="Resets with your billing period where applicable." contentClassName="p-0">
          <WorkspaceUsageStats usage={usage} />
        </DashboardSection>
      ) : null}
    </div>
  )
}
