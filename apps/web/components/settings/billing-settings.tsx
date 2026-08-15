'use client'

import { DashboardSection, dashboardSurface } from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { cn } from '@/lib/utils'
import { getBillingPortalUrl } from '@/utils/billing-urls'
import { formatDate, formatStorageSize } from '@/utils/format'
import type { WorkspaceBalanceResponse, WorkspaceResponse, WorkspaceUsageQuota } from '@socialista/types'
import { ArrowUpRightIcon } from 'lucide-react'
import Link from 'next/link'

type BillingSettingsProps = {
  workspace: WorkspaceResponse
  balance: WorkspaceBalanceResponse | null
}

function QuotaRow({
  label,
  quota,
  formatUsed,
  formatLimit,
}: {
  label: string
  quota: WorkspaceUsageQuota
  formatUsed?: (value: number) => string
  formatLimit?: (value: number) => string
}) {
  const usedLabel = formatUsed ? formatUsed(quota.used) : String(quota.used)
  const limitLabel = formatLimit ? formatLimit(quota.limit) : String(quota.limit)
  const near = quota.percentUsed >= 85

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <p className={dashboardSurface.metricLabel}>{label}</p>
        <p className={cn('text-[11px] tabular-nums', near ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground')}>
          {usedLabel} / {limitLabel}
        </p>
      </div>
      <Progress
        value={quota.percentUsed}
        className="h-1"
        indicatorClassName={cn(
          quota.percentUsed >= 100 && 'bg-destructive',
          near && quota.percentUsed < 100 && 'bg-amber-500',
        )}
      />
    </div>
  )
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
  if (status === 'pending') return 'Pending'
  return 'Inactive'
}

export function BillingSettings({ workspace, balance }: BillingSettingsProps) {
  const billing = workspace.billing
  const isPaid = billing.plan !== 'free'
  const usage = balance?.usage
  const periodEnd = billing.currentPeriodEnd ?? billing.nextBillingDate

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
            <dd className={dashboardSurface.metricValueSm}>{planLabel(billing.plan)}</dd>
          </div>
          <div>
            <dt className={dashboardSurface.metricLabel}>Status</dt>
            <dd className={dashboardSurface.metricValueSm}>{statusLabel(billing.status)}</dd>
          </div>
          <div>
            <dt className={dashboardSurface.metricLabel}>AI credits</dt>
            <dd className={dashboardSurface.metricValueSm}>{billing.aiCreditsBalance}</dd>
          </div>
          <div>
            <dt className={dashboardSurface.metricLabel}>{isPaid ? 'Current period' : 'Next billing'}</dt>
            <dd className="text-sm font-medium tracking-tight">
              {periodEnd ? formatDate(periodEnd) : '—'}
            </dd>
          </div>
        </dl>
      </DashboardSection>

      {usage ? (
        <DashboardSection title="Usage" description="Resets with your billing period where applicable.">
          <div className="grid gap-4 sm:grid-cols-2">
            <QuotaRow
              label="Storage"
              quota={usage.storage}
              formatUsed={formatStorageSize}
              formatLimit={formatStorageSize}
            />
            <QuotaRow label="Posts" quota={usage.posts} />
            <QuotaRow label="Accounts" quota={usage.accounts} />
            <QuotaRow label="Members" quota={usage.members} />
          </div>
        </DashboardSection>
      ) : null}
    </div>
  )
}
