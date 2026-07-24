import { z } from 'zod'

type FetchJsonOptions = {
  searchParams?: Record<string, string>
  method?: 'GET' | 'POST' | 'PUT'
  headers?: Record<string, string>
  body?: URLSearchParams | string
  /** When true, skip JSON parse and return empty object for empty bodies. */
  allowEmpty?: boolean
}

export class PublishHttpError extends Error {
  readonly status: number
  readonly retryable: boolean
  readonly body: unknown

  constructor(message: string, status: number, body: unknown = null) {
    super(message)
    this.name = 'PublishHttpError'
    this.status = status
    this.body = body
    this.retryable = status === 429 || status >= 500
  }
}

export function expiresAtFromSeconds(expiresIn: number | undefined, fallbackSeconds: number): Date {
  const seconds = typeof expiresIn === 'number' && expiresIn > 0 ? expiresIn : fallbackSeconds
  return new Date(Date.now() + seconds * 1000)
}

function extractErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== 'object') return fallback
  const record = payload as Record<string, unknown>
  const error = record.error
  if (typeof error === 'string') return error
  if (error && typeof error === 'object') {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message.trim()) return message
  }
  if (typeof record.message === 'string' && record.message.trim()) return record.message
  const data = record.data
  if (data && typeof data === 'object') {
    const errorCode = (data as { error_code?: unknown }).error_code
    const description = (data as { description?: unknown }).description
    if (typeof description === 'string' && description.trim()) return description
    if (typeof errorCode === 'string' && errorCode.trim()) return errorCode
  }
  return fallback
}

export async function fetchJson<T extends z.ZodTypeAny>(
  url: string,
  schema: T,
  options: FetchJsonOptions = {},
): Promise<z.infer<T>> {
  const target = new URL(url)
  if (options.searchParams) {
    for (const [key, value] of Object.entries(options.searchParams)) {
      target.searchParams.set(key, value)
    }
  }

  const headers = { ...options.headers }
  if (options.body instanceof URLSearchParams && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded'
  }

  const response = await fetch(target, {
    method: options.method ?? 'GET',
    headers,
    body: options.body instanceof URLSearchParams ? options.body.toString() : options.body,
  })

  const text = await response.text()
  const payload = text
    ? (() => {
        try {
          return JSON.parse(text) as unknown
        } catch {
          return text
        }
      })()
    : null

  if (!response.ok) {
    throw new PublishHttpError(
      extractErrorMessage(payload, response.statusText || 'Provider request failed'),
      response.status,
      payload,
    )
  }

  if ((payload === null || payload === '') && options.allowEmpty) {
    return schema.parse({})
  }

  const parsed = schema.safeParse(payload)
  if (!parsed.success) {
    throw new PublishHttpError('Unexpected provider response', response.status, payload)
  }

  return parsed.data
}

export async function fetchBinary(url: string): Promise<{ buffer: ArrayBuffer; contentType: string }> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new PublishHttpError(`Failed to download media (${response.status})`, response.status)
  }
  const contentType = response.headers.get('content-type') ?? 'application/octet-stream'
  const buffer = await response.arrayBuffer()
  return { buffer, contentType }
}

export async function sleep(ms: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms))
}
