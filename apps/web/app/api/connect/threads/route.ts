import { NextResponse } from 'next/server'

import {
  assertProviderConfigured,
  beginOAuthState,
  buildThreadsAuthorizeUrl,
  jsonError,
  requireConnectSession,
} from '@/lib/social-connect'

export async function GET() {
  try {
    assertProviderConfigured('threads')
    const session = await requireConnectSession()
    const state = await beginOAuthState({
      provider: 'threads',
      userId: session.userId,
      workspaceId: session.workspaceId,
    })
    return NextResponse.redirect(buildThreadsAuthorizeUrl(state))
  } catch (error) {
    return jsonError(error)
  }
}
