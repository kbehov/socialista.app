import { NextResponse } from 'next/server'

import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import type { OAuthErrorCode } from './types'

export class SocialConnectError extends Error {
  constructor(
    public readonly code: OAuthErrorCode,
    message: string,
    public readonly status = 400,
  ) {
    super(message)
    this.name = 'SocialConnectError'
  }
}

function appOrigin(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')
}

export function accountsRedirect(params: {
  connected?: string
  skipped?: string
  error?: OAuthErrorCode
}): NextResponse {
  const url = new URL(DASHBOARD_ROUTES.ACCOUNTS, appOrigin())
  if (params.connected) url.searchParams.set('connected', params.connected)
  if (params.skipped) url.searchParams.set('skipped', params.skipped)
  if (params.error) url.searchParams.set('error', params.error)
  return NextResponse.redirect(url)
}

export function jsonError(error: unknown): NextResponse {
  if (error instanceof SocialConnectError) {
    return NextResponse.json(
      { error: error.code, message: error.message },
      { status: error.status },
    )
  }

  console.error('[social-connect]', error)
  return NextResponse.json(
    { error: 'provider_error', message: 'Something went wrong' },
    { status: 500 },
  )
}

export function toOAuthErrorCode(error: unknown): OAuthErrorCode {
  if (error instanceof SocialConnectError) return error.code
  return 'provider_error'
}
