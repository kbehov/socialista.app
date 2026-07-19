import { HttpError, successResponse } from '@/utils/http-response.js'
import { createWaitlistEntry, isValidEmail } from '@socialista/db'
import type { JoinWaitlistPayload, JoinWaitlistResult } from '@socialista/types'
import type { Context } from 'hono'

const MAX_FIELD_LENGTH = 120
const MAX_REFERRER_LENGTH = 500

function optionalBoundedString(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  return trimmed.slice(0, maxLength)
}

function parseJoinWaitlistInput(body: unknown): JoinWaitlistPayload {
  if (!body || typeof body !== 'object') {
    throw new HttpError(400, 'Invalid request body')
  }

  const record = body as Record<string, unknown>
  const email = typeof record.email === 'string' ? record.email.trim().toLowerCase() : ''

  if (!email) {
    throw new HttpError(400, 'Email is required')
  }
  if (!isValidEmail(email)) {
    throw new HttpError(400, 'Enter a valid email address')
  }

  // Honeypot — bots fill this; treat as success without persisting
  const website = typeof record.website === 'string' ? record.website.trim() : ''
  if (website) {
    return { email, website }
  }

  return {
    email,
    source: optionalBoundedString(record.source, MAX_FIELD_LENGTH),
    utmSource: optionalBoundedString(record.utmSource, MAX_FIELD_LENGTH),
    utmMedium: optionalBoundedString(record.utmMedium, MAX_FIELD_LENGTH),
    utmCampaign: optionalBoundedString(record.utmCampaign, MAX_FIELD_LENGTH),
    referrer: optionalBoundedString(record.referrer, MAX_REFERRER_LENGTH),
  }
}

export const joinWaitlist = async (c: Context) => {
  const input = parseJoinWaitlistInput(await c.req.json())

  if (input.website) {
    const data: JoinWaitlistResult = { email: input.email, alreadyJoined: false }
    return successResponse(c, 201, data)
  }

  const { entry, created } = await createWaitlistEntry({
    email: input.email,
    source: input.source,
    utmSource: input.utmSource,
    utmMedium: input.utmMedium,
    utmCampaign: input.utmCampaign,
    referrer: input.referrer,
  })

  const data: JoinWaitlistResult = {
    email: entry.email,
    alreadyJoined: !created,
  }

  return successResponse(c, created ? 201 : 200, data)
}
