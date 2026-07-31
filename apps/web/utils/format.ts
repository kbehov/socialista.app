import { isValidIanaTimezone } from '@/utils/timezone'
import { formatInTimeZone, getTimezoneOffset } from 'date-fns-tz'
const MB = 1024 * 1024
const GB = MB * 1024

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes <= 0) return '0 B'

  const k = 1024
  const dm = Math.max(0, decimals)
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']

  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1)
  const value = bytes / k ** i

  return `${Number.parseFloat(value.toFixed(dm))} ${sizes[i]}`
}

export function formatFileCount(count: number): string {
  if (count === 1) return '1 file'
  return `${count} files`
}

export function formatItemCount(count: number): string {
  if (count === 1) return '1 item'
  return `${count} items`
}

/** Formats storage as MB or GB only (no B/KB). */
export function formatStorageSize(bytes: number, decimals = 1): string {
  if (bytes <= 0) return '0 MB'

  const dm = Math.max(0, decimals)

  if (bytes >= GB) {
    return `${Number.parseFloat((bytes / GB).toFixed(dm))} GB`
  }

  return `${Number.parseFloat((bytes / MB).toFixed(dm))} MB`
}

const RELATIVE_TIME_DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, unit: 'second' },
  { amount: 60, unit: 'minute' },
  { amount: 24, unit: 'hour' },
  { amount: 7, unit: 'day' },
  { amount: 4.34524, unit: 'week' },
  { amount: 12, unit: 'month' },
  { amount: Number.POSITIVE_INFINITY, unit: 'year' },
]

export function formatRelativeTime(date: Date | string | number): string {
  const target = new Date(date)
  const diffSeconds = Math.round((target.getTime() - Date.now()) / 1000)
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  let duration = diffSeconds
  for (const { amount, unit } of RELATIVE_TIME_DIVISIONS) {
    if (Math.abs(duration) < amount) {
      return formatter.format(Math.round(duration), unit)
    }
    duration /= amount
  }

  return formatter.format(0, 'second')
}

export function formatCost(cost: number | undefined): string {
  if (typeof cost !== 'number' || Number.isNaN(cost)) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cost)
}

export function formatDuration(ms: number | undefined): string {
  if (!ms || ms <= 0) return '—'
  if (ms < 1000) return `${Math.round(ms)}ms`
  const seconds = ms / 1000
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)
  return `${minutes}m ${remainingSeconds}s`
}

export function formatModelCost(cost: number, costUnit: string): string {
  const credits = `${cost}$`
  if (costUnit === 'generation') {
    return credits
  }
  return `${credits} / ${costUnit}`
}

export function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]!.charAt(0)}${parts[1]!.charAt(0)}`.toUpperCase()
}

export function formatTimezoneCity(timezone: string): string {
  const parts = timezone.split('/')
  const city = parts[parts.length - 1]
  return city?.replaceAll('_', ' ') ?? timezone
}

export function formatTimezoneOffset(timezone: string, at: Date = new Date()): string {
  if (!isValidIanaTimezone(timezone)) return 'UTC'

  const offsetMs = getTimezoneOffset(timezone, at)
  const totalMinutes = Math.round(offsetMs / 60_000)
  const sign = totalMinutes >= 0 ? '+' : '-'
  const absMinutes = Math.abs(totalMinutes)
  const hours = Math.floor(absMinutes / 60)
  const minutes = absMinutes % 60

  if (minutes === 0) return `UTC${sign}${hours}`
  return `UTC${sign}${hours}:${String(minutes).padStart(2, '0')}`
}

export function formatTimezoneLocalTime(timezone: string, at: Date = new Date()): string {
  if (!isValidIanaTimezone(timezone)) return ''
  return formatInTimeZone(at, timezone, 'h:mm a')
}

export function formatTimezoneLabel(timezone: string, at: Date = new Date()): string {
  return `${formatTimezoneCity(timezone)} (${formatTimezoneOffset(timezone, at)})`
}

export function formatTimezoneDetail(timezone: string, at: Date = new Date()): string {
  const localTime = formatTimezoneLocalTime(timezone, at)
  return localTime
    ? `${formatTimezoneCity(timezone)} · ${formatTimezoneOffset(timezone, at)} · ${localTime}`
    : formatTimezoneLabel(timezone, at)
}

export function formatPostDateTime(value: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export function formatPostTime(value: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

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

export function trendFromPercent(value: number | null | undefined):
  | {
      value: string
      direction: TrendDirection
    }
  | undefined {
  if (value === null || value === undefined || !Number.isFinite(value)) return undefined
  return {
    value: formatPercent(value),
    direction: value > 0 ? 'up' : value < 0 ? 'down' : 'neutral',
  }
}
export function formatAbsoluteDate(value: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}
