'use client'

import { SocialPlatformIcon } from '@/components/icons/social-platform-icon'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { cn } from '@/lib/utils'
import { formatCount } from '@/utils/format'
import type { SocialProvider } from '@socialista/types'
import { useInView, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { startTransition, useEffect, useId, useRef, useState } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

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
  value: { label: 'Value', color: 'var(--chart-1)' },
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
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-2 py-0.5 text-[11px] font-medium tracking-[-0.01em]">
      <span className="relative flex size-1.5" aria-hidden>
        <span className="absolute inset-0 animate-ping rounded-full bg-success opacity-50 motion-reduce:animate-none" />
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
        'flex min-w-0 flex-col gap-1 px-3.5 py-3.5 text-left transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-inset',
        selected
          ? 'bg-[color-mix(in_oklch,var(--muted)_70%,var(--background))]'
          : 'bg-background hover:bg-muted/20',
      )}
    >
      <span className={cn('text-[11px] font-medium', selected ? 'text-foreground' : 'text-muted-foreground')}>
        {label}
      </span>
      <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <LiveCount
          value={value}
          format={metric}
          className="text-xl font-semibold tracking-[-0.03em] text-foreground"
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
      className="aspect-auto h-[200px] w-full sm:h-[228px]"
      initialDimension={{ width: 640, height: 228 }}
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
      <p className="text-[11px] font-medium text-muted-foreground">Channel mix</p>
      <ul className="mt-3 space-y-2.5">
        {CHANNELS.map(channel => (
          <li key={channel.provider} className="flex items-center gap-2.5">
            <SocialPlatformIcon provider={channel.provider} size={12} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[12px] font-medium">{channel.label}</span>
                <span className="text-[11px] tabular-nums text-muted-foreground">{channel.share}%</span>
              </div>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-foreground/70" style={{ width: `${channel.share}%` }} />
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
      <p className="text-[11px] font-medium text-muted-foreground">Top this week</p>
      <ul className="mt-3 space-y-1">
        {creatives.map((creative, index) => (
          <li
            key={creative.title}
            className={cn(
              'flex items-center gap-2.5 rounded-lg px-1.5 py-1.5',
              index === 0 && 'bg-muted/40',
            )}
          >
            <SocialPlatformIcon provider={creative.provider} size={12} />
            <span className="min-w-0 flex-1 truncate text-[12px] font-medium">{creative.title}</span>
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
      className="overflow-hidden rounded-[1.75rem] border border-[color-mix(in_oklch,var(--foreground)_6%,var(--border))] bg-background shadow-[0_1px_2px_color-mix(in_oklch,var(--foreground)_4%,transparent),0_18px_40px_-18px_color-mix(in_oklch,var(--foreground)_12%,transparent)]"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border/50 px-4 py-3.5 sm:px-5">
        <div className="min-w-0">
          <p className="text-[13px] font-medium tracking-tight">Workspace analytics</p>
          <p className="text-xs text-muted-foreground">Last 7 days · sample workspace</p>
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

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_17.5rem]">
        <div className="relative min-w-0 px-3 pb-4 pt-4 sm:px-4 sm:pt-5">
          <div className="mb-3 flex items-end justify-between gap-3 px-1">
            <div>
              <p className="text-[13px] font-medium tracking-tight">{chartCopy.title}</p>
              <p className="text-xs text-muted-foreground">{chartCopy.description}</p>
            </div>
            <p className="hidden rounded-full border border-border/60 bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground sm:block">
              Winning post · UGC hook v2
            </p>
          </div>
          <AnalyticsChart metric={metric} series={series} />
        </div>

        <aside className="flex flex-col gap-6 border-t border-border/50 px-4 py-4 sm:px-5 lg:border-l lg:border-t-0">
          <TopCreatives creatives={creatives} />
          <ChannelMix />
        </aside>
      </div>
    </div>
  )
}
