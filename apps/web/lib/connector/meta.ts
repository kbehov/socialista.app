import type { MetaCandidate, MetaCandidateId } from '@socialista/types'
import { z } from 'zod'

import { getMetaConfig } from './config'
import { ConnectorError } from './errors'
import { expiresAtFromSeconds, fetchJson } from './fetch'

const tokenSchema = z.object({
  access_token: z.string().min(1),
  expires_in: z.number().optional(),
})

const igAccountSchema = z.object({
  id: z.string(),
  username: z.string().optional(),
  name: z.string().optional(),
  profile_picture_url: z.string().optional(),
  followers_count: z.number().optional(),
  biography: z.string().optional(),
})

const pagesResponseSchema = z.object({
  data: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        access_token: z.string().optional(),
        fan_count: z.number().optional(),
        tasks: z.array(z.string()).optional(),
        picture: z
          .object({
            data: z.object({ url: z.string().optional() }).optional(),
          })
          .optional(),
        instagram_business_account: igAccountSchema.optional(),
      }),
    )
    .default([]),
})

function graphUrl(path: string): string {
  const { graphVersion } = getMetaConfig()
  return `https://graph.facebook.com/${graphVersion}${path}`
}

export function buildMetaAuthorizeUrl(state: string): string {
  const { appId, scopes, graphVersion, redirectUri } = getMetaConfig()
  const url = new URL(`https://www.facebook.com/${graphVersion}/dialog/oauth`)
  url.searchParams.set('client_id', appId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('state', state)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', scopes.join(','))
  return url.toString()
}

export async function exchangeMetaCode(code: string): Promise<{
  accessToken: string
  expiresAt: Date
  scopes: string[]
}> {
  const { appId, appSecret, scopes, redirectUri } = getMetaConfig()

  const shortLived = await fetchJson(graphUrl('/oauth/access_token'), tokenSchema, {
    searchParams: {
      client_id: appId,
      client_secret: appSecret,
      redirect_uri: redirectUri,
      code,
    },
  })

  const longLived = await fetchJson(graphUrl('/oauth/access_token'), tokenSchema, {
    searchParams: {
      grant_type: 'fb_exchange_token',
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: shortLived.access_token,
    },
  })

  return {
    accessToken: longLived.access_token,
    expiresAt: expiresAtFromSeconds(longLived.expires_in, 60 * 24 * 60 * 60),
    scopes: [...scopes],
  }
}

/**
 * Re-exchange a Meta user access token for a new long-lived token.
 * Page access tokens derived from long-lived user tokens do not expire and should not use this.
 */
export async function refreshMetaUserAccessToken(accessToken: string): Promise<{
  accessToken: string
  accessTokenExpiresAt: Date
}> {
  const { appId, appSecret } = getMetaConfig()

  const longLived = await fetchJson(graphUrl('/oauth/access_token'), tokenSchema, {
    searchParams: {
      grant_type: 'fb_exchange_token',
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: accessToken,
    },
  })

  return {
    accessToken: longLived.access_token,
    accessTokenExpiresAt: expiresAtFromSeconds(longLived.expires_in, 60 * 24 * 60 * 60),
  }
}

export type MetaDiscoveredAsset = {
  candidate: Omit<MetaCandidate, 'alreadyConnected'>
  accessToken: string
  accessTokenExpiresAt?: Date
}

export async function discoverMetaAssets(userAccessToken: string): Promise<MetaDiscoveredAsset[]> {
  const pages = await fetchJson(graphUrl('/me/accounts'), pagesResponseSchema, {
    searchParams: {
      fields:
        'id,name,access_token,fan_count,tasks,picture{url},instagram_business_account{id,username,name,profile_picture_url,followers_count}',
      access_token: userAccessToken,
      limit: '100',
    },
  })

  const assets: MetaDiscoveredAsset[] = []

  for (const page of pages.data) {
    const pageToken = page.access_token

    if (pageToken) {
      assets.push({
        candidate: {
          id: `facebook:${page.id}` as MetaCandidateId,
          provider: 'facebook',
          providerAccountId: page.id,
          accountName: page.name,
          accountAvatar: page.picture?.data?.url,
          followersCount: page.fan_count,
          metadata: {
            pageId: page.id,
            pageName: page.name,
            tasks: page.tasks,
            tokenKind: 'page_access_token',
          },
        },
        accessToken: pageToken,
      })
    }

    const ig = page.instagram_business_account
    if (!ig?.id) continue

    // Page token is preferred for publishing; fall back to the user token so
    // Instagram-only selection still works when the Page token is missing.
    const igToken = pageToken ?? userAccessToken

    let igProfile = ig
    try {
      igProfile = await fetchJson(graphUrl(`/${ig.id}`), igAccountSchema, {
        searchParams: {
          fields: 'id,username,name,profile_picture_url,followers_count,biography',
          access_token: igToken,
        },
      })
    } catch {
      // Keep nested fields from /me/accounts when enrichment fails.
    }

    assets.push({
      candidate: {
        id: `instagram:${ig.id}` as MetaCandidateId,
        provider: 'instagram',
        providerAccountId: ig.id,
        accountName: igProfile.name ?? igProfile.username ?? page.name,
        username: igProfile.username,
        accountAvatar: igProfile.profile_picture_url ?? page.picture?.data?.url,
        biography: igProfile.biography,
        followersCount: igProfile.followers_count ?? ig.followers_count,
        metadata: {
          pageId: page.id,
          pageName: page.name,
          igUserId: ig.id,
          tasks: page.tasks,
          tokenKind: pageToken ? 'page_access_token' : 'instagram_user_access_token',
        },
      },
      accessToken: igToken,
    })
  }

  if (assets.length === 0) {
    throw new ConnectorError(
      'not_found',
      'No Facebook Pages or linked Instagram accounts found. To connect Instagram without a Facebook Page, use Connect → Instagram.',
      404,
    )
  }

  return assets
}
