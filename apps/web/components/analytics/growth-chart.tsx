'use client'

import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'

import { DashboardSegment, DashboardSegmentButton } from '@/components/dashboard/dashboard-segment'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { cn } from '@/lib/utils'
import type { AnalyticsGrowthResponse, AnalyticsRange, AnalyticsSeriesPoint, SocialProvider } from '@socialista/types'

import { formatCount } from '@/utils/format'
import { AnalyticsEmpty } from './analytics-empty'
import { AnalyticsSection } from './analytics-section'

type ChartMetric = 'engagement' | 'followers' | 'reach' | 'views'

const METRIC_TABS: { id: ChartMetric; label: string }[] = [
  { id: 'engagement', label: 'Engagement' },
  { id: 'followers', label: 'Followers' },
  { id: 'reach', label: 'Reach' },
  { id: 'views', label: 'Views' },
]

const NEUTRAL_CHART_COLOR = 'var(--chart-1)'

const METRIC_CHART_CONFIG: Record<ChartMetric, ChartConfig> = {
  engagement: {
    value: { label: 'Engagement', color: NEUTRAL_CHART_COLOR },
  },
  followers: {
    value: { label: 'Followers', color: NEUTRAL_CHART_COLOR },
  },
  reach: {
    value: { label: 'Reach', color: NEUTRAL_CHART_COLOR },
  },
  views: {
    value: { label: 'Views', color: NEUTRAL_CHART_COLOR },
  },
}

const CHART_MARGIN = { top: 8, right: 12, left: 0, bottom: 0 } as const

/** Lean series payload used by per-account analytics (no byProvider). */
export type GrowthChartSeriesData = {
  range: AnalyticsRange
  series: AnalyticsSeriesPoint[]
}

export type GrowthChartProps = {
  data: AnalyticsGrowthResponse | GrowthChartSeriesData
  /** When set, chart the provider series instead of workspace totals. */
  provider?: SocialProvider | 'all'
  className?: string
}

function isGrowthResponse(data: GrowthChartProps['data']): data is AnalyticsGrowthResponse {
  return 'byProvider' in data
}

function parseLocalDate(date: string) {
  return new Date(`${date}T12:00:00`)
}

function formatAxisDate(date: string, range: AnalyticsRange) {
  try {
    const d = parseLocalDate(date)
    if (range === 'monthly') {
      return new Intl.DateTimeFormat('en-US', { month: 'short' }).format(d)
    }
    if (range === 'weekly') {
      return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d)
    }
    return new Intl.DateTimeFormat('en-US', { weekday: 'short', day: 'numeric' }).format(d)
  } catch {
    return date
  }
}

function formatTooltipDate(date: string, range: AnalyticsRange) {
  try {
    const d = parseLocalDate(date)
    if (range === 'monthly') {
      return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(d)
    }
    if (range === 'weekly') {
      return `Week of ${new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(d)}`
    }
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d)
  } catch {
    return date
  }
}

function toChartData(series: AnalyticsSeriesPoint[], metric: ChartMetric, range: AnalyticsRange) {
  return series.map(point => ({
    date: point.date,
    label: formatAxisDate(point.date, range),
    value: point[metric] ?? 0,
  }))
}

function resolveSeries(
  data: AnalyticsGrowthResponse | GrowthChartSeriesData,
  provider?: SocialProvider | 'all',
) {
  if (!isGrowthResponse(data) || !provider || provider === 'all') return data.series
  return data.byProvider.find(group => group.provider === provider)?.series ?? []
}

function yDomain(values: number[]): [number, number] {
  const max = Math.max(0, ...values)
  if (max === 0) return [0, 1]
  // Round up to a clean tick ceiling so series never kiss the top edge.
  const magnitude = 10 ** Math.floor(Math.log10(max))
  const step = magnitude >= 1 ? magnitude : 1
  const ceiling = Math.ceil(max / step) * step
  return [0, ceiling === max ? ceiling + step : ceiling]
}

function GrowthChart({ data, provider = 'all', className }: GrowthChartProps) {
  const [metric, setMetric] = useState<ChartMetric>('engagement')
  const range = data.range
  const useLine = range === 'monthly'
  const series = resolveSeries(data, provider)
  const chartData = toChartData(series, metric, range)
  const hasData = chartData.some(point => point.value > 0)
  const chartConfig = METRIC_CHART_CONFIG[metric]
  const activeLabel = METRIC_TABS.find(tab => tab.id === metric)?.label ?? 'Engagement'
  const domain = yDomain(chartData.map(point => point.value))
  const barSize = chartData.length <= 8 ? 36 : chartData.length <= 14 ? 28 : 20
  const minTickGap = range === 'daily' ? 20 : range === 'weekly' ? 24 : 28

  return (
    <AnalyticsSection
      className={cn('h-full', className)}
      title="Growth"
      description="Audience and engagement over time."
      action={
        <DashboardSegment label="Chart metric">
          {METRIC_TABS.map(tab => {
            const active = tab.id === metric
            return (
              <DashboardSegmentButton key={tab.id} active={active} onClick={() => setMetric(tab.id)}>
                {tab.label}
              </DashboardSegmentButton>
            )
          })}
        </DashboardSegment>
      }
    >
      {!hasData ? (
        <AnalyticsEmpty
          title="No growth data"
          description="Publish and sync accounts to see trends for this range."
          minHeightClassName="min-h-[220px]"
        />
      ) : useLine ? (
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[220px] w-full"
          initialDimension={{ width: 600, height: 220 }}
        >
          <LineChart data={chartData} margin={CHART_MARGIN}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              minTickGap={minTickGap}
              interval="preserveStartEnd"
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              width={44}
              domain={domain}
              allowDecimals={false}
              tickCount={5}
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
              tickFormatter={value => formatCount(typeof value === 'number' ? value : Number(value))}
            />
            <ChartTooltip
              cursor={{ stroke: 'var(--border)', strokeWidth: 1, strokeDasharray: '4 4' }}
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelFormatter={(_, payload) => {
                    const date = payload?.[0]?.payload?.date
                    return typeof date === 'string' ? formatTooltipDate(date, range) : activeLabel
                  }}
                  formatter={value => (
                    <div className="flex w-full items-center justify-between gap-4">
                      <span className="text-muted-foreground">{activeLabel}</span>
                      <span className="font-mono text-xs font-medium tabular-nums text-foreground">
                        {formatCount(typeof value === 'number' ? value : Number(value))}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--color-value)"
              strokeWidth={2}
              isAnimationActive={false}
              dot={{
                r: 3.5,
                strokeWidth: 2,
                stroke: 'var(--background)',
                fill: 'var(--color-value)',
              }}
              activeDot={{
                r: 5,
                strokeWidth: 2,
                stroke: 'var(--background)',
                fill: 'var(--color-value)',
              }}
            />
          </LineChart>
        </ChartContainer>
      ) : (
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[220px] w-full"
          initialDimension={{ width: 600, height: 220 }}
        >
          <BarChart data={chartData} margin={CHART_MARGIN} barCategoryGap="18%">
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              minTickGap={minTickGap}
              interval="preserveStartEnd"
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              width={44}
              domain={domain}
              allowDecimals={false}
              tickCount={5}
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
              tickFormatter={value => formatCount(typeof value === 'number' ? value : Number(value))}
            />
            <ChartTooltip
              cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelFormatter={(_, payload) => {
                    const date = payload?.[0]?.payload?.date
                    return typeof date === 'string' ? formatTooltipDate(date, range) : activeLabel
                  }}
                  formatter={value => (
                    <div className="flex w-full items-center justify-between gap-4">
                      <span className="text-muted-foreground">{activeLabel}</span>
                      <span className="font-mono text-xs font-medium tabular-nums text-foreground">
                        {formatCount(typeof value === 'number' ? value : Number(value))}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Bar
              dataKey="value"
              fill="var(--color-value)"
              radius={[4, 4, 0, 0]}
              maxBarSize={barSize}
              isAnimationActive={false}
            />
          </BarChart>
        </ChartContainer>
      )}
    </AnalyticsSection>
  )
}

export { GrowthChart }
