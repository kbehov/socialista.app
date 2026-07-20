import { ConnectionStatus, FacebookPageResponse, SocialAccountResponse } from '@socialista/types'
import crypto from 'crypto'
export const metaConfig = {
  appId: process.env.META_APP_ID,
  appSecret: process.env.META_APP_SECRET,
  graphVersion: process.env.META_GRAPH_VERSION ?? 'v22.0',
  redirectUri: process.env.META_REDIRECT_URI ?? 'http://localhost:3000/api/connect/facebook/callback',
  scopes: [
    'pages_show_list',
    'pages_read_engagement',
    'pages_manage_posts',
    'instagram_basic',
    'instagram_content_publish',
    'business_management',
    'pages_read_user_content',
  ],
} as const

export function generateState(): string {
  return crypto.randomBytes(16).toString('hex')
}

export function buildMetaAuthorizeUrl(state: string) {
  if (!metaConfig.appId || !metaConfig.graphVersion) {
    throw new Error('Meta app ID or graph version is not set')
  }

  const params = new URLSearchParams({
    client_id: metaConfig.appId,
    redirect_uri: metaConfig.redirectUri,
    response_type: 'code',
    state,
    scope: metaConfig.scopes.join(','),
  })
  return `https://www.facebook.com/${metaConfig.graphVersion}/dialog/oauth?${params.toString()}`
}

export const ensureMetaIsConfigured = () => {
  if (!metaConfig.appId || !metaConfig.graphVersion || !metaConfig.redirectUri || !metaConfig.appSecret) {
    throw new Error('Meta app ID or graph version is not set')
  }
}

export const exchangeMetaToken = async (code: string) => {
  const exchangeUrl =
    `https://graph.facebook.com/${metaConfig.graphVersion}/oauth/access_token?` +
    `client_id=${metaConfig.appId}&` +
    `client_secret=${metaConfig.appSecret}&` +
    `redirect_uri=${encodeURIComponent(metaConfig.redirectUri)}&` +
    `code=${code}`
  const response = await fetch(exchangeUrl)
  if (!response.ok) {
    throw new Error('Failed to exchange Meta token: ' + response.statusText)
  }
  const data = await response.json()
  return data.access_token
}

export const getLongLivedToken = async (accessToken: string): Promise<{ accessToken: string; expiresAt: number }> => {
  const url =
    `https://graph.facebook.com/${metaConfig.graphVersion}/oauth/access_token?` +
    `grant_type=fb_exchange_token&` +
    `client_id=${metaConfig.appId}&` +
    `client_secret=${metaConfig.appSecret}&` +
    `fb_exchange_token=${accessToken}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to get long lived token: ' + response.statusText)
  }
  const data = await response.json()
  return {
    accessToken: data.access_token,
    expiresAt: data.expires_at || Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
  }
}

export const getPages = async (accessToken: string): Promise<SocialAccountResponse[]> => {
  // fields are id, name, access_token, category, picture, fan_count
  const pageFields = ['id', 'name', 'access_token', 'category', 'picture', 'fan_count', 'username', 'expires_at'].join(
    ',',
  )
  // limit is the maximum number of pages to return
  const pagesLimit = 100
  // request url
  const url = `https://graph.facebook.com/${metaConfig.graphVersion}/me/accounts?fields=${pageFields}&access_token=${accessToken}&limit=${pagesLimit}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to get pages: ${response.statusText}`)
  }
  const { data } = await response.json()
  if (!data || data.length === 0) {
    throw new Error('No pages found')
  }
  const pages = data.map((page: FacebookPageResponse) => ({
    providerAccountId: page.id,
    platform: 'facebook',
    accountName: page.name,
    username: page.username,
    accountAvatar: page.profilePicture,
    timezone: 'UTC',
    connectionStatus: ConnectionStatus.CONNECTED,
    scopes: pageFields.split(','),
    metadata: {},
    accessToken: page.access_token,
    expiresAt: page.expires_at || Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
    lastSyncedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }))
  console.log(pages)
  return pages
}
