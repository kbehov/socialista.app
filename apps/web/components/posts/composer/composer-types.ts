import type { Account, PostType, SocialProvider } from '@socialista/types'

export type ComposerMediaItem =
  | {
      kind: 'image'
      url: string
      altText?: string
      thumbnailUrl?: string
    }
  | {
      kind: 'video'
      url: string
      thumbnailUrl?: string
      durationSeconds?: number
    }

export type ComposerVariant = {
  accountId: string
  /** Empty string means inherit commonCaption. */
  caption: string
  description: string
  altText: string
}

export type ComposerScheduleMode = 'now' | 'schedule' | 'draft'

export type ComposerSchedule = {
  mode: ComposerScheduleMode
  /** Local calendar date in the selected timezone. */
  date?: Date
  /** HH:mm in the selected timezone. */
  time?: string
  timezone: string
}

export type ComposerData = {
  workspaceId: string
  selectedAccountIds: string[]
  commonCaption: string
  media: ComposerMediaItem[]
  variants: Record<string, ComposerVariant>
  schedule: ComposerSchedule
  previewAccountId: string | null
}

export type ComposerSubmitResult = {
  accountId: string
  status: 'created' | 'scheduled' | 'draft' | 'failed'
  postId?: string
  message?: string
}

export type ComposerValidationIssue = {
  accountId?: string
  field?: 'caption' | 'media' | 'schedule'
  code?:
    | 'empty'
    | 'caption_required'
    | 'media_required'
    | 'caption_too_long'
    | 'media_count'
    | 'unsupported_kind'
    | 'schedule'
  message: string
}

export type PostComposerProps = {
  workspaceId: string
  accounts: Account[]
}

export type PreviewProps = {
  account: Account
  caption: string
  description: string
  media: ComposerMediaItem[]
  postType: PostType
}

export type PlatformLimits = {
  captionMax: number
  mediaMax: number
  supportedKinds: Array<'image' | 'video'>
  aspectRatios: string[]
  videoMaxSeconds?: number
  supportsTextOnly: boolean
}

export type PlatformLimitsMap = Record<SocialProvider, PlatformLimits>
