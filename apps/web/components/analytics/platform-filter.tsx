import { PlusIcon } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { DashboardSegment, dashboardSegmentLinkClass } from '@/components/dashboard/dashboard-segment'
import { dashboardSurface } from '@/components/dashboard/surface'
import { SocialPlatformIcon, getSocialPlatformLabel } from '@/components/icons/social-platform-icon'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { cn } from '@/lib/utils'
import { buildAnalyticsDashboardHref } from '@/utils/analytics-href'
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
        'flex items-center gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden',
        className,
      )}
      role="tablist"
      aria-label="Filter by platform"
    >
      <DashboardSegment label="Filter by platform">
        <FilterPill href={buildAnalyticsDashboardHref({ range, rankBy })} active={current === 'all'}>
          All
        </FilterPill>

        {platforms.map(platform => (
          <FilterPill
            key={platform.provider}
            href={buildAnalyticsDashboardHref({ range, rankBy, provider: platform.provider })}
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
          dashboardSurface.toolbarControl,
          'inline-flex size-7 shrink-0 items-center justify-center px-0 text-muted-foreground',
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
