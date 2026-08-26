import { MoonIcon, SunIcon, SunsetIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { GreetingPeriod } from '@/utils/greeting'

export type DashboardGreetingProps = {
  greeting: string
  name: string
  period: GreetingPeriod
  className?: string
}

function GreetingIcon({ period, className }: { period: GreetingPeriod; className?: string }) {
  const iconClassName = cn('size-4 shrink-0 text-muted-foreground', className)

  if (period === 'night') {
    return <MoonIcon className={iconClassName} strokeWidth={1.75} aria-hidden />
  }

  if (period === 'evening') {
    return <SunsetIcon className={iconClassName} strokeWidth={1.75} aria-hidden />
  }

  return <SunIcon className={iconClassName} strokeWidth={1.75} aria-hidden />
}

function DashboardGreeting({ greeting, name, period, className }: DashboardGreetingProps) {
  return (
    <span className={cn('inline-flex min-w-0 items-center gap-2', className)}>
      <GreetingIcon period={period} />
      <span className="truncate">
        {greeting}, {name}
      </span>
    </span>
  )
}

export { DashboardGreeting }
