import type { CreateAccountPayload, SocialProvider } from '@socialista/types'

export type ConnectProvider = 'facebook' | 'tiktok' | 'threads'

export type OAuthErrorCode =
  | 'unauthorized'
  | 'no_workspace'
  | 'provider_denied'
  | 'invalid_state'
  | 'expired'
  | 'misconfigured'
  | 'provider_error'
  | 'invalid_request'
  | 'not_found'

export type OAuthStatePayload = {
  state: string
  provider: ConnectProvider
  userId: string
  workspaceId: string
  createdAt: number
}

export type MetaHandoffPayload = {
  userId: string
  workspaceId: string
  accessToken: string
  scopes: string[]
  expiresAt: number
  createdAt: number
}

export type MetaCandidateId = `facebook:${string}` | `instagram:${string}`

export type MetaCandidate = {
  id: MetaCandidateId
  provider: Extract<SocialProvider, 'facebook' | 'instagram'>
  providerAccountId: string
  accountName: string
  username?: string
  accountAvatar?: string
  alreadyConnected: boolean
  metadata: {
    pageId: string
    pageName: string
    igUserId?: string
    tasks?: string[]
  }
}

export type ConnectAccountOutcome = 'created' | 'skipped' | 'failed'

export type ConnectAccountResultItem = {
  provider: SocialProvider
  providerAccountId: string
  accountName: string
  status: ConnectAccountOutcome
  accountId?: string
  message?: string
}

export type PersistableAccount = CreateAccountPayload

export function accountIdentityKey(
  provider: SocialProvider,
  providerAccountId: string,
): string {
  return `${provider}:${providerAccountId}`
}

export function parseMetaCandidateId(id: string): {
  provider: 'facebook' | 'instagram'
  providerAccountId: string
} | null {
  const [provider, ...rest] = id.split(':')
  const providerAccountId = rest.join(':')
  if (
    (provider !== 'facebook' && provider !== 'instagram') ||
    !providerAccountId
  ) {
    return null
  }
  return { provider, providerAccountId }
}
