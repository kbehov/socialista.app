import type { OAuthErrorCode } from '@socialista/types'
import { NextResponse } from 'next/server'

import { getAccountsUrl } from './config'

export class ConnectorError extends Error {
  constructor(
    public readonly code: OAuthErrorCode,
    message: string,
    public readonly status = 400,
  ) {
    super(message)
    this.name = 'ConnectorError'
  }
}

export function toOAuthErrorCode(error: unknown): OAuthErrorCode {
  if (error instanceof ConnectorError) return error.code
  if (error instanceof Error) {
    if (error.message.includes('Unauthorized')) return 'unauthorized'
    if (error.message.includes('workspace')) return 'no_workspace'
  }
  return 'provider_error'
}

export function jsonError(error: unknown): NextResponse {
  if (error instanceof ConnectorError) {
    return NextResponse.json({ message: error.message, error: error.code }, { status: error.status })
  }
  const message = error instanceof Error ? error.message : 'Something went wrong'
  return NextResponse.json({ message, error: 'provider_error' }, { status: 500 })
}

export function accountsRedirect(params: Record<string, string>): NextResponse {
  return NextResponse.redirect(getAccountsUrl(params))
}
