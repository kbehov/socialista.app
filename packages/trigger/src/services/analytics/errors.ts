import { PublishHttpError } from '../post-publishing/fetch.js'

/** Auth / permission failures → mark account needs_reauth (do not retry). */
export class AnalyticsAuthError extends Error {
  readonly status?: number
  readonly body?: unknown

  constructor(message: string, status?: number, body?: unknown) {
    super(message)
    this.name = 'AnalyticsAuthError'
    this.status = status
    this.body = body
  }
}

/** Provider has no analytics fetcher. */
export class AnalyticsUnsupportedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AnalyticsUnsupportedError'
  }
}

const AUTH_ERROR_CODES = new Set([190, 10, 200])

function metaErrorCode(body: unknown): number | undefined {
  if (!body || typeof body !== 'object') return undefined
  const error = (body as { error?: { code?: unknown; error_subcode?: unknown } }).error
  if (!error || typeof error !== 'object') return undefined
  if (typeof error.code === 'number') return error.code
  return undefined
}

function metaErrorMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== 'object') return fallback
  const error = (body as { error?: { message?: unknown } }).error
  if (error && typeof error === 'object' && typeof error.message === 'string' && error.message.trim()) {
    return error.message
  }
  return fallback
}

/** Map provider HTTP errors to analytics-specific errors where appropriate. */
export function classifyAnalyticsHttpError(error: unknown): never {
  if (error instanceof AnalyticsAuthError || error instanceof AnalyticsUnsupportedError) {
    throw error
  }

  if (error instanceof PublishHttpError) {
    const code = metaErrorCode(error.body)
    const message = metaErrorMessage(error.body, error.message)

    // OAuthException / permission errors
    if (error.status === 401 || error.status === 403) {
      throw new AnalyticsAuthError(message, error.status, error.body)
    }
    if (typeof code === 'number' && AUTH_ERROR_CODES.has(code)) {
      throw new AnalyticsAuthError(message, error.status, error.body)
    }
    // Permission denied phrasing without a known code
    if (/permission|oauth|access token|not authorized|requires.*scope/i.test(message)) {
      throw new AnalyticsAuthError(message, error.status, error.body)
    }

    throw error
  }

  throw error instanceof Error ? error : new Error(String(error))
}

export function isUnsupportedMetricError(error: unknown): boolean {
  if (!(error instanceof PublishHttpError)) return false
  const code = metaErrorCode(error.body)
  // (#100) unsupported metric / invalid parameter
  return code === 100 || /metric/i.test(error.message)
}
