import { NextResponse } from 'next/server'

import { assertProviderConfigured } from '@/lib/connector/config'
import { jsonError } from '@/lib/connector/errors'
import { buildInstagramAuthorizeUrl } from '@/lib/connector/instagram'
import { beginOAuthState } from '@/lib/connector/oauth'
import { requireConnectSession } from '@/lib/connector/session'

export async function GET() {
  try {
    assertProviderConfigured('instagram')
    const session = await requireConnectSession()
    const state = await beginOAuthState({
      provider: 'instagram',
      userId: session.userId,
      workspaceId: session.workspaceId,
    })
    return NextResponse.redirect(buildInstagramAuthorizeUrl(state))
  } catch (error) {
    return jsonError(error)
  }
}
