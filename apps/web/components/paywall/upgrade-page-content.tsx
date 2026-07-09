'use client'

import { Paywall } from '@/components/paywall'
import { Button } from '@/components/ui/button'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { getWorkspaceBilling } from '@/services/workspace.service'
import { useWorkspaceStore, useWorkspaceStoreActions } from '@/store/workspace.store'
import { getBillingPortalUrl } from '@/utils/billing-urls'
import type { PolarProduct } from '@socialista/types'
import { ArrowUpRightIcon, CheckCircle2Icon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

type UpgradePageContentProps = {
  products: PolarProduct[]
  loadError?: string | null
  checkoutSuccess?: boolean
}

export function UpgradePageContent({ products, loadError = null, checkoutSuccess = false }: UpgradePageContentProps) {
  const router = useRouter()
  const currentWorkspace = useWorkspaceStore(state => state.currentWorkspace)
  const { updateWorkspace } = useWorkspaceStoreActions()
  const hasHandledSuccess = useRef(false)

  const workspaceId = currentWorkspace?.id
  const currentPlan = currentWorkspace?.billing.plan ?? 'free'
  const hasPaidPlan = currentPlan !== 'free'
  const portalUrl = workspaceId ? getBillingPortalUrl(workspaceId) : null

  useEffect(() => {
    if (!checkoutSuccess || !workspaceId || hasHandledSuccess.current) return

    hasHandledSuccess.current = true

    void getWorkspaceBilling(workspaceId)
      .then(response => {
        if (!response.success || !response.data || !currentWorkspace) return

        updateWorkspace({
          ...currentWorkspace,
          billing: response.data.billing,
          limits: response.data.limits,
          usage: response.data.usage,
        })
      })
      .finally(() => {
        toast.success('Subscription activated', {
          description: 'Your workspace limits and AI credits are updating now.',
        })
        router.replace(DASHBOARD_ROUTES.UPGRADE)
      })
  }, [checkoutSuccess, currentWorkspace, router, updateWorkspace, workspaceId])

  return (
    <div className="flex flex-col gap-6">
      {checkoutSuccess ? (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4 sm:px-5">
          <CheckCircle2Icon className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-medium text-foreground">Payment successful</p>
            <p className="text-sm text-muted-foreground">
              Your upgrade is being applied. Workspace limits and AI credits will refresh in a few seconds.
            </p>
          </div>
        </div>
      ) : null}

      {hasPaidPlan && portalUrl ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-muted/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <p className="text-sm font-medium capitalize text-foreground">{currentPlan} plan active</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your subscription, invoices, and payment method in the billing portal.
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <Link href={portalUrl}>
              Manage billing
              <ArrowUpRightIcon className="size-4 opacity-70" />
            </Link>
          </Button>
        </div>
      ) : null}

      <Paywall
        variant="page"
        products={products}
        workspaceId={workspaceId}
        currentPlan={currentPlan}
        reason="generic"
        title={hasPaidPlan ? 'Compare plans and add capacity' : undefined}
        description={
          hasPaidPlan
            ? 'Review available plans or manage your current subscription from the billing portal.'
            : undefined
        }
        error={loadError}
      />
    </div>
  )
}
