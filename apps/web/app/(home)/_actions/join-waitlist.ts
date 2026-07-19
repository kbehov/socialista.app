'use server'

import { WAITLIST_ROUTES } from '@/constants/routes'
import { API_URL } from '@/lib/api-url'
import { waitlistSchema } from '@/lib/zod/waitlist.schema'
import type { JoinWaitlistFormState } from '@/app/(home)/_lib/waitlist-form-state'
import type { ApiResponse, JoinWaitlistPayload, JoinWaitlistResult } from '@socialista/types'
import { headers } from 'next/headers'

function optionalHeader(value: string | null): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed.slice(0, 500) : undefined
}

export async function joinWaitlistAction(
  _prevState: JoinWaitlistFormState,
  formData: FormData,
): Promise<JoinWaitlistFormState> {
  const raw = {
    email: String(formData.get('email') ?? ''),
    website: String(formData.get('website') ?? ''),
  }

  const parsed = waitlistSchema.safeParse(raw)
  if (!parsed.success) {
    const emailError = parsed.error.flatten().fieldErrors.email?.[0]
    return {
      status: 'error',
      message: emailError ?? 'Please check your email and try again.',
      fieldErrors: { email: emailError },
    }
  }

  // Honeypot filled — pretend success without hitting the API
  if (parsed.data.website?.trim()) {
    return {
      status: 'success',
      message: 'You’re on the list. We’ll email you when Socialista opens.',
      email: parsed.data.email.trim().toLowerCase(),
    }
  }

  const requestHeaders = await headers()
  const payload: JoinWaitlistPayload = {
    email: parsed.data.email.trim().toLowerCase(),
    source: optionalHeader(formData.get('source')?.toString() ?? 'landing') ?? 'landing',
    utmSource: optionalHeader(formData.get('utmSource')?.toString() ?? null),
    utmMedium: optionalHeader(formData.get('utmMedium')?.toString() ?? null),
    utmCampaign: optionalHeader(formData.get('utmCampaign')?.toString() ?? null),
    referrer: optionalHeader(requestHeaders.get('referer')),
  }

  const secret = process.env.INTERNAL_API_SECRET
  if (!secret) {
    console.error('[waitlist] INTERNAL_API_SECRET is not configured')
    return {
      status: 'error',
      message: 'Something went wrong. Please try again in a moment.',
    }
  }

  try {
    const response = await fetch(`${API_URL}${WAITLIST_ROUTES.JOIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-api-secret': secret,
      },
      body: JSON.stringify(payload),
    })

    const body = (await response.json().catch(() => null)) as ApiResponse<JoinWaitlistResult> | null

    if (!response.ok || !body?.success || !body.data) {
      return {
        status: 'error',
        message: body?.message ?? 'Something went wrong. Please try again in a moment.',
      }
    }

    if (body.data.alreadyJoined) {
      return {
        status: 'duplicate',
        message: 'You’re already on the list. We’ll be in touch soon.',
        email: body.data.email,
      }
    }

    return {
      status: 'success',
      message: 'You’re on the list. We’ll email you when Socialista opens.',
      email: body.data.email,
    }
  } catch (error) {
    console.error('[waitlist] join failed', error)
    return {
      status: 'error',
      message: 'Unable to reach the server. Please try again.',
    }
  }
}
