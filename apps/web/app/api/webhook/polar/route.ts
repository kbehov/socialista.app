import { createHmac, timingSafeEqual } from 'node:crypto'

import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

import { POLAR_PRODUCTS_CACHE_TAG } from '@/lib/polar/polar-cache'
import { forwardPolarWebhookEvent } from '@/lib/polar/internal-webhook-relay'
import { POLAR_WEBHOOK_EVENT_TYPE_SET, type PolarWebhookEventType } from '@socialista/types'

const WEBHOOK_TOLERANCE_SECONDS = 5 * 60

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const verifyPolarWebhook = (body: string, headers: Headers, secret: string): unknown => {
  const messageId = headers.get('webhook-id')
  const messageSignature = headers.get('webhook-signature')
  const messageTimestamp = headers.get('webhook-timestamp')
  if (!messageId || !messageSignature || !messageTimestamp) {
    throw new Error('Missing webhook signature headers')
  }

  const timestamp = Number.parseInt(messageTimestamp, 10)
  const now = Math.floor(Date.now() / 1000)
  if (!Number.isFinite(timestamp) || Math.abs(now - timestamp) > WEBHOOK_TOLERANCE_SECONDS) {
    throw new Error('Webhook timestamp is outside the tolerance window')
  }

  const expected = createHmac('sha256', Buffer.from(secret, 'utf8')).update(`${messageId}.${timestamp}.${body}`).digest('base64')
  const expectedBytes = Buffer.from(expected)
  const matched = messageSignature.split(' ').some(part => {
    const [version, signature] = part.split(',')
    if (version !== 'v1' || !signature) return false
    const actual = Buffer.from(signature)
    return actual.length === expectedBytes.length && timingSafeEqual(actual, expectedBytes)
  })
  if (!matched) {
    throw new Error('Webhook signature does not match')
  }

  return JSON.parse(body) as unknown
}

export async function POST(request: Request) {
  const secret = process.env.POLAR_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ received: false }, { status: 500 })
  }

  const body = await request.text()
  let payload: unknown
  try {
    payload = verifyPolarWebhook(body, request.headers, secret)
  } catch {
    return NextResponse.json({ received: false }, { status: 403 })
  }

  if (!isRecord(payload) || typeof payload.type !== 'string') {
    return NextResponse.json({ received: false }, { status: 400 })
  }

  if (!POLAR_WEBHOOK_EVENT_TYPE_SET.has(payload.type as PolarWebhookEventType)) {
    return NextResponse.json({ received: true })
  }

  await forwardPolarWebhookEvent(
    payload.type as PolarWebhookEventType,
    payload.data,
    request.headers.get('webhook-id') ?? undefined,
  )
  revalidateTag(POLAR_PRODUCTS_CACHE_TAG, 'max')

  const metadata = isRecord(payload.data) && isRecord(payload.data.metadata) ? payload.data.metadata : undefined
  const workspaceId = metadata?.workspaceId
  if (typeof workspaceId === 'string' && workspaceId) {
    revalidateTag(`workspace-billing-${workspaceId}`, 'max')
  }

  return NextResponse.json({ received: true })
}
