import { buildMetaAuthorizeUrl, ensureMetaIsConfigured } from '@/lib/connector/meta'
import { requireAuthSession } from '@/lib/connector/session'
import crypto from 'crypto'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Ensure Meta is configured
    ensureMetaIsConfigured()
    // Require the user to be authenticated
    await requireAuthSession()
    // Generate a random state for the OAuth flow
    const state = crypto.randomBytes(16).toString('hex')
    // Build the authorize URL
    const url = buildMetaAuthorizeUrl(state)
    // Redirect the user to the authorize URL
    const res = NextResponse.redirect(url)
    // Set the state in a cookie
    res.cookies.set('meta_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 10,
    })
    return res
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
