/**
 * IANA timezone helpers for account/workspace scheduling.
 * Prefer names like `Europe/Sofia` — never fixed offsets (`GMT+2`, `EST`).
 */

export function isValidIanaTimezone(timezone: string): boolean {
  if (!timezone) return false
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone })
    return true
  } catch {
    return false
  }
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
