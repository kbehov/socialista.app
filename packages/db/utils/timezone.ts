/**
 * IANA timezone helpers for account/workspace scheduling.
 * Prefer names like `Europe/Sofia` — never fixed offsets (`GMT+2`, `EST`, `+02:00`).
 */
import { isValid as isValidDate } from 'date-fns'
import { formatInTimeZone, getTimezoneOffset, toZonedTime } from 'date-fns-tz'

/** Fixed-offset / abbreviation strings that are not IANA zones. */
const FIXED_OFFSET_PATTERN = /^(?:GMT|UTC)?[+-]\d{1,2}(?::?\d{2})?$/i
const ABBREVIATION_PATTERN = /^(?:EST|EDT|CST|CDT|MST|MDT|PST|PDT|CET|CEST|BST|IST)$/i

export function isValidIanaTimezone(timezone: string): boolean {
  if (!timezone) return false
  const trimmed = timezone.trim()
  if (!trimmed || FIXED_OFFSET_PATTERN.test(trimmed) || ABBREVIATION_PATTERN.test(trimmed)) {
    return false
  }
  return Number.isFinite(getTimezoneOffset(trimmed))
}

/** Trim and validate; throws when missing or not a valid IANA zone. */
export function assertValidTimezone(timezone: string): string {
  const trimmed = timezone.trim()
  if (!trimmed || !isValidIanaTimezone(trimmed)) {
    throw new Error('Valid IANA timezone is required')
  }
  return trimmed
}

/**
 * Prefer an explicit account timezone, otherwise fall back to the workspace default.
 * Always returns a validated IANA string.
 */
export function resolveAccountTimezone(
  input?: string | null,
  workspaceTimezone?: string | null,
): string {
  const candidate = input?.trim() || workspaceTimezone?.trim()
  if (!candidate) {
    throw new Error('Valid IANA timezone is required')
  }
  return assertValidTimezone(candidate)
}

function toDate(date: Date | number | string): Date {
  return typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
}

/** Format a UTC date in an account/workspace IANA timezone. */
export function formatInTimezone(
  date: Date | number | string,
  timezone: string,
  pattern = "yyyy-MM-dd'T'HH:mm:ssXXX",
): string {
  const zone = assertValidTimezone(timezone)
  const value = toDate(date)
  if (!isValidDate(value)) {
    throw new Error('Valid date is required')
  }
  return formatInTimeZone(value, zone, pattern)
}

/** Convert a UTC instant to a Date representing local wall-clock time in the given zone. */
export function toAccountZonedTime(date: Date | number | string, timezone: string): Date {
  const zone = assertValidTimezone(timezone)
  const value = toDate(date)
  if (!isValidDate(value)) {
    throw new Error('Valid date is required')
  }
  return toZonedTime(value, zone)
}
