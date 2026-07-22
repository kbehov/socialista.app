import { NextResponse } from 'next/server'
import type { MetaCandidate } from '@socialista/types'
import { accountIdentityKey } from '@socialista/types'

import { accountIdentitySet, loadWorkspaceAccounts } from '@/lib/connector/accounts'
import { jsonError } from '@/lib/connector/errors'
import { discoverMetaAssets } from '@/lib/connector/meta'
import { readMetaHandoff } from '@/lib/connector/oauth'
import { requireConnectSession } from '@/lib/connector/session'

export async function GET() {
  try {
    const session = await requireConnectSession()
    const handoff = await readMetaHandoff({
      userId: session.userId,
      workspaceId: session.workspaceId,
    })

    const [assets, existing] = await Promise.all([
      discoverMetaAssets(handoff.accessToken),
      loadWorkspaceAccounts(session.workspaceId),
    ])

    const connected = accountIdentitySet(existing)
    const accounts: MetaCandidate[] = assets.map(({ candidate }) => ({
      ...candidate,
      alreadyConnected: connected.has(
        accountIdentityKey(candidate.provider, candidate.providerAccountId),
      ),
    }))

    return NextResponse.json({
      workspaceId: session.workspaceId,
      accounts,
    })
  } catch (error) {
    return jsonError(error)
  }
}
