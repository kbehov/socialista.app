import { NextResponse } from 'next/server'
import { z } from 'zod'

import type { ConnectAccountResultItem, CreateAccountPayload } from '@socialista/types'
import { ConnectionStatus, parseMetaCandidateId } from '@socialista/types'
import { connectAccountsBatch } from '@/services/account.service'

import { ConnectorError, jsonError } from '@/lib/connector/errors'
import { discoverMetaAssets } from '@/lib/connector/meta'
import { clearMetaHandoff, readMetaHandoff } from '@/lib/connector/oauth'
import { requireConnectSession } from '@/lib/connector/session'

const bodySchema = z.object({
  accountIds: z.array(z.string().min(1)).min(1).max(50),
})

export async function POST(request: Request) {
  try {
    const session = await requireConnectSession()
    const json = await request.json().catch(() => null)
    const parsed = bodySchema.safeParse(json)
    if (!parsed.success) {
      throw new ConnectorError('invalid_request', 'accountIds is required', 400)
    }

    const requestedIds = [...new Set(parsed.data.accountIds)]
    for (const id of requestedIds) {
      if (!parseMetaCandidateId(id)) {
        throw new ConnectorError('invalid_request', `Invalid account id: ${id}`, 400)
      }
    }

    const handoff = await readMetaHandoff({
      userId: session.userId,
      workspaceId: session.workspaceId,
    })

    const assets = await discoverMetaAssets(handoff.accessToken)
    const assetById = new Map(assets.map(asset => [asset.candidate.id, asset]))

    const results: ConnectAccountResultItem[] = []
    const toConnect: CreateAccountPayload[] = []

    for (const id of requestedIds) {
      const asset = assetById.get(id as `${'facebook' | 'instagram'}:${string}`)
      const parsedId = parseMetaCandidateId(id)

      if (!asset || !parsedId) {
        results.push({
          provider: parsedId?.provider ?? 'facebook',
          providerAccountId: parsedId?.providerAccountId ?? id,
          accountName: id,
          status: 'failed',
          message: 'Account not available for this Facebook connection',
        })
        continue
      }

      const { candidate } = asset
      toConnect.push({
        workspaceId: session.workspaceId,
        projectId: session.projectId,
        provider: candidate.provider,
        providerAccountId: candidate.providerAccountId,
        accountName: candidate.accountName,
        username: candidate.username,
        accountAvatar: candidate.accountAvatar,
        biography: candidate.biography,
        followersCount: candidate.followersCount,
        timezone: session.project?.timezone ?? session.workspace.settings?.timezone,
        connectionStatus: ConnectionStatus.CONNECTED,
        scopes: handoff.scopes,
        metadata: {
          ...candidate.metadata,
          tokenKind: 'page_access_token',
        },
        // Page token for publishing; long-lived Meta user token for Pages Search / location tagging.
        accessToken: asset.accessToken,
        accessTokenExpiresAt: asset.accessTokenExpiresAt,
        refreshToken: handoff.accessToken,
        refreshTokenExpiresAt: new Date(handoff.expiresAt),
      })
    }

    results.push(...(await connectAccountsBatch(toConnect)))

    const summary = { created: 0, updated: 0, skipped: 0, failed: 0 }
    for (const item of results) summary[item.status] += 1

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
