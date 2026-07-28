import { BarChart3Icon, SparklesIcon, TrendingUpIcon } from 'lucide-react'
import Link from 'next/link'

import { dashboardSurface } from '@/components/dashboard/surface'
import { Button } from '@/components/ui/button'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { cn } from '@/lib/utils'

import { AnalyticsSection } from './analytics-section'

const PREMIUM_FEATURES = [
  {
    icon: TrendingUpIcon,
    title: 'Growth charts',
    description: 'Period-over-period trends for followers, reach, and engagement.',
  },
  {
    icon: BarChart3Icon,
    title: 'Platform comparisons',
    description: 'See which networks drive the most audience and interaction.',
  },
  {
    icon: SparklesIcon,
    title: 'Anomaly alerts',
    description: 'Catch unusual spikes and drops before they become problems.',
  },
] as const

export type UpgradeTeaserProps = {
  className?: string
}

function UpgradeTeaser({ className }: UpgradeTeaserProps) {
  return (
    <AnalyticsSection
      className={className}
      title="Unlock full analytics"
      description="Growth charts, platform comparisons, and anomaly alerts on Pro."
      action={
        <Button asChild size="sm" variant="outline" className="h-7 px-2.5 text-xs">
          <Link href={DASHBOARD_ROUTES.UPGRADE}>Upgrade</Link>
        </Button>
      }
    >
      <div className="grid gap-2.5 sm:grid-cols-3">
        {PREMIUM_FEATURES.map(feature => (
          <div key={feature.title} className={cn('flex flex-col gap-2.5 p-3.5', dashboardSurface.inset)}>
            <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <feature.icon className="size-3.5" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 space-y-0.5">
              <p className="text-xs font-medium text-foreground">{feature.title}</p>
              <p className={dashboardSurface.metricMeta}>{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </AnalyticsSection>
  )
}

export { UpgradeTeaser }
