import { auth } from '@/auth'
import type { ApiResponse } from '@socialista/types'
const API_URL = 'http://localhost:8080'

// ─── Error type ───────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// ─── JSON parsing ─────────────────────────────────────────────────────────────

async function parseJson<T>(response: Response): Promise<ApiResponse<T>> {
  const contentType = response.headers.get('Content-Type') ?? ''

  if (!response.ok) {
    if (contentType.includes('application/json')) {
      const body = await response.json().catch(() => null)
      throw new ApiError(response.status, body?.message ?? response.statusText)
    }
    throw new ApiError(response.status, response.statusText)
  }

  if (!contentType.includes('application/json')) {
    return { success: true }
  }

  try {
    return (await response.json()) as ApiResponse<T>
  } catch {
    throw new ApiError(response.status, 'Invalid JSON in response body')
  }
}

// ─── Base request ─────────────────────────────────────────────────────────────

interface RequestOptions extends Omit<RequestInit, 'method' | 'body'> {
  body?: unknown
}

async function resolveUserId(): Promise<string> {
  try {
    const session = await auth()
    return session?.user?.id ?? ''
  } catch {
    // auth() throws outside a request scope (e.g. during static generation)
    return ''
  }
}
async function getAccessToken(): Promise<string> {
  try {
    const session = await auth()
    return (session?.accessToken as string) ?? ''
  } catch {
    return ''
  }
}

async function request<T>(
  method: string,
  path: string,
  { body, headers, ...rest }: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const userId = await resolveUserId()
  const accessToken = await getAccessToken()
  const resolvedHeaders = new Headers(headers)
  resolvedHeaders.set('x-user-id', userId)
  resolvedHeaders.set('Authorization', `Bearer ${accessToken}`)
  if (body !== undefined && !resolvedHeaders.has('Content-Type')) {
    resolvedHeaders.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    method,
    headers: resolvedHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  return parseJson<T>(response)
}

// ─── Unauthenticated API (auth endpoints) ─────────────────────────────────────

async function publicRequest<T>(method: string, path: string, body?: unknown): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  return parseJson<T>(response)
}

export const publicApi = {
  post: <T>(path: string, body?: unknown) => publicRequest<T>('POST', path, body),
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, options),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('POST', path, { ...options, body }),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('PUT', path, { ...options, body }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('PATCH', path, { ...options, body }),

  delete: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('DELETE', path, { ...options, body }),
}
