import { formatInTimeZone, getTimezoneOffset } from 'date-fns-tz'

/** Frequently used IANA zones — shown first in the selector. */
export const COMMON_TIMEZONE_VALUES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Sofia',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
] as const

const FIXED_OFFSET_PATTERN = /^(?:GMT|UTC)?[+-]\d{1,2}(?::?\d{2})?$/i
const ABBREVIATION_PATTERN =
  /^(?:EST|EDT|CST|CDT|MST|MDT|PST|PDT|CET|CEST|BST|IST)$/i

export type TimezoneOption = {
  value: string
  city: string
  region: string
  searchValue: string
}

export function isValidIanaTimezone(timezone: string): boolean {
  const trimmed = timezone.trim()
  if (!trimmed || FIXED_OFFSET_PATTERN.test(trimmed) || ABBREVIATION_PATTERN.test(trimmed)) {
    return false
  }
  return Number.isFinite(getTimezoneOffset(trimmed))
}

function getIanaTimezones(): string[] {
  if (typeof Intl !== 'undefined' && 'supportedValuesOf' in Intl) {
    return Intl.supportedValuesOf('timeZone').filter(isValidIanaTimezone)
  }
  return [...COMMON_TIMEZONE_VALUES]
}

let cachedTimezoneOptions: TimezoneOption[] | null = null

export function getTimezoneOptions(): TimezoneOption[] {
  if (cachedTimezoneOptions) return cachedTimezoneOptions

  cachedTimezoneOptions = getIanaTimezones()
    .map(timezone => {
      const [region = 'Other', ...rest] = timezone.split('/')
      const city = rest.length > 0 ? rest.join('/').replaceAll('_', ' ') : timezone

      return {
        value: timezone,
        city,
        region,
        searchValue: `${timezone} ${city} ${region}`.toLowerCase(),
      }
    })
    .sort((a, b) => {
      const regionCompare = a.region.localeCompare(b.region)
      if (regionCompare !== 0) return regionCompare
      return a.city.localeCompare(b.city)
    })

  return cachedTimezoneOptions
}

export function groupTimezonesByRegion(
  options: TimezoneOption[],
): { region: string; options: TimezoneOption[] }[] {
  const groups = new Map<string, TimezoneOption[]>()

  for (const option of options) {
    const list = groups.get(option.region) ?? []
    list.push(option)
    groups.set(option.region, list)
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([region, regionOptions]) => ({ region, options: regionOptions }))
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
