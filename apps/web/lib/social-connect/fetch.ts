import { z } from 'zod'

import { SocialConnectError } from './errors'

const DEFAULT_TIMEOUT_MS = 15_000

type FetchJsonOptions = {
  method?: 'GET' | 'POST'
  headers?: HeadersInit
  body?: BodyInit | null
  timeoutMs?: number
  searchParams?: Record<string, string | undefined>
}

export async function fetchJson<T>(
  url: string | URL,
  schema: z.ZodType<T>,
  options: FetchJsonOptions = {},
): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  )

  try {
    const target = new URL(url)
    if (options.searchParams) {
      for (const [key, value] of Object.entries(options.searchParams)) {
        if (value !== undefined) target.searchParams.set(key, value)
      }
    }

    const response = await fetch(target, {
      method: options.method ?? 'GET',
      headers: options.headers,
      body: options.body,
      signal: controller.signal,
    })

    const contentType = response.headers.get('content-type') ?? ''
    const isJson = contentType.includes('application/json')
    const payload = isJson ? await response.json().catch(() => null) : null

    if (!response.ok) {
      throw new SocialConnectError(
        'provider_error',
        `Provider request failed (${response.status})`,
        502,
      )
    }

    const parsed = schema.safeParse(payload)
    if (!parsed.success) {
      throw new SocialConnectError(
        'provider_error',
        'Unexpected provider response',
        502,
      )
    }

    return parsed.data
  } catch (error) {
    if (error instanceof SocialConnectError) throw error
    if (error instanceof Error && error.name === 'AbortError') {
      throw new SocialConnectError('provider_error', 'Provider request timed out', 504)
    }
    throw new SocialConnectError('provider_error', 'Provider request failed', 502)
  } finally {
    clearTimeout(timeout)
  }
}

export function expiresAtFromSeconds(expiresIn: number | undefined, fallbackSeconds = 3600): Date {
  const seconds = Number.isFinite(expiresIn) && (expiresIn ?? 0) > 0 ? expiresIn! : fallbackSeconds
  return new Date(Date.now() + seconds * 1000)
}
