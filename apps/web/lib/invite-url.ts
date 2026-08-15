import { invitePath } from '@/constants/app-routes'

export function getInviteUrl(token: string) {
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000')

  return `${origin}${invitePath(token)}`
}
