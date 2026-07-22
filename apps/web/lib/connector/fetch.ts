import { z } from 'zod'

import { ConnectorError } from './errors'

type FetchJsonOptions = {
  searchParams?: Record<string, string>
  method?: 'GET' | 'POST'
  headers?: Record<string, string>
  body?: URLSearchParams | Record<string, unknown>
}

export function expiresAtFromSeconds(expiresIn: number | undefined, fallbackSeconds: number): Date {
  const seconds = typeof expiresIn === 'number' && expiresIn > 0 ? expiresIn : fallbackSeconds
  return new Date(Date.now() + seconds * 1000)
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

  const response = await fetch(target, {
    method: options.method ?? 'GET',
    headers: options.headers,
    body:
      options.body instanceof URLSearchParams
        ? options.body.toString()
        : options.body
          ? JSON.stringify(options.body)
          : undefined,
    cache: 'no-store',
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'error' in payload
        ? String((payload as { error?: { message?: string } }).error?.message ?? response.statusText)
        : response.statusText
    throw new ConnectorError('provider_error', message || 'Provider request failed', 502)
  }

  const parsed = schema.safeParse(payload)
  if (!parsed.success) {
    throw new ConnectorError('provider_error', 'Unexpected provider response', 502)
  }

  return parsed.data
}
