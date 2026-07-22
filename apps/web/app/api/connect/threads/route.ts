import { NextResponse } from 'next/server'

import { assertProviderConfigured } from '@/lib/connector/config'
import { jsonError } from '@/lib/connector/errors'
import { beginOAuthState } from '@/lib/connector/oauth'
import { requireConnectSession } from '@/lib/connector/session'
import { buildThreadsAuthorizeUrl } from '@/lib/connector/threads'

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
