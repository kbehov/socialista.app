import { MoonIcon, SunIcon, SunsetIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { GreetingPeriod } from '@/lib/greeting'

export type DashboardGreetingProps = {
  greeting: string
  name: string
  period: GreetingPeriod
  className?: string
}

const ICON_STYLES: Record<GreetingPeriod, string> = {
  morning: 'text-amber-500 dark:text-amber-400',
  afternoon: 'text-orange-500 dark:text-orange-400',
  evening: 'text-violet-500 dark:text-violet-400',
  night: 'text-indigo-400 dark:text-indigo-300',
}

function GreetingIcon({ period, className }: { period: GreetingPeriod; className?: string }) {
  const iconClassName = cn('size-5 shrink-0', ICON_STYLES[period], className)

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
    <span className={cn('inline-flex min-w-0 items-center gap-2.5', className)}>
      <GreetingIcon period={period} />
      <span className="truncate">
        {greeting}, {name}
      </span>
    </span>
  )
}

export { DashboardGreeting }
