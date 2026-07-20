import { exchangeMetaToken, getLongLivedToken } from '@/lib/connector/meta'
import { accountsRedirect, toOAuthErrorCode } from '@/lib/social-connect'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const storedState = request.cookies.get('meta_state')?.value
    if (!code || !state || storedState !== state) {
      return NextResponse.json({ success: false, message: 'Invalid request parameters' }, { status: 400 })
    }
    const accessToken = await exchangeMetaToken(code)
    const { accessToken: longLivedAccessToken, expiresAt } = await getLongLivedToken(accessToken)
    return NextResponse.json({ success: true, accessToken })
  } catch (error) {
    return accountsRedirect({ error: toOAuthErrorCode(error) })
  }
}
