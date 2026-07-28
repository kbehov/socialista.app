import { AlertTriangleIcon, InfoIcon, Link2OffIcon } from 'lucide-react'
import Link from 'next/link'

import { dashboardSurface } from '@/components/dashboard/surface'
import { Button } from '@/components/ui/button'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/utils/format'
import type { AnalyticsDataQuality } from '@socialista/types'

export type AccountAnalyticsQualityProps = {
  dataQuality: AnalyticsDataQuality
  className?: string
}

function AccountAnalyticsQuality({ dataQuality, className }: AccountAnalyticsQualityProps) {
  const { status, lastFetchedAt, missingMetrics } = dataQuality
  const hasMissing = missingMetrics.length > 0

  if (status === 'ok' && !hasMissing) return null

  if (status === 'needs_reauth') {
    return (
      <div
        className={cn(
          'flex flex-wrap items-center gap-3 px-3.5 py-2.5',
          dashboardSurface.inset,
          className,
        )}
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <Link2OffIcon className="size-3.5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-foreground">Reconnect required</p>
          <p className={dashboardSurface.metricMeta}>
            Analytics access expired. Reconnect this account to resume syncing.
            {lastFetchedAt ? ` Last synced ${formatRelativeTime(lastFetchedAt)}.` : null}
          </p>
        </div>
        <Button asChild size="sm" variant="outline" className="h-7 shrink-0 px-2.5 text-xs">
          <Link href={DASHBOARD_ROUTES.ACCOUNTS}>Accounts</Link>
        </Button>
      </div>
    )
  }

  if (status === 'unsupported') {
    return (
      <div className={cn('flex items-start gap-3 px-3.5 py-2.5', dashboardSurface.inset, className)}>
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <InfoIcon className="size-3.5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-foreground">Limited metrics</p>
          <p className={dashboardSurface.metricMeta}>
            This platform doesn&apos;t expose full analytics yet. Available metrics are shown below.
          </p>
        </div>
      </div>
    )
  }

  if (status === 'error' || hasMissing) {
    return (
      <div className={cn('flex items-start gap-3 px-3.5 py-2.5', dashboardSurface.inset, className)}>
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-red-500/10 text-red-600 dark:text-red-400">
          <AlertTriangleIcon className="size-3.5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-foreground">
            {status === 'error' ? 'Sync issue' : 'Partial data'}
          </p>
          <p className={dashboardSurface.metricMeta}>
            {status === 'error'
              ? 'The latest analytics sync failed. Showing the most recent available data.'
              : `Some metrics were unavailable: ${missingMetrics.join(', ')}.`}
            {lastFetchedAt ? ` Last synced ${formatRelativeTime(lastFetchedAt)}.` : null}
          </p>
        </div>
      </div>
    )
  }

  return null
}

export { AccountAnalyticsQuality }
