import { BarChart3Icon, SparklesIcon, TrendingUpIcon } from 'lucide-react'
import Link from 'next/link'

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
        <Button
          asChild
          size="sm"
          className="h-8 rounded-full px-3.5 text-xs font-medium shadow-xs active:scale-[0.98]"
        >
          <Link href={DASHBOARD_ROUTES.UPGRADE}>Upgrade</Link>
        </Button>
      }
    >
      <div className="grid gap-2.5 sm:grid-cols-3">
        {PREMIUM_FEATURES.map(feature => (
          <div
            key={feature.title}
            className="flex flex-col gap-2.5 rounded-xl border border-border/50 bg-muted/10 p-3.5 dark:bg-muted/5"
          >
            <span className="flex size-8 items-center justify-center rounded-xl border border-border/50 bg-background text-muted-foreground shadow-xs">
              <feature.icon className="size-3.5" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 space-y-1">
              <p className="text-xs font-semibold tracking-tight text-foreground">{feature.title}</p>
              <p className="text-[11px] leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </AnalyticsSection>
  )
}

export { UpgradeTeaser }
