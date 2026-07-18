import { auth } from '@/auth'
import { CURRENT_WORKSPACE_COOKIE } from '@/utils/cookie.utils'
import { NextResponse } from 'next/server'

const AUTH_PATHS = ['/auth/signin', '/auth/signup'] as const
const PROTECTED_PREFIXES = ['/dashboard', '/manager'] as const

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

function isAuthPath(pathname: string) {
  return AUTH_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`))
}

function isCorruptWorkspaceCookie(value: string | undefined) {
  return value === 'undefined' || value === 'null' || value === ''
}

/**
 * Next.js 16 request proxy (formerly middleware).
 *
 * Keep this layer light:
 * - optimistic auth redirects (authoritative checks stay in layouts / server actions)
 * - scrub corrupt workspace cookies
 *
 * Do not fetch workspaces or call `cookies()` from `next/headers` here —
 * set cookies on the `NextResponse` only.
 */
export const proxy = auth(req => {
  const { pathname, search } = req.nextUrl
  const isLoggedIn = Boolean(req.auth?.user)
  const sessionError = req.auth?.error

  if (isProtectedPath(pathname) && (!isLoggedIn || sessionError)) {
    const signInUrl = new URL('/auth/signin', req.nextUrl.origin)
    signInUrl.searchParams.set('callbackUrl', `${pathname}${search}`)
    return NextResponse.redirect(signInUrl)
  }

  if (isAuthPath(pathname) && isLoggedIn && !sessionError) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl.origin))
  }

  const response = NextResponse.next()

  const workspaceCookie = req.cookies.get(CURRENT_WORKSPACE_COOKIE)?.value
  if (workspaceCookie !== undefined && isCorruptWorkspaceCookie(workspaceCookie)) {
    response.cookies.delete(CURRENT_WORKSPACE_COOKIE)
  }

  return response
})

export const config = {
  matcher: ['/dashboard/:path*', '/manager/:path*', '/auth/signin', '/auth/signup'],
}
