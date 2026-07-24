import type { AppContext } from '@/middlewares/auth.middleware.js'
import { HttpError } from '@/utils/http-response.js'
import { isValidId } from '@socialista/db'
import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

export type AuthContext = Context<AppContext>

export const parseParamId = (id: string | undefined, label = 'ID'): string => {
  if (!id || !isValidId(id)) {
    throw new HttpError(400, `Invalid ${label}`)
  }
  return id
}

export const getQueryString = (url: string): string => url.split('?')[1] ?? ''

export const assertHasUpdates = (updates: object): void => {
  if (Object.keys(updates).length === 0) {
    throw new HttpError(400, 'No valid fields to update')
  }
}

/** Trimmed non-empty string, or `undefined` when missing/blank. */
export const optionalTrimmedString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed || undefined
}

/** Required trimmed string — throws when missing or blank. */
export const requireTrimmedString = (value: unknown, label: string): string => {
  const trimmed = typeof value === 'string' ? value.trim() : ''
  if (!trimmed) {
    throw new HttpError(400, `${label} is required`)
  }
  return trimmed
}

/**
 * RFC 3339 / ISO-8601 instant with an explicit timezone (`Z` or ±offset).
 * Rejects naive local strings so the API host timezone cannot shift the intended UTC instant.
 */
const RFC3339_WITH_OFFSET =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,9})?)?(?:Z|[+-]\d{2}:?\d{2})$/i

/** Small skew allowance so network latency does not reject near-future schedules. */
export const SCHEDULE_FUTURE_TOLERANCE_MS = 5_000

export const parseOptionalDate = (value: unknown, label: string): Date | undefined => {
  if (value === undefined || value === null) return undefined
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new HttpError(400, `Invalid ${label}`)
    }
    return value
  }
  if (typeof value !== 'string' || !value.trim()) {
    throw new HttpError(400, `Invalid ${label}`)
  }
  const trimmed = value.trim()
  if (!RFC3339_WITH_OFFSET.test(trimmed)) {
    throw new HttpError(
      400,
      `${label} must be an RFC 3339 timestamp with Z or an explicit offset`,
    )
  }
  const date = new Date(trimmed)
  if (Number.isNaN(date.getTime())) {
    throw new HttpError(400, `Invalid ${label}`)
  }
  return date
}

export const parseOptionalNullableDate = (
  value: unknown,
  label: string,
): Date | null | undefined => {
  if (value === undefined) return undefined
  if (value === null) return null
  return parseOptionalDate(value, label) ?? null
}

export const assertFutureScheduleInstant = (
  scheduledAt: Date,
  now: Date = new Date(),
  toleranceMs = SCHEDULE_FUTURE_TOLERANCE_MS,
): void => {
  if (scheduledAt.getTime() <= now.getTime() - toleranceMs) {
    throw new HttpError(400, 'scheduledAt must be a future date')
  }
}

export const toDate = (value: string | Date | undefined): Date | undefined => {
  if (value === undefined) return undefined
  return value instanceof Date ? value : new Date(value)
}

export const toNullableDate = (
  value: string | Date | null | undefined,
): Date | null | undefined => {
  if (value === undefined) return undefined
  if (value === null) return null
  return value instanceof Date ? value : new Date(value)
}

/** Non-empty string array, or `undefined` when the field is omitted. */
export const parseStringArray = (value: unknown, label = 'Value'): string[] | undefined => {
  if (value === undefined) return undefined
  if (!Array.isArray(value)) {
    throw new HttpError(400, `${label} must be an array of strings`)
  }
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
}

/** Plain object record, or `undefined` when the field is omitted. */
export const parsePlainObject = (
  value: unknown,
  label = 'Value',
): Record<string, unknown> | undefined => {
  if (value === undefined) return undefined
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new HttpError(400, `${label} must be an object`)
  }
  return value as Record<string, unknown>
}

const REPO_ERROR_STATUS: Record<string, ContentfulStatusCode> = {
  'Workspace not found': 404,
  'Invitation not found': 404,
  'Account not found': 404,
  'User already a member of the workspace': 409,
  'A pending invitation already exists for this email': 409,
  'This social account is already connected to the workspace': 409,
  'Invitation is no longer pending': 400,
  'Invitation has expired': 400,
  'User is not a member of the workspace': 400,
  'User ID is required': 400,
  'Workspace ID, User ID and Role are required': 400,
  'Workspace ID and User ID are required': 400,
  'Workspace ID is required': 400,
  'Workspace, email, invitedBy and role are required': 400,
  'Workspace, createdBy, provider, providerAccountId and accountName are required': 400,
  'account, workspace, createdBy, provider, type and content are required': 400,
  'Valid IANA timezone is required': 400,
  'Cannot create a post in an internal publish status': 400,
  'Cannot assign an internal publish status via update': 400,
  'Post not found': 404,
}

export const toHttpError = (error: unknown): HttpError => {
  if (error instanceof HttpError) {
    return error
  }
  if (error instanceof Error) {
    const status = REPO_ERROR_STATUS[error.message] ?? 500
    return new HttpError(status, error.message)
  }
  return new HttpError(500, 'Internal server error')
}
