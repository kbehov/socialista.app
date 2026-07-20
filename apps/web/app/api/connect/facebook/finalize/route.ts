import { NextResponse } from 'next/server'
import { z } from 'zod'

import type { CreateAccountPayload } from '@socialista/types'

import {
  buildConnectedIdentitySet,
  clearMetaHandoff,
  discoverMetaAssets,
  isAlreadyConnected,
  jsonError,
  loadWorkspaceAccounts,
  parseMetaCandidateId,
  persistNewAccounts,
  readMetaHandoff,
  requireConnectSession,
  SocialConnectError,
  summarizeConnectResults,
  type ConnectAccountResultItem,
} from '@/lib/social-connect'

const bodySchema = z.object({
  accountIds: z.array(z.string().min(1)).min(1).max(50),
})

export async function POST(request: Request) {
  try {
    const session = await requireConnectSession()
    const json = await request.json().catch(() => null)
    console.log('json', json)
    const parsed = bodySchema.safeParse(json)
    if (!parsed.success) {
      throw new SocialConnectError('invalid_request', 'accountIds is required', 400)
    }

    const requestedIds = [...new Set(parsed.data.accountIds)]
    for (const id of requestedIds) {
      if (!parseMetaCandidateId(id)) {
        throw new SocialConnectError('invalid_request', `Invalid account id: ${id}`, 400)
      }
    }
    console.log('requestedIds', requestedIds)

    const handoff = await readMetaHandoff({
      userId: session.userId,
      workspaceId: session.workspaceId,
    })
    console.log('handoff', handoff)
    const [{ assets }, existing] = await Promise.all([
      discoverMetaAssets(handoff.accessToken),
      loadWorkspaceAccounts(session.workspaceId),
    ])

    const assetById = new Map(assets.map(asset => [asset.candidate.id, asset]))
    const connected = buildConnectedIdentitySet(existing)

    const results: ConnectAccountResultItem[] = []
    const toCreate: CreateAccountPayload[] = []

    for (const id of requestedIds) {
      const asset = assetById.get(id as `${'facebook' | 'instagram'}:${string}`)
      if (!asset) {
        results.push({
          provider: parseMetaCandidateId(id)!.provider,
          providerAccountId: parseMetaCandidateId(id)!.providerAccountId,
          accountName: id,
          status: 'failed',
          message: 'Account not available for this Facebook connection',
        })
        continue
      }

      const { candidate } = asset
      if (isAlreadyConnected(connected, candidate.provider, candidate.providerAccountId)) {
        results.push({
          provider: candidate.provider,
          providerAccountId: candidate.providerAccountId,
          accountName: candidate.accountName,
          status: 'skipped',
          message: 'Account already connected to this workspace',
        })
        continue
      }

      toCreate.push({
        workspaceId: session.workspaceId,
        provider: candidate.provider,
        providerAccountId: candidate.providerAccountId,
        accountName: candidate.accountName,
        username: candidate.username,
        accountAvatar: candidate.accountAvatar,
        connectionStatus: 'connected',
        scopes: handoff.scopes,
        metadata: {
          ...candidate.metadata,
          tokenKind: 'page_access_token',
          metaUserId: session.userId,
        },
        accessToken: asset.accessToken,
        accessTokenExpiresAt: asset.accessTokenExpiresAt,
      })
    }

    const createdResults = await persistNewAccounts(toCreate)
    results.push(...createdResults)

    const summary = summarizeConnectResults(results)
    // Keep the handoff when something failed so the client can retry without re-auth.
    if (summary.failed === 0) {
      await clearMetaHandoff()
    }

    return NextResponse.json({
      workspaceId: session.workspaceId,
      results,
      summary,
    })
  } catch (error) {
    return jsonError(error)
  }
}
