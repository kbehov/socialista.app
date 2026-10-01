import { NextResponse } from 'next/server'

import { assertProviderConfigured } from '@/lib/connector/config'
import { jsonError } from '@/lib/connector/errors'
import { beginOAuthState } from '@/lib/connector/oauth'
import { requireConnectSession } from '@/lib/connector/session'
import { buildXAuthorizeUrl, createXPkce } from '@/lib/connector/twitter'

export async function GET() {
  try {
    assertProviderConfigured('twitter')
    const session = await requireConnectSession()
    const { codeVerifier, codeChallenge } = createXPkce()
    const state = await beginOAuthState({
      provider: 'twitter',
      userId: session.userId,
      workspaceId: session.workspaceId,
      codeVerifier,
    })
    return NextResponse.redirect(buildXAuthorizeUrl(state, codeChallenge))
  } catch (error) {
    return jsonError(error)
  }
}
