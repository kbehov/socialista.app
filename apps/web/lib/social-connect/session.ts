import { cookies } from 'next/headers'

import { sealJson, unsealJson, randomToken } from './crypto'
import { SocialConnectError } from './errors'
import type { ConnectProvider, MetaHandoffPayload, OAuthStatePayload } from './types'

const OAUTH_STATE_COOKIE = 'socialista_oauth_state'
const META_HANDOFF_COOKIE = 'socialista_meta_handoff'
const OAUTH_STATE_MAX_AGE_SEC = 10 * 60
const META_HANDOFF_MAX_AGE_SEC = 15 * 60

const secureCookie = process.env.NODE_ENV === 'production'

async function setSealedCookie(name: string, payload: unknown, maxAge: number): Promise<void> {
  const store = await cookies()
  store.set(name, sealJson(payload), {
    httpOnly: true,
    secure: secureCookie,
    sameSite: 'lax',
    path: '/',
    maxAge,
  })
}

async function clearCookie(name: string): Promise<void> {
  const store = await cookies()
  store.delete(name)
}

async function readSealedCookie<T>(name: string): Promise<T | null> {
  const store = await cookies()
  const value = store.get(name)?.value
  if (!value) return null
  try {
    return unsealJson<T>(value)
  } catch {
    return null
  }
}

export async function beginOAuthState(input: {
  provider: ConnectProvider
  userId: string
  workspaceId: string
}): Promise<string> {
  const state = randomToken(24)
  const payload: OAuthStatePayload = {
    state,
    provider: input.provider,
    userId: input.userId,
    workspaceId: input.workspaceId,
    createdAt: Date.now(),
  }
  await setSealedCookie(OAUTH_STATE_COOKIE, payload, OAUTH_STATE_MAX_AGE_SEC)
  return state
}

export async function consumeOAuthState(input: {
  provider: ConnectProvider
  userId: string
  state: string | null
}): Promise<OAuthStatePayload> {
  const payload = await readSealedCookie<OAuthStatePayload>(OAUTH_STATE_COOKIE)
  await clearCookie(OAUTH_STATE_COOKIE)

  if (!payload || !input.state || payload.state !== input.state) {
    throw new SocialConnectError('invalid_state', 'Invalid OAuth state', 400)
  }
  if (payload.provider !== input.provider || payload.userId !== input.userId) {
    throw new SocialConnectError('invalid_state', 'OAuth state mismatch', 400)
  }
  if (Date.now() - payload.createdAt > OAUTH_STATE_MAX_AGE_SEC * 1000) {
    throw new SocialConnectError('expired', 'OAuth state expired', 400)
  }

  return payload
}

export async function setMetaHandoff(payload: Omit<MetaHandoffPayload, 'createdAt'>): Promise<void> {
  await setSealedCookie(
    META_HANDOFF_COOKIE,
    { ...payload, createdAt: Date.now() } satisfies MetaHandoffPayload,
    META_HANDOFF_MAX_AGE_SEC,
  )
}

export async function readMetaHandoff(input: {
  userId: string
  workspaceId: string
}): Promise<MetaHandoffPayload> {
  const payload = await readSealedCookie<MetaHandoffPayload>(META_HANDOFF_COOKIE)
  if (!payload) {
    throw new SocialConnectError('expired', 'Meta connection session expired', 400)
  }
  if (payload.userId !== input.userId || payload.workspaceId !== input.workspaceId) {
    throw new SocialConnectError('invalid_state', 'Meta connection session mismatch', 400)
  }
  if (Date.now() > payload.expiresAt || Date.now() - payload.createdAt > META_HANDOFF_MAX_AGE_SEC * 1000) {
    await clearCookie(META_HANDOFF_COOKIE)
    throw new SocialConnectError('expired', 'Meta connection session expired', 400)
  }
  return payload
}

export async function clearMetaHandoff(): Promise<void> {
  await clearCookie(META_HANDOFF_COOKIE)
}
