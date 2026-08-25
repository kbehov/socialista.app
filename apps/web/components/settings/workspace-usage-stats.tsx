import { AtSignIcon, HardDriveIcon, SendIcon, UsersIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import type { UsageStatTone } from '@/components/cards/usage-stat-card'
import { UsageStatCard } from '@/components/cards/usage-stat-card'
import { dashboardSurface } from '@/components/dashboard/surface'
import { cn } from '@/lib/utils'
import { formatCount, formatStorageSize } from '@/utils/format'
import type { WorkspaceUsageSummary } from '@socialista/types'

type UsageStatsGridProps = {
  children: ReactNode
  className?: string
}

function UsageStatsGrid({ children, className }: UsageStatsGridProps) {
  return (
    <div
      className={cn(
        dashboardSurface.dividerGrid,
        'rounded-none border-0 grid-cols-1 sm:grid-cols-2',
        className,
      )}
    >
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
  key: keyof WorkspaceUsageSummary
  title: string
  icon: typeof HardDriveIcon
  iconClassName: string
  tone: UsageStatTone
  formatValue: (value: number) => string
}>

export function WorkspaceUsageStats({
  usage,
  className,
}: {
  usage: WorkspaceUsageSummary
  className?: string
}) {
  return (
    <UsageStatsGrid className={className}>
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
  )
}
