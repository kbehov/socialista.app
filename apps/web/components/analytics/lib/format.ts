export function formatCount(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

export function formatSignedCount(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  const formatted = formatCount(Math.abs(value))
  if (value > 0) return `+${formatted}`
  if (value < 0) return `-${formatted}`
  return formatted
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

export function formatRate(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—'
  return `${(value * 100).toFixed(2)}%`
}

export type TrendDirection = 'up' | 'down' | 'neutral'

export function trendFromPercent(value: number | null | undefined): {
  value: string
  direction: TrendDirection
} | undefined {
  if (value === null || value === undefined || !Number.isFinite(value)) return undefined
  return {
    value: formatPercent(value),
    direction: value > 0 ? 'up' : value < 0 ? 'down' : 'neutral',
  }
}
