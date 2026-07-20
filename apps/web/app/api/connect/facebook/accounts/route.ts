import { NextResponse } from 'next/server'

import {
  buildConnectedIdentitySet,
  discoverMetaAssets,
  isAlreadyConnected,
  jsonError,
  loadWorkspaceAccounts,
  readMetaHandoff,
  requireConnectSession,
  type MetaCandidate,
} from '@/lib/social-connect'

export async function GET() {
  try {
    const session = await requireConnectSession()
    const handoff = await readMetaHandoff({
      userId: session.userId,
      workspaceId: session.workspaceId,
    })

    const [{ candidates }, existing] = await Promise.all([
      discoverMetaAssets(handoff.accessToken),
      loadWorkspaceAccounts(session.workspaceId),
    ])

    const connected = buildConnectedIdentitySet(existing)
    const accounts: MetaCandidate[] = candidates.map(candidate => ({
      ...candidate,
      alreadyConnected: isAlreadyConnected(
        connected,
        candidate.provider,
        candidate.providerAccountId,
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
