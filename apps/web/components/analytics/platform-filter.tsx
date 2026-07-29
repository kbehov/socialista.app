import { PlusIcon } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { DashboardSegment, dashboardSegmentLinkClass } from '@/components/dashboard/dashboard-segment'
import { SocialPlatformIcon, getSocialPlatformLabel } from '@/components/icons/social-platform-icon'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { cn } from '@/lib/utils'
import type {
  AnalyticsAccountPerformanceRankBy,
  AnalyticsRange,
  SocialProvider,
} from '@socialista/types'

export type PlatformFilterOption = {
  provider: SocialProvider
  accounts: number
}

export type PlatformFilterProps = {
  platforms: PlatformFilterOption[]
  active?: SocialProvider | 'all'
  range: AnalyticsRange
  rankBy?: AnalyticsAccountPerformanceRankBy
  className?: string
}

function buildHref(
  range: AnalyticsRange,
  provider?: SocialProvider | 'all',
  rankBy?: AnalyticsAccountPerformanceRankBy,
) {
  const search = new URLSearchParams({ range })
  if (provider && provider !== 'all') search.set('provider', provider)
  if (rankBy && rankBy !== 'followerGrowth') search.set('rankBy', rankBy)
  return `${DASHBOARD_ROUTES.ROOT}?${search.toString()}`
}

function PlatformFilter({
  platforms,
  active = 'all',
  range,
  rankBy = 'followerGrowth',
  className,
}: PlatformFilterProps) {
  const current = active ?? 'all'

  return (
    <div
      data-slot="platform-filter"
      className={cn(
        'flex items-center gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden',
        className,
      )}
      role="tablist"
      aria-label="Filter by platform"
    >
      <DashboardSegment label="Filter by platform">
        <FilterPill href={buildHref(range, 'all', rankBy)} active={current === 'all'}>
          All
        </FilterPill>

        {platforms.map(platform => (
          <FilterPill
            key={platform.provider}
            href={buildHref(range, platform.provider, rankBy)}
            active={current === platform.provider}
          >
            <SocialPlatformIcon provider={platform.provider} size={12} className="size-3.5 rounded [&_svg]:size-2.5" />
            <span className="hidden sm:inline">{getSocialPlatformLabel(platform.provider)}</span>
          </FilterPill>
        ))}
      </DashboardSegment>

      <Link
        href={DASHBOARD_ROUTES.ACCOUNTS}
        className={cn(
          'inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-border/60',
          'bg-background text-muted-foreground shadow-xs',
          'transition-colors hover:bg-muted/40 hover:text-foreground',
          'active:scale-[0.97]',
        )}
        aria-label="Connect another platform"
      >
        <PlusIcon className="size-3.5" strokeWidth={1.75} />
      </Link>
    </div>
  )
}

function FilterPill({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      role="tab"
      aria-selected={active}
      className={dashboardSegmentLinkClass(active)}
      scroll={false}
    >
      {children}
    </Link>
  )
}

export { PlatformFilter }
