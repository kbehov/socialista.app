import { SocialConnectError } from './errors'
import type { ConnectProvider } from './types'

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`${name} is not configured`)
  }
  return value
}

function optionalEnv(name: string): string | undefined {
  const value = process.env[name]?.trim()
  return value || undefined
}

export function getAppUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')
}

export function getOAuthSecret(): string {
  return (
    optionalEnv('SOCIAL_OAUTH_SECRET') ??
    optionalEnv('AUTH_SECRET') ??
    optionalEnv('NEXTAUTH_SECRET') ??
    requiredEnv('SOCIAL_OAUTH_SECRET')
  )
}

export function getMetaConfig() {
  return {
    appId: requiredEnv('META_APP_ID'),
    appSecret: requiredEnv('META_APP_SECRET'),
    graphVersion: optionalEnv('META_GRAPH_VERSION') ?? 'v22.0',
    /** Scopes must match products enabled + approved on the Meta app. */
    scopes: [
      'pages_show_list',
      'pages_read_engagement',
      'pages_manage_posts',
      'instagram_basic',
      'instagram_content_publish',
      'business_management',
      'pages_read_user_content',
    ] as const,
  }
}

export function getTikTokConfig() {
  const scopes = ['user.info.basic', 'video.publish']
  if (optionalEnv('TIKTOK_ENABLE_VIDEO_UPLOAD') === 'true') {
    scopes.push('video.upload')
  }

  return {
    clientKey: requiredEnv('TIKTOK_CLIENT_KEY'),
    clientSecret: requiredEnv('TIKTOK_CLIENT_SECRET'),
    scopes,
  }
}

export function getThreadsConfig() {
  return {
    appId: requiredEnv('THREADS_APP_ID'),
    appSecret: requiredEnv('THREADS_APP_SECRET'),
    /** Threads uses graph.threads.net; scopes require Threads product approval. */
    scopes: ['threads_basic', 'threads_content_publish'] as const,
  }
}

export function getCallbackUrl(provider: ConnectProvider): string {
  return `${getAppUrl()}/api/connect/${provider}/callback`
}

export function assertProviderConfigured(provider: ConnectProvider): void {
  try {
    switch (provider) {
      case 'facebook':
        getMetaConfig()
        return
      case 'tiktok':
        getTikTokConfig()
        return
      case 'threads':
        getThreadsConfig()
        return
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Provider is not configured'
    throw new SocialConnectError('misconfigured', message, 500)
  }
}
