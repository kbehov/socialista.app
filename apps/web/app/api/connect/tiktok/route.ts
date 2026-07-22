import { NextResponse } from 'next/server'

import { assertProviderConfigured } from '@/lib/connector/config'
import { jsonError } from '@/lib/connector/errors'
import { beginOAuthState } from '@/lib/connector/oauth'
import { requireConnectSession } from '@/lib/connector/session'
import { buildTikTokAuthorizeUrl } from '@/lib/connector/tiktok'

export async function GET() {
  try {
    assertProviderConfigured('tiktok')
    const session = await requireConnectSession()
    const state = await beginOAuthState({
      provider: 'tiktok',
      userId: session.userId,
      workspaceId: session.workspaceId,
    })
    return NextResponse.redirect(buildTikTokAuthorizeUrl(state))
  } catch (error) {
    return jsonError(error)
  }
}
