export const CURRENT_WORKSPACE_COOKIE = 'socialista_cwp'

const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365

type ClientCookieOptions = {
  maxAge?: number
  path?: string
  sameSite?: 'Lax' | 'Strict' | 'None'
}

export function parseCookieHeader(header: string | null | undefined): Map<string, string> {
  const cookies = new Map<string, string>()
  if (!header) return cookies

  for (const part of header.split(';')) {
    const separatorIndex = part.indexOf('=')
    if (separatorIndex === -1) continue

    const name = part.slice(0, separatorIndex).trim()
    const value = part.slice(separatorIndex + 1).trim()
    if (!name) continue

    try {
      cookies.set(name, decodeURIComponent(value))
    } catch {
      cookies.set(name, value)
    }
  }

  return cookies
}

export function getCookieFromHeader(header: string | null | undefined, name: string): string | undefined {
  return parseCookieHeader(header).get(name)
}

export function getClientCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  return getCookieFromHeader(document.cookie, name)
}

export function setClientCookie(name: string, value: string, options: ClientCookieOptions = {}): void {
  if (typeof document === 'undefined') return
  if (!value || value === 'undefined' || value === 'null') return

  const { maxAge = DEFAULT_MAX_AGE_SECONDS, path = '/', sameSite = 'Lax' } = options
  document.cookie = `${name}=${encodeURIComponent(value)}; path=${path}; max-age=${maxAge}; SameSite=${sameSite}`
}

export function removeClientCookie(name: string, path = '/'): void {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; path=${path}; max-age=0`
}

export function getCurrentWorkspaceIdClient(): string | undefined {
  const value = getClientCookie(CURRENT_WORKSPACE_COOKIE)
  if (!value || value === 'undefined' || value === 'null') {
    if (value === 'undefined' || value === 'null') {
      removeCurrentWorkspaceIdClient()
    }
    return undefined
  }
  return value
}

export function setCurrentWorkspaceIdClient(workspaceId: string): void {
  setClientCookie(CURRENT_WORKSPACE_COOKIE, workspaceId)
}

export function removeCurrentWorkspaceIdClient(): void {
  removeClientCookie(CURRENT_WORKSPACE_COOKIE)
}
