import type { ConnectProvider } from '@socialista/types'

import { ConnectorError } from './errors'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export function getCallbackUrl(provider: ConnectProvider): string {
  return `${APP_URL}/api/connect/${provider}/callback`
}

export function getAccountsUrl(params?: Record<string, string>): string {
  const url = new URL(`${APP_URL}/dashboard/accounts`)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value)
    }
  }
  return url.toString()
}

export function getMetaConfig() {
  return {
    appId: process.env.META_APP_ID ?? '',
    appSecret: process.env.META_APP_SECRET ?? '',
    graphVersion: process.env.META_GRAPH_VERSION ?? 'v22.0',
    redirectUri: process.env.META_REDIRECT_URI ?? getCallbackUrl('facebook'),
    scopes: [
      'pages_show_list',
      'pages_read_engagement',
      'pages_manage_posts',
      'instagram_basic',
      'instagram_content_publish',
      'pages_read_user_content',
      'instagram_manage_insights',
    ],
  }
}

/** Instagram API with Instagram Login (professional accounts without a Facebook Page). */
export function getInstagramConfig() {
  return {
    appId: process.env.INSTAGRAM_APP_ID ?? '',
    appSecret: process.env.INSTAGRAM_APP_SECRET ?? '',
    redirectUri: process.env.INSTAGRAM_REDIRECT_URI ?? getCallbackUrl('instagram'),
    scopes: ['instagram_business_basic', 'instagram_business_content_publish'],
  }
}

export function getTikTokConfig() {
  return {
    clientKey: process.env.TIKTOK_CLIENT_KEY ?? '',
    clientSecret: process.env.TIKTOK_CLIENT_SECRET ?? '',
    scopes: ['user.info.basic', 'user.info.profile', 'video.publish'],
  }
}

export function getThreadsConfig() {
  return {
    appId: process.env.THREADS_APP_ID ?? '',
    appSecret: process.env.THREADS_APP_SECRET ?? '',
    scopes: ['threads_basic', 'threads_content_publish'],
  }
}

export function getLinkedInConfig() {
  return {
    clientId: process.env.LINKEDIN_CLIENT_ID ?? '',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET ?? '',
    redirectUri: getCallbackUrl('linkedin'),
    // Requires LinkedIn Developer products:
    // - "Sign In with LinkedIn using OpenID Connect" → openid, profile, email
    // - "Share on LinkedIn" → w_member_social
    scopes: ['openid', 'profile', 'email', 'w_member_social'],
  }
}

export function assertProviderConfigured(provider: ConnectProvider): void {
  const checks: Record<ConnectProvider, { ok: boolean; label: string }> = {
    facebook: {
      ok: Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET),
      label: 'Meta',
    },
    instagram: {
      ok: Boolean(process.env.INSTAGRAM_APP_ID && process.env.INSTAGRAM_APP_SECRET),
      label: 'Instagram',
    },
    tiktok: {
      ok: Boolean(process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET),
      label: 'TikTok',
    },
    threads: {
      ok: Boolean(process.env.THREADS_APP_ID && process.env.THREADS_APP_SECRET),
      label: 'Threads',
    },
    linkedin: {
      ok: Boolean(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET),
      label: 'LinkedIn',
    },
  }

  const check = checks[provider]
  if (!check.ok) {
    throw new ConnectorError('misconfigured', `${check.label} is not configured`, 500)
  }
}
