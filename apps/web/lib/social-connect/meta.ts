import { z } from 'zod'

import { getCallbackUrl, getMetaConfig } from './config'
import { SocialConnectError } from './errors'
import { expiresAtFromSeconds, fetchJson } from './fetch'
import type { MetaCandidate, MetaCandidateId } from './types'

const shortLivedTokenSchema = z.object({
  access_token: z.string().min(1),
  token_type: z.string().optional(),
  expires_in: z.number().optional(),
})

const longLivedTokenSchema = z.object({
  access_token: z.string().min(1),
  token_type: z.string().optional(),
  expires_in: z.number().optional(),
})

const igAccountSchema = z.object({
  id: z.string(),
  username: z.string().optional(),
  name: z.string().optional(),
  profile_picture_url: z.string().optional(),
})

const pageSchema = z.object({
  id: z.string(),
  name: z.string(),
  access_token: z.string().optional(),
  tasks: z.array(z.string()).optional(),
  picture: z
    .object({
      data: z
        .object({
          url: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  instagram_business_account: igAccountSchema.optional(),
})

const pagesResponseSchema = z.object({
  data: z.array(pageSchema).default([]),
})

function graphBaseUrl(): string {
  const { graphVersion } = getMetaConfig()
  return `https://graph.facebook.com/${graphVersion}`
}

export function buildFacebookAuthorizeUrl(state: string): string {
  const { appId, scopes, graphVersion } = getMetaConfig()
  const url = new URL(`https://www.facebook.com/${graphVersion}/dialog/oauth`)
  url.searchParams.set('client_id', appId)
  url.searchParams.set('redirect_uri', getCallbackUrl('facebook'))
  url.searchParams.set('state', state)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', scopes.join(','))
  return url.toString()
}

export async function exchangeFacebookCode(code: string): Promise<{
  accessToken: string
  expiresAt: Date
  scopes: string[]
}> {
  const { appId, appSecret, scopes } = getMetaConfig()

  const shortLived = await fetchJson(
    `${graphBaseUrl()}/oauth/access_token`,
    shortLivedTokenSchema,
    {
      searchParams: {
        client_id: appId,
        client_secret: appSecret,
        redirect_uri: getCallbackUrl('facebook'),
        code,
      },
    },
  )

  const longLived = await fetchJson(
    `${graphBaseUrl()}/oauth/access_token`,
    longLivedTokenSchema,
    {
      searchParams: {
        grant_type: 'fb_exchange_token',
        client_id: appId,
        client_secret: appSecret,
        fb_exchange_token: shortLived.access_token,
      },
    },
  )

  return {
    accessToken: longLived.access_token,
    expiresAt: expiresAtFromSeconds(longLived.expires_in, 60 * 24 * 60 * 60),
    scopes: [...scopes],
  }
}

export type MetaDiscoveredAsset = {
  candidate: Omit<MetaCandidate, 'alreadyConnected'>
  accessToken: string
  accessTokenExpiresAt?: Date
}

export async function discoverMetaAssets(userAccessToken: string): Promise<{
  candidates: Omit<MetaCandidate, 'alreadyConnected'>[]
  assets: MetaDiscoveredAsset[]
}> {
  const pages = await fetchJson(`${graphBaseUrl()}/me/accounts`, pagesResponseSchema, {
    searchParams: {
      fields:
        'id,name,access_token,tasks,picture{url},instagram_business_account{id,username,name,profile_picture_url}',
      access_token: userAccessToken,
      limit: '100',
    },
  })

  const candidates: Omit<MetaCandidate, 'alreadyConnected'>[] = []
  const assets: MetaDiscoveredAsset[] = []

  for (const page of pages.data) {
    if (!page.access_token) continue

    const facebookId = `facebook:${page.id}` as MetaCandidateId
    const facebookCandidate: Omit<MetaCandidate, 'alreadyConnected'> = {
      id: facebookId,
      provider: 'facebook',
      providerAccountId: page.id,
      accountName: page.name,
      accountAvatar: page.picture?.data?.url,
      metadata: {
        pageId: page.id,
        pageName: page.name,
        tasks: page.tasks,
      },
    }
    candidates.push(facebookCandidate)
    assets.push({
      candidate: facebookCandidate,
      accessToken: page.access_token,
    })

    const ig = page.instagram_business_account
    if (!ig?.id) continue

    // Enrich IG profile when possible; fall back to page-linked fields.
    let igProfile = ig
    try {
      igProfile = await fetchJson(`${graphBaseUrl()}/${ig.id}`, igAccountSchema, {
        searchParams: {
          fields: 'id,username,name,profile_picture_url',
          access_token: page.access_token,
        },
      })
    } catch {
      // Keep nested fields from /me/accounts when enrichment fails.
    }

    const instagramId = `instagram:${ig.id}` as MetaCandidateId
    const instagramCandidate: Omit<MetaCandidate, 'alreadyConnected'> = {
      id: instagramId,
      provider: 'instagram',
      providerAccountId: ig.id,
      accountName: igProfile.name ?? igProfile.username ?? page.name,
      username: igProfile.username,
      accountAvatar: igProfile.profile_picture_url ?? page.picture?.data?.url,
      metadata: {
        pageId: page.id,
        pageName: page.name,
        igUserId: ig.id,
        tasks: page.tasks,
      },
    }
    candidates.push(instagramCandidate)
    assets.push({
      candidate: instagramCandidate,
      accessToken: page.access_token,
    })
  }

  if (candidates.length === 0) {
    throw new SocialConnectError(
      'not_found',
      'No Facebook Pages or Instagram accounts found for this user',
      404,
    )
  }

  return { candidates, assets }
}
