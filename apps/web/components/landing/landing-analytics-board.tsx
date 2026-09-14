'use client'

import { SocialPlatformIcon } from '@/components/icons/social-platform-icon'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { cn } from '@/lib/utils'
import { formatCount } from '@/utils/format'
import type { SocialProvider } from '@socialista/types'
import { useInView, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { startTransition, useEffect, useId, useRef, useState } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { landingPanel } from './landing-classes'

type ChartMetric = 'reach' | 'engagement' | 'views' | 'rate'

type SeriesPoint = {
  day: string
  reach: number
  engagement: number
  views: number
  rate: number
}

type CreativeRow = {
  title: string
  provider: SocialProvider
  views: number
}

type ChannelShare = {
  provider: SocialProvider
  label: string
  share: number
}

const METRICS: { id: ChartMetric; label: string; trend: string }[] = [
  { id: 'reach', label: 'Reach', trend: '+12.4%' },
  { id: 'engagement', label: 'Engagement', trend: '+8.1%' },
  { id: 'views', label: 'Views', trend: '+15.6%' },
  { id: 'rate', label: 'Eng. rate', trend: '+0.4pt' },
]

const INITIAL_SERIES: SeriesPoint[] = [
  { day: 'Mon', reach: 18400, engagement: 740, views: 24600, rate: 4.1 },
  { day: 'Tue', reach: 22100, engagement: 910, views: 28800, rate: 4.4 },
  { day: 'Wed', reach: 19800, engagement: 820, views: 26400, rate: 4.2 },
  { day: 'Thu', reach: 27600, engagement: 1280, views: 35200, rate: 4.9 },
  { day: 'Fri', reach: 24300, engagement: 1040, views: 31100, rate: 4.6 },
  { day: 'Sat', reach: 31200, engagement: 1560, views: 41800, rate: 5.2 },
  { day: 'Sun', reach: 28900, engagement: 1390, views: 38600, rate: 5.0 },
]

const INITIAL_CREATIVES: CreativeRow[] = [
  { title: 'UGC hook v2', provider: 'tiktok', views: 41820 },
  { title: 'Summer launch carousel', provider: 'instagram', views: 27640 },
  { title: 'Static ad — mug', provider: 'instagram', views: 15480 },
]

const CHANNELS: ChannelShare[] = [
  { provider: 'instagram', label: 'Instagram', share: 42 },
  { provider: 'tiktok', label: 'TikTok', share: 31 },
  { provider: 'linkedin', label: 'LinkedIn', share: 16 },
  { provider: 'facebook', label: 'Facebook', share: 11 },
]

const CHART_COPY: Record<ChartMetric, { title: string; description: string }> = {
  reach: { title: 'Reach', description: 'How far posts traveled this week.' },
  engagement: { title: 'Engagement', description: 'Likes, comments, and saves over time.' },
  views: { title: 'Views', description: 'Impressions across connected channels.' },
  rate: { title: 'Eng. rate', description: 'Engagement rate, day by day.' },
}

const CHART_MARGIN = { top: 8, right: 8, left: 0, bottom: 0 } as const

const CHART_CONFIG: ChartConfig = {
  value: { label: 'Value', color: 'var(--accent-orange)' },
}

const TICK_MS = 2800

type LiveFormat = ChartMetric | 'count'

function formatLive(format: LiveFormat, value: number) {
  if (format === 'rate') return `${value.toFixed(1)}%`
  return formatCount(Math.round(value))
}

function formatAxis(metric: ChartMetric, value: number) {
  if (metric === 'rate') return `${value.toFixed(1)}%`
  if (value >= 10_000) return formatCount(Math.round(value))
  return new Intl.NumberFormat('en-US').format(Math.round(value))
}

function totalsFromSeries(series: SeriesPoint[]) {
  let reach = 0
  let engagement = 0
  let views = 0

  for (const point of series) {
    reach += point.reach
    engagement += point.engagement
    views += point.views
  }

  const last = series[series.length - 1]
  return {
    reach,
    engagement,
    views,
    rate: last?.rate ?? 0,
  }
}

function LiveCount({
  value,
  format,
  className,
}: {
  value: number
  format: LiveFormat
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display] = useState(() => formatLive(format, value))
  const reduceMotion = useReducedMotion()
  const motionValue = useMotionValue(value)
  const springValue = useSpring(motionValue, { damping: 28, stiffness: 220, mass: 0.6 })

  useEffect(() => {
    if (reduceMotion) {
      if (ref.current) ref.current.textContent = formatLive(format, value)
      return
    }
    motionValue.set(value)
  }, [format, motionValue, reduceMotion, value])

  useEffect(() => {
    if (reduceMotion) return
    const unsubscribe = springValue.on('change', latest => {
      if (ref.current) ref.current.textContent = formatLive(format, latest)
    })
    return unsubscribe
  }, [format, reduceMotion, springValue])

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {display}
    </span>
  )
}

function LiveBadge() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[color-mix(in_oklch,var(--foreground)_8%,var(--border))] bg-[color-mix(in_oklch,var(--muted)_35%,var(--background))] px-2.5 py-1 text-[11px] font-medium tracking-[-0.01em] text-foreground/90">
      <span className="relative flex size-1.5" aria-hidden>
        <span className="absolute inset-0 animate-ping rounded-full bg-success opacity-45 motion-reduce:animate-none" />
        <span className="relative size-1.5 rounded-full bg-success" />
      </span>
      Live
    </span>
  )
}

function KpiButton({
  label,
  value,
  trend,
  metric,
  selected,
  onSelect,
}: {
  label: string
  value: number
  trend: string
  metric: ChartMetric
  selected: boolean
  onSelect: (metric: ChartMetric) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(metric)}
      aria-pressed={selected}
      className={cn(
        'relative flex min-w-0 flex-col gap-1 px-3.5 py-3.5 text-left transition-[background-color,box-shadow] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-inset',
        selected
          ? 'bg-[color-mix(in_oklch,var(--muted)_55%,var(--background))] shadow-[inset_0_1px_0_color-mix(in_oklch,var(--foreground)_6%,transparent)]'
          : 'bg-background hover:bg-muted/25',
      )}
    >
      {selected ? (
        <span
          aria-hidden
          className="absolute inset-x-3.5 top-0 h-0.5 rounded-full bg-foreground/80 sm:inset-x-4"
        />
      ) : null}
      <span className={cn('text-[11px] font-medium', selected ? 'text-foreground' : 'text-muted-foreground')}>
        {label}
      </span>
      <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <LiveCount
          value={value}
          format={metric}
          className="text-[1.375rem] font-semibold tracking-[-0.03em] text-foreground sm:text-xl"
        />
        <span className="text-[11px] font-medium tabular-nums text-success">{trend}</span>
      </span>
    </button>
  )
}

function AnalyticsChart({ metric, series }: { metric: ChartMetric; series: SeriesPoint[] }) {
  const rawId = useId()
  const gradientId = `landing-analytics-${rawId.replace(/:/g, '')}`
  const reduceMotion = useReducedMotion()
  const activeLabel = METRICS.find(item => item.id === metric)?.label ?? 'Reach'
  const chartData = series.map(point => ({
    day: point.day,
    value: point[metric],
  }))

  return (
    <ChartContainer
      config={CHART_CONFIG}
      className="aspect-auto h-[208px] w-full sm:h-[236px]"
      initialDimension={{ width: 640, height: 236 }}
    >
      <AreaChart data={chartData} margin={CHART_MARGIN}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-value)" stopOpacity={0.28} />
            <stop offset="100%" stopColor="var(--color-value)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.8} />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={6}
          width={44}
          tickCount={5}
          tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
          tickFormatter={value => formatAxis(metric, typeof value === 'number' ? value : Number(value))}
        />
        <ChartTooltip
          cursor={{ stroke: 'var(--border)', strokeWidth: 1, strokeDasharray: '4 4' }}
          content={
            <ChartTooltipContent
              indicator="line"
              formatter={value => (
                <div className="flex w-full items-center justify-between gap-4">
                  <span className="text-muted-foreground">{activeLabel}</span>
                  <span className="font-mono text-xs font-medium tabular-nums text-foreground">
                    {formatLive(metric, typeof value === 'number' ? value : Number(value))}
                  </span>
                </div>
              )}
            />
          }
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="var(--color-value)"
          strokeWidth={1.75}
          fill={`url(#${gradientId})`}
          isAnimationActive={!reduceMotion}
          animationDuration={500}
          activeDot={{
            r: 3.5,
            strokeWidth: 1.5,
            stroke: 'var(--background)',
            fill: 'var(--color-value)',
          }}
        />
      </AreaChart>
    </ChartContainer>
  )
}

function ChannelMix() {
  return (
    <div>
      <p className="text-[11px] font-medium tracking-[-0.01em] text-muted-foreground">Channel mix</p>
      <ul className="mt-3 space-y-3">
        {CHANNELS.map(channel => (
          <li key={channel.provider} className="flex items-center gap-2.5">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-border/70 bg-background">
              <SocialPlatformIcon provider={channel.provider} size={12} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[12px] font-medium tracking-[-0.01em]">{channel.label}</span>
                <span className="text-[11px] tabular-nums text-muted-foreground">{channel.share}%</span>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted/80">
                <div
                  className="h-full rounded-full bg-[color-mix(in_oklch,var(--accent-orange)_78%,var(--foreground))]"
                  style={{ width: `${channel.share}%` }}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function TopCreatives({ creatives }: { creatives: CreativeRow[] }) {
  return (
    <div>
      <p className="text-[11px] font-medium tracking-[-0.01em] text-muted-foreground">Top this week</p>
      <ul className="mt-3 space-y-0.5">
        {creatives.map((creative, index) => (
          <li
            key={creative.title}
            className={cn(
              'flex items-center gap-2 rounded-[calc(var(--radius)+2px)] px-2 py-2 transition-colors duration-150',
              index === 0 &&
                'border border-[color-mix(in_oklch,var(--foreground)_8%,var(--border))] bg-[color-mix(in_oklch,var(--muted)_40%,var(--background))]',
            )}
          >
            <span
              className={cn(
                'flex size-5 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold tabular-nums',
                index === 0 ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground',
              )}
              aria-hidden
            >
              {index + 1}
            </span>
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-border/70 bg-background">
              <SocialPlatformIcon provider={creative.provider} size={12} />
            </span>
            <span className="min-w-0 flex-1 truncate text-[12px] font-medium tracking-[-0.01em]">{creative.title}</span>
            <LiveCount
              value={creative.views}
              format="count"
              className="text-[11px] font-medium tracking-[-0.02em] text-muted-foreground"
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

export function LandingAnalyticsBoard() {
  const boardRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const inView = useInView(boardRef, { amount: 0.28 })
  const [metric, setMetric] = useState<ChartMetric>('engagement')
  const [series, setSeries] = useState(INITIAL_SERIES)
  const [creatives, setCreatives] = useState(INITIAL_CREATIVES)
  const totals = totalsFromSeries(series)
  const chartCopy = CHART_COPY[metric]

  useEffect(() => {
    if (reduceMotion || !inView) return

    const id = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return

      startTransition(() => {
        setSeries(current => {
          const last = current[current.length - 1]
          if (!last) return current
          return [
            ...current.slice(0, -1),
            {
              ...last,
              reach: last.reach + 48,
              engagement: last.engagement + 6,
              views: last.views + 71,
              rate: Math.min(6.2, Number((last.rate + 0.01).toFixed(2))),
            },
          ]
        })
        setCreatives(current =>
          current.map((row, index) =>
            index === 0 ? { ...row, views: row.views + 14 } : index === 1 ? { ...row, views: row.views + 5 } : row,
          ),
        )
      })
    }, TICK_MS)

    return () => window.clearInterval(id)
  }, [inView, reduceMotion])

  return (
    <div
      ref={boardRef}
      className={cn('overflow-hidden', landingPanel)}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border/50 px-4 py-4 sm:px-6 sm:py-4">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold tracking-[-0.02em]">Workspace analytics</p>
          <p className="mt-0.5 text-xs leading-snug text-muted-foreground">Last 7 days · sample workspace</p>
        </div>
        <LiveBadge />
      </div>

      <div className="grid grid-cols-2 divide-x divide-y divide-border/50 border-b border-border/50 lg:grid-cols-4 lg:divide-y-0">
        {METRICS.map(item => (
          <KpiButton
            key={item.id}
            metric={item.id}
            label={item.label}
            trend={item.trend}
            value={totals[item.id]}
            selected={metric === item.id}
            onSelect={setMetric}
          />
        ))}
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="relative min-w-0 px-3 pb-5 pt-4 sm:px-5 sm:pb-6 sm:pt-5">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-3 top-12 bottom-4 rounded-[1.25rem] bg-[radial-gradient(ellipse_at_50%_100%,color-mix(in_oklch,var(--accent-orange)_10%,transparent)_0%,transparent_62%)] sm:inset-x-5"
          />
          <div className="relative mb-4 flex flex-col gap-3 px-0.5 sm:mb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[13px] font-semibold tracking-[-0.02em]">{chartCopy.title}</p>
              <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{chartCopy.description}</p>
            </div>
            <p className="w-fit rounded-full border border-[color-mix(in_oklch,var(--foreground)_8%,var(--border))] bg-[color-mix(in_oklch,var(--muted)_30%,var(--background))] px-2.5 py-1 text-[11px] font-medium tracking-[-0.01em] text-muted-foreground">
              Winning post · UGC hook v2
            </p>
          </div>
          <AnalyticsChart metric={metric} series={series} />
        </div>

        <aside className="flex flex-col justify-center gap-7 border-t border-border/50 px-4 py-5 sm:px-6 lg:border-l lg:border-t-0 lg:py-6">
          <TopCreatives creatives={creatives} />
          <ChannelMix />
        </aside>
      </div>
    </div>
  )
}
