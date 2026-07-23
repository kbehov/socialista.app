import { NextResponse } from 'next/server'

import { assertProviderConfigured } from '@/lib/connector/config'
import { jsonError } from '@/lib/connector/errors'
import { beginOAuthState } from '@/lib/connector/oauth'
import { requireConnectSession } from '@/lib/connector/session'
import { buildLinkedInAuthorizeUrl } from '@/lib/connector/linkedin'

export async function GET() {
  try {
    assertProviderConfigured('linkedin')
    const session = await requireConnectSession()
    const state = await beginOAuthState({
      provider: 'linkedin',
      userId: session.userId,
      workspaceId: session.workspaceId,
    })
    return NextResponse.redirect(buildLinkedInAuthorizeUrl(state))
  } catch (error) {
    return jsonError(error)
  }
}
