import { exchangeMetaToken, getLongLivedToken, getPages } from '@/lib/connector/meta'
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
    console.log('longLivedAccessToken', longLivedAccessToken, expiresAt)
    const pages = await getPages(longLivedAccessToken)
    console.log('pages', pages)
    const response = NextResponse.redirect(
      `http://localhost:3000/dashboard?` + `connected=true&` + `facebook=${pages.length}&` + `instagram=${1}`,
    )
    response.cookies.delete('meta_state')
    return response
  } catch (error) {
    return accountsRedirect({ error: toOAuthErrorCode(error) })
  }
}
