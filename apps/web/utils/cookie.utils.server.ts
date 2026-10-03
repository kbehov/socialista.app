import { cookies } from 'next/headers'

import {
  COOKIE_CONSENT_ACCEPTED,
  COOKIE_CONSENT_COOKIE,
  COOKIE_CONSENT_ESSENTIAL_ONLY,
  CURRENT_PROJECT_COOKIE,
  CURRENT_WORKSPACE_COOKIE,
} from '@/utils/cookie.utils'

export async function getServerCookie(name: string): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(name)?.value
}

export async function setServerCookie(name: string, value: string, maxAge = 60 * 60 * 24 * 365): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(name, value, {
    path: '/',
    maxAge,
    sameSite: 'lax',
  })
}

export async function getCurrentWorkspaceId(): Promise<string | undefined> {
  return getServerCookie(CURRENT_WORKSPACE_COOKIE)
}

export async function setCurrentWorkspaceId(workspaceId: string): Promise<void> {
  await setServerCookie(CURRENT_WORKSPACE_COOKIE, workspaceId)
}

export async function getCurrentProjectId(): Promise<string | undefined> {
  return getServerCookie(CURRENT_PROJECT_COOKIE)
}

export async function setCurrentProjectId(projectId: string): Promise<void> {
  await setServerCookie(CURRENT_PROJECT_COOKIE, projectId)
}

export async function hasCookieConsent(): Promise<boolean> {
  const value = await getServerCookie(COOKIE_CONSENT_COOKIE)
  return value === COOKIE_CONSENT_ACCEPTED
}

export async function isCookieConsentBannerHidden(): Promise<boolean> {
  const value = await getServerCookie(COOKIE_CONSENT_COOKIE)
  return value === COOKIE_CONSENT_ACCEPTED || value === COOKIE_CONSENT_ESSENTIAL_ONLY
}
