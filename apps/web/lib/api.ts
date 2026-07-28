import { auth } from '@/auth'
import { API_URL } from '@/lib/api-url'
import type { ApiResponse } from '@socialista/types'

import { ApiError, parseJson, publicApi } from './api-public'

export { ApiError, publicApi }

interface RequestOptions extends Omit<RequestInit, 'method' | 'body'> {
  body?: unknown
}

async function getAuthHeaders(): Promise<{ userId: string; accessToken: string }> {
  try {
    const session = await auth()
    return {
      userId: session?.user?.id ?? '',
      accessToken: (session?.accessToken as string) ?? '',
    }
  } catch {
    return { userId: '', accessToken: '' }
  }
}

async function request<T>(
  method: string,
  path: string,
  { body, headers, ...rest }: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const { userId, accessToken } = await getAuthHeaders()
  const resolvedHeaders = new Headers(headers)
  resolvedHeaders.set('x-user-id', userId)
  resolvedHeaders.set('Authorization', `Bearer ${accessToken}`)

  // FormData sets its own Content-Type (with boundary) — don't override it
  const isFormData = body instanceof FormData
  if (body !== undefined && !isFormData && !resolvedHeaders.has('Content-Type')) {
    resolvedHeaders.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    method,
    headers: resolvedHeaders,
    body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  })

  return parseJson<T>(response)
}

async function requestText(
  path: string,
  { headers, ...rest }: Omit<RequestOptions, 'body'> = {},
): Promise<{ text: string; contentDisposition: string | null }> {
  const { userId, accessToken } = await getAuthHeaders()
  const resolvedHeaders = new Headers(headers)
  resolvedHeaders.set('x-user-id', userId)
  resolvedHeaders.set('Authorization', `Bearer ${accessToken}`)

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    method: 'GET',
    headers: resolvedHeaders,
  })

  if (!response.ok) {
    const contentType = response.headers.get('Content-Type') ?? ''
    if (contentType.includes('application/json')) {
      const body = await response.json().catch(() => null)
      throw new ApiError(response.status, body?.message ?? response.statusText)
    }
    throw new ApiError(response.status, response.statusText)
  }

  return {
    text: await response.text(),
    contentDisposition: response.headers.get('Content-Disposition'),
  }
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, options),

  /** Authenticated GET that returns raw text (e.g. CSV downloads). */
  getText: (path: string, options?: Omit<RequestOptions, 'body'>) => requestText(path, options),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('POST', path, { ...options, body }),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('PUT', path, { ...options, body }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('PATCH', path, { ...options, body }),

  delete: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('DELETE', path, { ...options, body }),
}
