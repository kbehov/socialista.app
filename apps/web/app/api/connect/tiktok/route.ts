import { NextResponse } from 'next/server'

import {
  assertProviderConfigured,
  beginOAuthState,
  buildTikTokAuthorizeUrl,
  jsonError,
  requireConnectSession,
} from '@/lib/social-connect'

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
