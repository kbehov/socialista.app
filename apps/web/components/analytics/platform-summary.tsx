import { Progress } from '@/components/ui/progress'
import { SocialPlatformIcon, getSocialPlatformLabel } from '@/components/icons/social-platform-icon'
import { cn } from '@/lib/utils'
import type { AnalyticsGrowthResponse, AnalyticsOverviewResponse, SocialProvider } from '@socialista/types'

import { formatCount } from '@/utils/format'
import { AnalyticsEmpty } from './analytics-empty'
import { AnalyticsSection } from './analytics-section'

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

  const maxFollowers = Math.max(
    ...providers.map(p => growthByProvider.get(p.provider) ?? p.followers ?? 0),
    1,
  )

  return (
    <AnalyticsSection className={cn('h-full', className)} title="Platforms" description="Audience by network.">
      {providers.length === 0 ? (
        <AnalyticsEmpty title="No platforms connected" description="Connect a social account to see audience share." />
      ) : (
        <ul className="flex flex-col gap-2">
          {providers.map(row => {
            const followers = growthByProvider.get(row.provider) ?? row.followers
            const pct = Math.min(100, Math.round(((followers ?? 0) / maxFollowers) * 100))

            return (
              <li
                key={row.provider}
                className="flex flex-col gap-2.5 rounded-xl border border-border/50 bg-muted/10 px-3 py-2.5 dark:bg-muted/5"
              >
                <div className="flex items-center gap-2.5">
                  <SocialPlatformIcon provider={row.provider} size={14} className="size-7 shrink-0 shadow-xs" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium tracking-tight text-foreground">
                      {getSocialPlatformLabel(row.provider)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {row.accounts} account{row.accounts === 1 ? '' : 's'}
                    </p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums tracking-[-0.02em] text-foreground">
                    {formatCount(followers)}
                  </p>
                </div>
                <Progress
                  value={pct}
                  className="h-1 rounded-full bg-muted"
                  indicatorClassName="rounded-full bg-foreground/30"
                  aria-label={`${getSocialPlatformLabel(row.provider)} share of audience`}
                />
              </li>
            )
          })}
        </ul>
      )}
    </AnalyticsSection>
  )
}

export { PlatformSummary }
