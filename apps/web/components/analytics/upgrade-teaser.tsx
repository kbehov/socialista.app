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
      className={cn(className)}
      title="Unlock full analytics"
      description="Growth charts, platform comparisons, and anomaly alerts on Pro."
      action={
        <Button asChild size="sm" variant="outline" className={cn(dashboardSurface.toolbarControl, 'px-2.5')}>
          <Link href={DASHBOARD_ROUTES.UPGRADE}>Upgrade</Link>
        </Button>
      }
    >
      <ul className="flex flex-col divide-y divide-border">
        {PREMIUM_FEATURES.map(feature => (
          <li key={feature.title} className="flex gap-2.5 py-2.5 first:pt-0 last:pb-0">
            <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center text-muted-foreground">
              <feature.icon className="size-3.5" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 space-y-0.5">
              <p className="text-[13px] font-medium text-foreground">{feature.title}</p>
              <p className="text-[11px] leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </AnalyticsSection>
  )
}

export { UpgradeTeaser }
