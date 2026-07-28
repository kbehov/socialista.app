import { AtSignIcon, HardDriveIcon, SendIcon, UsersIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import type { UsageStatTone } from '@/components/cards/usage-stat-card'
import { UsageStatCard } from '@/components/cards/usage-stat-card'
import { ErrorState } from '@/components/common/error-state'
import { dashboardSurface } from '@/components/dashboard/surface'
import { cn } from '@/lib/utils'
import { loadUsage } from '@/services/analytics.service'
import { formatCount, formatStorageSize } from '@/utils/format'

import { AnalyticsSection } from '../analytics-section'

type UsageStatsGridProps = {
  children: ReactNode
  className?: string
}

export function UsageStatsGrid({ children, className }: UsageStatsGridProps) {
  return (
    <div className={cn(dashboardSurface.dividerGrid, 'rounded-none border-0 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {children}
    </div>
  )
}

const USAGE_STATS = [
  {
    key: 'storage',
    title: 'Storage',
    icon: HardDriveIcon,
    iconClassName: 'text-sky-500/80',
    tone: 'sky',
    formatValue: formatStorageSize,
  },
  {
    key: 'posts',
    title: 'Posts',
    icon: SendIcon,
    iconClassName: 'text-violet-500/80',
    tone: 'violet',
    formatValue: formatCount,
  },
  {
    key: 'accounts',
    title: 'Accounts',
    icon: AtSignIcon,
    iconClassName: 'text-emerald-500/80',
    tone: 'emerald',
    formatValue: formatCount,
  },
  {
    key: 'members',
    title: 'Members',
    icon: UsersIcon,
    iconClassName: 'text-amber-500/80',
    tone: 'amber',
    formatValue: formatCount,
  },
] as const satisfies ReadonlyArray<{
  key: 'storage' | 'posts' | 'accounts' | 'members'
  title: string
  icon: typeof HardDriveIcon
  iconClassName: string
  tone: UsageStatTone
  formatValue: (value: number) => string
}>

export async function UsageStatsPanel({ workspaceId }: { workspaceId: string }) {
  const { data, error } = await loadUsage({ workspaceId })

  if (error || !data) {
    return (
      <AnalyticsSection title="Usage" description="Plan limits for this workspace.">
        <ErrorState
          title="Couldn't load usage"
          description={error ?? 'Something went wrong while loading usage data.'}
          minHeight="sm"
          className="py-6"
        />
      </AnalyticsSection>
    )
  }

  const { usage } = data

  return (
    <AnalyticsSection title="Usage" description="Plan limits for this workspace." contentClassName="p-0">
      <UsageStatsGrid>
        {USAGE_STATS.map(stat => {
          const quota = usage[stat.key]
          const Icon = stat.icon

          return (
            <UsageStatCard
              key={stat.key}
              title={stat.title}
              used={quota.used}
              remaining={quota.remaining}
              percentUsed={quota.percentUsed}
              limit={quota.limit}
              icon={<Icon />}
              iconClassName={stat.iconClassName}
              tone={stat.tone}
              formatValue={stat.formatValue}
            />
          )
        })}
      </UsageStatsGrid>
    </AnalyticsSection>
  )
}
