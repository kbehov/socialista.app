import type { ApiResponse } from '@socialista/types'

const API_URL = 'http://localhost:8080'

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function parseJson<T>(response: Response): Promise<ApiResponse<T>> {
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
