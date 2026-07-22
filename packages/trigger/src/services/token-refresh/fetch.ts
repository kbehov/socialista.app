import { z } from 'zod'

type FetchJsonOptions = {
  searchParams?: Record<string, string>
  method?: 'GET' | 'POST'
  headers?: Record<string, string>
  body?: URLSearchParams
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
    body: options.body?.toString(),
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    let message = response.statusText
    if (payload && typeof payload === 'object') {
      const err = (payload as { error?: { message?: string } | string }).error
      if (typeof err === 'string') message = err
      else if (err && typeof err === 'object' && err.message) message = err.message
    }
    throw new Error(message || 'Provider request failed')
  }

  const parsed = schema.safeParse(payload)
  if (!parsed.success) {
    throw new Error('Unexpected provider response')
  }

  return parsed.data
}
