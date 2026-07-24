import { fromZonedTime } from 'date-fns-tz'
import type {
  AccountSummary,
  CreatePostPayload,
  PostCarouselItem,
  PostContent,
  PostType,
  SocialProvider,
} from '@socialista/types'

import { getPlatformLimits, getProvidersRequiringMedia, formatProviderList } from './platform-limits'
import type {
  ComposerData,
  ComposerMediaItem,
  ComposerSchedule,
  ComposerValidationIssue,
  ComposerVariant,
} from './composer-types'
import { getSocialPlatformLabel } from '@/components/icons/social-platform-icon'

export function createEmptyVariant(accountId: string): ComposerVariant {
  return {
    accountId,
    caption: '',
    description: '',
    altText: '',
  }
}

export function derivePostType(media: ComposerMediaItem[]): PostType {
  if (media.length === 0) return 'text'
  if (media.length > 1) return 'carousel'
  const first = media[0]
  if (!first) return 'text'
  return first.kind === 'video' ? 'video' : 'image'
}

/** Prefer reel for single short video on IG/TikTok when publishing. */
export function resolvePostTypeForProvider(
  media: ComposerMediaItem[],
  provider: SocialProvider,
): PostType {
  const type = derivePostType(media)
  if (type !== 'video') return type
  if (provider === 'instagram' || provider === 'tiktok') return 'reel'
  return 'video'
}

export function mergeVariantCaption(
  commonCaption: string,
  variant: ComposerVariant | undefined,
): string {
  const override = variant?.caption?.trim()
  if (override) return override
  return commonCaption
}

export function mergeVariantDescription(variant: ComposerVariant | undefined): string | undefined {
  const value = variant?.description?.trim()
  return value || undefined
}

export function mergeVariantAltText(
  mediaAlt: string | undefined,
  variant: ComposerVariant | undefined,
): string | undefined {
  const override = variant?.altText?.trim()
  if (override) return override
  return mediaAlt?.trim() || undefined
}

export function buildPostContent(
  media: ComposerMediaItem[],
  caption: string,
  altText?: string,
): PostContent {
  const type = derivePostType(media)

  if (type === 'text') {
    return { body: caption.trim() || ' ' }
  }

  if (type === 'carousel') {
    const items: PostCarouselItem[] = media.map(item => {
      if (item.kind === 'video') {
        return {
          kind: 'video' as const,
          url: item.url,
          thumbnailUrl: item.thumbnailUrl,
          durationSeconds: item.durationSeconds,
        }
      }
      return {
        kind: 'image' as const,
        url: item.url,
        altText: altText ?? item.altText,
      }
    })
    return { items }
  }

  const first = media[0]
  if (!first) return { body: caption.trim() || ' ' }

  if (first.kind === 'video') {
    return {
      media: {
        url: first.url,
        thumbnailUrl: first.thumbnailUrl,
        durationSeconds: first.durationSeconds,
      },
    }
  }

  return {
    media: {
      url: first.url,
      altText: altText ?? first.altText,
    },
  }
}

export function resolveScheduleDate(schedule: ComposerSchedule): Date | null {
  if (schedule.mode !== 'schedule' || !schedule.date || !schedule.time) return null

  const year = schedule.date.getFullYear()
  const month = String(schedule.date.getMonth() + 1).padStart(2, '0')
  const day = String(schedule.date.getDate()).padStart(2, '0')
  const time = schedule.time.length === 5 ? schedule.time : '09:00'
  const localIso = `${year}-${month}-${day}T${time}:00`

  try {
    return fromZonedTime(localIso, schedule.timezone)
  } catch {
    return null
  }
}

export function formatTimeInput(date: Date = new Date()): string {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

/** Default schedule: today (or tomorrow if +1h crosses midnight) at now + 1 hour. */
export function getDefaultScheduleFields(now = new Date()): { date: Date; time: string } {
  const scheduled = new Date(now.getTime() + 60 * 60 * 1000)
  return {
    date: new Date(scheduled.getFullYear(), scheduled.getMonth(), scheduled.getDate()),
    time: formatTimeInput(scheduled),
  }
}

export function withScheduleDefaults(schedule: ComposerSchedule): ComposerSchedule {
  if (schedule.mode !== 'schedule') return schedule

  const defaults = getDefaultScheduleFields()
  return {
    ...schedule,
    date: schedule.date ?? defaults.date,
    time: schedule.time ?? defaults.time,
  }
}

export function validateComposer(
  state: ComposerData,
  accounts: AccountSummary[],
): ComposerValidationIssue[] {
  const issues: ComposerValidationIssue[] = []
  const accountById = new Map(accounts.map(account => [account._id, account]))

  if (state.selectedAccountIds.length === 0) {
    issues.push({ code: 'empty', message: 'Select at least one account' })
    return issues
  }

  const caption = state.commonCaption.trim()
  const hasMedia = state.media.length > 0

  if (!caption && !hasMedia) {
    issues.push({ code: 'empty', message: 'Add a caption or media to continue' })
  }

  for (const accountId of state.selectedAccountIds) {
    const account = accountById.get(accountId)
    if (!account) {
      issues.push({ accountId, message: 'Account not found' })
      continue
    }

    const platformLabel = getSocialPlatformLabel(account.provider)
    const limits = getPlatformLimits(account.provider)
    const variant = state.variants[accountId]
    const resolvedCaption = mergeVariantCaption(state.commonCaption, variant).trim()

    if (!resolvedCaption && !hasMedia) {
      issues.push({
        accountId,
        field: 'caption',
        code: 'caption_required',
        message: `Add a caption for ${account.accountName}`,
      })
    }

    if (!hasMedia && !limits.supportsTextOnly) {
      issues.push({
        accountId,
        field: 'media',
        code: 'media_required',
        message: `${platformLabel} requires an image or video — text-only posts aren't supported`,
      })
    }

    if (resolvedCaption.length > limits.captionMax) {
      issues.push({
        accountId,
        field: 'caption',
        code: 'caption_too_long',
        message: `Caption exceeds ${limits.captionMax.toLocaleString()} characters for ${platformLabel}`,
      })
    }

    if (state.media.length > limits.mediaMax) {
      issues.push({
        accountId,
        field: 'media',
        code: 'media_count',
        message: `${platformLabel} allows up to ${limits.mediaMax} media items`,
      })
    }

    for (const item of state.media) {
      if (!limits.supportedKinds.includes(item.kind)) {
        issues.push({
          accountId,
          field: 'media',
          code: 'unsupported_kind',
          message: `${platformLabel} does not support ${item.kind} posts`,
        })
        break
      }
    }
  }

  if (state.schedule.mode === 'schedule') {
    if (!state.schedule.date) {
      issues.push({ field: 'schedule', code: 'schedule', message: 'Pick a schedule date' })
    }
    if (!state.schedule.time) {
      issues.push({ field: 'schedule', code: 'schedule', message: 'Pick a schedule time' })
    }
    const scheduledAt = resolveScheduleDate(state.schedule)
    if (scheduledAt && scheduledAt.getTime() <= Date.now()) {
      issues.push({
        field: 'schedule',
        code: 'schedule',
        message: 'Schedule time must be in the future',
      })
    }
    if (!scheduledAt && state.schedule.date && state.schedule.time) {
      issues.push({
        field: 'schedule',
        code: 'schedule',
        message: 'Invalid schedule date or timezone',
      })
    }
  }

  return issues
}

export type GroupedValidationIssue = {
  code: NonNullable<ComposerValidationIssue['code']>
  message: string
  accountIds: string[]
}

export function groupValidationIssues(
  issues: ComposerValidationIssue[],
): GroupedValidationIssue[] {
  const groups = new Map<string, GroupedValidationIssue>()

  for (const issue of issues) {
    const code = issue.code ?? 'empty'
    const key = `${code}:${issue.message}`
    const existing = groups.get(key)
    if (existing) {
      if (issue.accountId) existing.accountIds.push(issue.accountId)
      continue
    }
    groups.set(key, {
      code,
      message: issue.message,
      accountIds: issue.accountId ? [issue.accountId] : [],
    })
  }

  return [...groups.values()]
}

export function getMediaRequirementHint(
  providers: SocialProvider[],
  hasMedia: boolean,
): string | null {
  if (hasMedia) return null
  const requiringMedia = getProvidersRequiringMedia(providers)
  if (requiringMedia.length === 0) return null
  return `${formatProviderList(requiringMedia)} require${requiringMedia.length === 1 ? 's' : ''} an image or video`
}

export function getAccountsWithIssues(
  issues: ComposerValidationIssue[],
): Set<string> {
  return new Set(
    issues.flatMap(issue => (issue.accountId ? [issue.accountId] : [])),
  )
}

export function buildCreatePayload(params: {
  workspaceId: string
  account: AccountSummary
  state: ComposerData
  status?: CreatePostPayload['status']
  scheduledAt?: Date
}): CreatePostPayload {
  const { workspaceId, account, state, status, scheduledAt } = params
  const variant = state.variants[account._id]
  const caption = mergeVariantCaption(state.commonCaption, variant)
  const description = mergeVariantDescription(variant)
  const firstImage = state.media.find(item => item.kind === 'image')
  const altText = mergeVariantAltText(
    firstImage && firstImage.kind === 'image' ? firstImage.altText : undefined,
    variant,
  )
  const type = resolvePostTypeForProvider(state.media, account.provider)
  const content = buildPostContent(state.media, caption, altText)

  return {
    workspaceId,
    accountId: account._id,
    provider: account.provider,
    type,
    content,
    timezone: state.schedule.timezone,
    status,
    caption: caption.trim() || undefined,
    description,
    scheduledAt,
  }
}

export function getDefaultTimezone(accounts: AccountSummary[], selectedIds: string[]): string {
  const firstSelected = accounts.find(account => selectedIds.includes(account._id))
  if (firstSelected?.timezone) return firstSelected.timezone
  if (accounts[0]?.timezone) return accounts[0].timezone
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}
