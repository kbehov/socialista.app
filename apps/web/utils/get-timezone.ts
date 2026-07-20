import type { NextRequest } from 'next/server'

export const getTimezone = async (request: NextRequest) => {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') || // Cloudflare
    '8.8.8.8' // fallback for local dev
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=timezone,status,message`)
    const data = await res.json()
    return data.timezone
  } catch (error) {
    console.error('Error getting timezone', error)
    return 'UTC'
  }
}
