import { dashboardSurface } from '@/components/dashboard'
import { SocialPlatformIcon, getSocialPlatformLabel } from '@/components/icons/social-platform-icon'
import { cn } from '@/lib/utils'
import type { AnalyticsGrowthResponse, AnalyticsOverviewResponse, SocialProvider } from '@socialista/types'

import { AnalyticsSection } from './analytics-section'
import { formatCount } from './lib/format'

export type PlatformSummaryProps = {
  overview: AnalyticsOverviewResponse
  growth?: AnalyticsGrowthResponse | null
  provider?: SocialProvider | 'all'
  className?: string
}

function PlatformSummary({ overview, growth, provider = 'all', className }: PlatformSummaryProps) {
  const providers =
    provider === 'all'
      ? overview.free.accountsByProvider
      : overview.free.accountsByProvider.filter(row => row.provider === provider)
  const growthByProvider = new Map(
    (growth?.byProvider ?? []).map(group => [group.provider, group.series.at(-1)?.followers ?? null]),
  )

  return (
    <AnalyticsSection className={className} title="Platforms" description="Audience by network.">
      {providers.length === 0 ? (
        <p className="py-4 text-center text-xs text-muted-foreground">No platforms connected.</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {providers.map(row => {
            const followers = growthByProvider.get(row.provider) ?? row.followers
            const maxFollowers = Math.max(
              ...providers.map(p => growthByProvider.get(p.provider) ?? p.followers ?? 0),
              1,
            )
            const pct = Math.min(100, Math.round(((followers ?? 0) / maxFollowers) * 100))

            return (
              <li key={row.provider} className={cn('flex flex-col gap-1.5 px-2.5 py-2', dashboardSurface.inset)}>
                <div className="flex items-center gap-2">
                  <SocialPlatformIcon provider={row.provider} size={12} className="size-4" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-foreground">
                      {getSocialPlatformLabel(row.provider)}
                    </p>
                    <p className="text-[10px] text-muted-foreground/80">
                      {row.accounts} account{row.accounts === 1 ? '' : 's'}
                    </p>
                  </div>
                  <p className="text-xs font-semibold tabular-nums text-foreground">{formatCount(followers)}</p>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-muted/80">
                  <div
                    className="h-full rounded-full bg-foreground/25 transition-[width] duration-500 ease-out"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </AnalyticsSection>
  )
}

export { PlatformSummary }
