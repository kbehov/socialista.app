'use client'

import {
  eachDayOfInterval,
  endOfWeek,
  format,
  parseISO,
  startOfDay,
  startOfWeek,
  subDays,
} from 'date-fns'
import type { CSSProperties, ReactNode } from 'react'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export type ActivityDay = {
  /** ISO date `YYYY-MM-DD` */
  date: string
  count: number
}

export type ActivityLevel = 0 | 1 | 2 | 3 | 4

export type ActivityHeatmapColorScheme = 'green' | 'blue' | 'neutral'

export type ActivityHeatmapSize = 'sm' | 'default' | 'lg'

export type ActivityHeatmapProps = {
  data: ActivityDay[]
  /** Number of days to render ending at `endDate`. Default: 365 */
  days?: number
  /** Inclusive end of the range. Default: today */
  endDate?: Date | string
  colorScheme?: ActivityHeatmapColorScheme
  size?: ActivityHeatmapSize
  /** Week starts on Sunday (0) like GitHub, or Monday (1) */
  weekStartsOn?: 0 | 1
  /** Custom intensity thresholds. Values at/above each threshold map to that level. */
  thresholds?: [number, number, number, number]
  className?: string
  showLegend?: boolean
  showMonthLabels?: boolean
  showWeekdayLabels?: boolean
  hideTotal?: boolean
  /** Override the summary line. Receives total count in range. */
  totalLabel?: ReactNode | ((total: number) => ReactNode)
  /** Optional secondary line in the legend row (e.g. time saved). */
  metaLabel?: ReactNode
  /** Override cell tooltip content. */
  renderTooltip?: (day: {
    date: string
    count: number
    level: ActivityLevel
  }) => ReactNode
  lessLabel?: string
  moreLabel?: string
}

const SIZE_STYLES: Record<
  ActivityHeatmapSize,
  { gap: string; gapPx: number; label: string; dayGutter: string; radius: string; minCell: number }
> = {
  sm: {
    gap: 'gap-[3px]',
    gapPx: 3,
    label: 'text-[10px] leading-none',
    dayGutter: 'w-5',
    radius: 'rounded-[2px]',
    minCell: 10,
  },
  default: {
    gap: 'gap-1',
    gapPx: 4,
    label: 'text-[10px] leading-none',
    dayGutter: 'w-5.5',
    radius: 'rounded-[3px]',
    minCell: 11,
  },
  lg: {
    gap: 'gap-1',
    gapPx: 4,
    label: 'text-[11px] leading-none',
    dayGutter: 'w-6',
    radius: 'rounded-[3px]',
    minCell: 12,
  },
}

const COLOR_SCHEMES: Record<ActivityHeatmapColorScheme, string[]> = {
  green: [
    'bg-muted',
    'bg-emerald-500/25 dark:bg-emerald-400/20',
    'bg-emerald-500/45 dark:bg-emerald-400/40',
    'bg-emerald-600/75 dark:bg-emerald-400/65',
    'bg-emerald-700 dark:bg-emerald-400',
  ],
  blue: [
    'bg-muted',
    'bg-sky-500/25 dark:bg-sky-400/20',
    'bg-sky-500/45 dark:bg-sky-400/40',
    'bg-sky-600/75 dark:bg-sky-400/65',
    'bg-sky-700 dark:bg-sky-400',
  ],
  neutral: [
    'bg-muted',
    'bg-foreground/12',
    'bg-foreground/28',
    'bg-foreground/52',
    'bg-foreground/82',
  ],
}

const DEFAULT_THRESHOLDS: [number, number, number, number] = [1, 3, 6, 9]

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

function toDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

function resolveEndDate(endDate?: Date | string): Date {
  if (!endDate) return startOfDay(new Date())
  if (typeof endDate === 'string') return startOfDay(parseISO(endDate))
  return startOfDay(endDate)
}

function getLevel(count: number, thresholds: [number, number, number, number]): ActivityLevel {
  if (count >= thresholds[3]) return 4
  if (count >= thresholds[2]) return 3
  if (count >= thresholds[1]) return 2
  if (count >= thresholds[0]) return 1
  return 0
}

function buildCountMap(data: ActivityDay[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const day of data) {
    map.set(day.date, (map.get(day.date) ?? 0) + day.count)
  }
  return map
}

function defaultTotalLabel(total: number): string {
  return `${total.toLocaleString('en-US')} contributions in the last year`
}

function defaultTooltip({ date, count }: { date: string; count: number }): string {
  const label = format(parseISO(date), 'MMM d, yyyy')
  if (count === 0) return `No contributions on ${label}`
  if (count === 1) return `1 contribution on ${label}`
  return `${count.toLocaleString('en-US')} contributions on ${label}`
}

type HeatmapCell = {
  date: string
  count: number
  level: ActivityLevel
  inRange: boolean
}

function ActivityHeatmap({
  data,
  days = 365,
  endDate,
  colorScheme = 'green',
  size = 'default',
  weekStartsOn = 0,
  thresholds = DEFAULT_THRESHOLDS,
  className,
  showLegend = true,
  showMonthLabels = true,
  showWeekdayLabels = true,
  hideTotal = false,
  totalLabel,
  metaLabel,
  renderTooltip,
  lessLabel = 'Less',
  moreLabel = 'More',
}: ActivityHeatmapProps) {
  const end = resolveEndDate(endDate)
  const start = startOfDay(subDays(end, Math.max(days, 1) - 1))
  const gridStart = startOfWeek(start, { weekStartsOn })
  const gridEnd = endOfWeek(end, { weekStartsOn })

  const countMap = buildCountMap(data)
  const colors = COLOR_SCHEMES[colorScheme]
  const sizeStyles = SIZE_STYLES[size]

  const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd })
  const weeks: HeatmapCell[][] = []

  for (let i = 0; i < allDays.length; i += 7) {
    const weekDays = allDays.slice(i, i + 7)
    weeks.push(
      weekDays.map(day => {
        const key = toDateKey(day)
        const inRange = day >= start && day <= end
        const count = inRange ? (countMap.get(key) ?? 0) : 0
        return {
          date: key,
          count,
          level: inRange ? getLevel(count, thresholds) : 0,
          inRange,
        }
      }),
    )
  }

  let total = 0
  for (const week of weeks) {
    for (const cell of week) {
      if (cell.inRange) total += cell.count
    }
  }

  const monthLabels = weeks.map((week, weekIndex) => {
    const firstInRange = week.find(cell => cell.inRange) ?? week[0]
    if (!firstInRange) return null

    const month = format(parseISO(firstInRange.date), 'MMM')
    if (weekIndex === 0) return month

    const prev = weeks[weekIndex - 1]?.[0]
    if (!prev) return month
    const prevMonth = format(parseISO(prev.date), 'MMM')
    return month === prevMonth ? null : month
  })

  const weekdayOrder = weekStartsOn === 1 ? [1, 2, 3, 4, 5, 6, 0] : [0, 1, 2, 3, 4, 5, 6]
  const visibleWeekdays = new Set([1, 3, 5])

  const resolvedTotal =
    typeof totalLabel === 'function' ? totalLabel(total) : (totalLabel ?? defaultTotalLabel(total))

  const weekCount = Math.max(weeks.length, 1)
  const gridStyle: CSSProperties = {
    gridTemplateColumns: `repeat(${weekCount}, minmax(${sizeStyles.minCell}px, 1fr))`,
    gap: sizeStyles.gapPx,
  }

  const cellClassName = cn('aspect-square w-full', sizeStyles.radius)

  return (
    <TooltipProvider delayDuration={80}>
      <div data-slot="activity-heatmap" className={cn('flex w-full flex-col gap-2', className)}>
        {!hideTotal ? <p className="text-xs text-muted-foreground">{resolvedTotal}</p> : null}

        <div className="flex w-full min-w-0">
          {showWeekdayLabels ? (
            <div
              className={cn(
                'flex shrink-0 flex-col justify-end',
                sizeStyles.dayGutter,
                sizeStyles.gap,
                showMonthLabels && 'pt-4',
              )}
            >
              {weekdayOrder.map(weekday => (
                <span
                  key={weekday}
                  className={cn(
                    cellClassName,
                    sizeStyles.label,
                    'flex items-center justify-end pr-1.5 text-muted-foreground',
                    !visibleWeekdays.has(weekday) && 'opacity-0',
                  )}
                >
                  {WEEKDAY_LABELS[weekday]}
                </span>
              ))}
            </div>
          ) : null}

          <div className="min-w-0 flex-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex w-full min-w-full flex-col gap-1.5">
              {showMonthLabels ? (
                <div className="grid w-full" style={gridStyle}>
                  {monthLabels.map((label, index) => (
                    <div
                      key={`month-${index}`}
                      className={cn(
                        sizeStyles.label,
                        'relative h-3 overflow-visible text-muted-foreground',
                      )}
                    >
                      {label ? (
                        <span className="absolute top-0 left-0 whitespace-nowrap">{label}</span>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="grid w-full" style={gridStyle}>
                {weeks.map((week, weekIndex) => (
                  <div key={`week-${weekIndex}`} className={cn('flex min-w-0 flex-col', sizeStyles.gap)}>
                    {week.map(cell => {
                      if (!cell.inRange) {
                        return <div key={cell.date} aria-hidden className={cn(cellClassName, 'bg-transparent')} />
                      }

                      const tooltip =
                        renderTooltip?.({
                          date: cell.date,
                          count: cell.count,
                          level: cell.level,
                        }) ?? defaultTooltip(cell)

                      return (
                        <Tooltip key={cell.date}>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              aria-label={typeof tooltip === 'string' ? tooltip : defaultTooltip(cell)}
                              className={cn(
                                cellClassName,
                                colors[cell.level],
                                'outline-none transition-colors duration-75',
                                'hover:z-10 hover:ring-1 hover:ring-foreground/25',
                                'focus-visible:z-10 focus-visible:ring-1 focus-visible:ring-ring',
                              )}
                            />
                          </TooltipTrigger>
                          <TooltipContent side="top" sideOffset={6}>
                            {tooltip}
                          </TooltipContent>
                        </Tooltip>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {showLegend ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
              {hideTotal ? <span className="truncate">{resolvedTotal}</span> : null}
              {metaLabel ? (
                <>
                  {hideTotal ? <span className="text-border" aria-hidden>
                    ·
                  </span> : null}
                  <span className="truncate">{metaLabel}</span>
                </>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
              <span className={sizeStyles.label}>{lessLabel}</span>
              {[0, 1, 2, 3, 4].map(level => (
                <div
                  key={level}
                  className={cn('size-2.5', sizeStyles.radius, colors[level as ActivityLevel])}
                  aria-hidden
                />
              ))}
              <span className={sizeStyles.label}>{moreLabel}</span>
            </div>
          </div>
        ) : null}
      </div>
    </TooltipProvider>
  )
}

export { ActivityHeatmap, getLevel, DEFAULT_THRESHOLDS }
