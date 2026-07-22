import { createHmac, randomBytes, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'

import type { ConnectProvider } from '@socialista/types'

import { ConnectorError } from './errors'

const OAUTH_STATE_COOKIE = 'socialista_oauth_state'
const META_HANDOFF_COOKIE = 'socialista_meta_handoff'
const OAUTH_STATE_MAX_AGE_SEC = 10 * 60
const META_HANDOFF_MAX_AGE_SEC = 15 * 60
const secureCookie = process.env.NODE_ENV === 'production'

type OAuthStatePayload = {
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

function getSecret(): string {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET
  if (!secret) throw new Error('AUTH_SECRET is required for OAuth session cookies')
  return secret
}

function sealJson(payload: unknown): string {
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
  const sig = createHmac('sha256', getSecret()).update(body).digest('base64url')
  return `${body}.${sig}`
}

function unsealJson<T>(value: string): T {
  const [body, sig] = value.split('.')
  if (!body || !sig) throw new Error('Invalid sealed payload')

  const expected = createHmac('sha256', getSecret()).update(body).digest('base64url')
  const sigBuf = Buffer.from(sig)
  const expectedBuf = Buffer.from(expected)
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    throw new Error('Invalid sealed payload signature')
  }

  return JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as T
}

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
  const state = randomBytes(24).toString('hex')
  await setSealedCookie(
    OAUTH_STATE_COOKIE,
    {
      state,
      provider: input.provider,
      userId: input.userId,
      workspaceId: input.workspaceId,
      createdAt: Date.now(),
    } satisfies OAuthStatePayload,
    OAUTH_STATE_MAX_AGE_SEC,
  )
  return state
}

export async function consumeOAuthState(input: {
  provider: ConnectProvider
  userId: string
  state: string | null
}): Promise<OAuthStatePayload> {
  const payload = await readSealedCookie<OAuthStatePayload>(OAUTH_STATE_COOKIE)
  const store = await cookies()
  store.delete(OAUTH_STATE_COOKIE)

  if (!payload || !input.state || payload.state !== input.state) {
    throw new ConnectorError('invalid_state', 'Invalid OAuth state', 400)
  }
  if (payload.provider !== input.provider || payload.userId !== input.userId) {
    throw new ConnectorError('invalid_state', 'OAuth state mismatch', 400)
  }
  if (Date.now() - payload.createdAt > OAUTH_STATE_MAX_AGE_SEC * 1000) {
    throw new ConnectorError('expired', 'OAuth state expired', 400)
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
    throw new ConnectorError('expired', 'Meta connection session expired', 400)
  }
  if (payload.userId !== input.userId || payload.workspaceId !== input.workspaceId) {
    throw new ConnectorError('invalid_state', 'Meta connection session mismatch', 400)
  }
  if (Date.now() > payload.expiresAt || Date.now() - payload.createdAt > META_HANDOFF_MAX_AGE_SEC * 1000) {
    const store = await cookies()
    store.delete(META_HANDOFF_COOKIE)
    throw new ConnectorError('expired', 'Meta connection session expired', 400)
  }
  return payload
}

export async function clearMetaHandoff(): Promise<void> {
  const store = await cookies()
  store.delete(META_HANDOFF_COOKIE)
}
