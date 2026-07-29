import { getSocialPlatformLabel } from '@/components/icons/social-platform-icon'
import type { AccountSummary } from '@socialista/types'

export function normalizeHandle(username?: string | null): string {
  if (!username) return ''
  return username.replace(/^@/, '')
}

/** `@handle` when a username exists; otherwise empty string. */
export function formatHandle(username?: string | null): string {
  const handle = normalizeHandle(username)
  return handle ? `@${handle}` : ''
}

export function getAccountInitials(
  account: Pick<AccountSummary, 'accountName' | 'username'>,
): string {
  return (account.accountName || account.username || '?').slice(0, 2).toUpperCase()
}

export function buildDuplicateNameKeys(accounts: AccountSummary[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const account of accounts) {
    const key = account.accountName.trim().toLowerCase()
    if (!key) continue
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return counts
}

function hasDuplicateName(account: AccountSummary, duplicateNameKeys: Map<string, number>) {
  const key = account.accountName.trim().toLowerCase()
  return (duplicateNameKeys.get(key) ?? 0) > 1
}

/** Prefer handle when display names collide across accounts. */
export function getAccountPrimaryLabel(
  account: AccountSummary,
  duplicateNameKeys: Map<string, number>,
): string {
  const handle = formatHandle(account.username)
  if (hasDuplicateName(account, duplicateNameKeys) && handle) {
    return handle
  }
  return account.accountName
}

export function getAccountSecondaryLabel(
  account: AccountSummary,
  duplicateNameKeys: Map<string, number>,
): string {
  const handle = formatHandle(account.username)
  const platform = getSocialPlatformLabel(account.provider)

  if (hasDuplicateName(account, duplicateNameKeys)) {
    return handle ? `${account.accountName} · ${platform}` : platform
  }

  return handle ? `${handle} · ${platform}` : platform
}

export function getAccountChipLabel(
  account: AccountSummary,
  duplicateNameKeys: Map<string, number>,
): string {
  const handle = formatHandle(account.username)
  if (handle) return handle
  return account.accountName
}

/** Compact “Instagram · @handle” line for preview chrome. */
export function getAccountPreviewMeta(account: AccountSummary): string {
  const platform = getSocialPlatformLabel(account.provider)
  const handle = formatHandle(account.username)
  return handle ? `${platform} · ${handle}` : `${platform} · ${account.accountName}`
}
