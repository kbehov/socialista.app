'use client'

import { DashboardSection, dashboardSurface } from '@/components/dashboard'
import { WorkspaceUsageStats } from '@/components/settings/workspace-usage-stats'
import { Button } from '@/components/ui/button'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { getBillingPortalUrl } from '@/utils/billing-urls'
import { formatDate } from '@/utils/format'
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
        <DashboardSection title="Usage" description="Resets with your billing period where applicable." contentClassName="p-0">
          <WorkspaceUsageStats usage={usage} />
        </DashboardSection>
      ) : null}
    </div>
  )
}
