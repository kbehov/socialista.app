'use client'

import { getSocialPlatformLabel } from '@/components/icons/social-platform-icon'

import type { PreviewProps } from '../composer-types'
import {
  PreviewAccountHeader,
  PreviewCaption,
  PreviewMedia,
  PreviewShell,
} from './preview-shell'

export function PostPreviewGeneric({ account, caption, media }: PreviewProps) {
  return (
    <PreviewShell>
      <PreviewAccountHeader
        account={account}
        subtitle={getSocialPlatformLabel(account.provider)}
      />
      <div className="space-y-2 px-3 pb-3">
        <PreviewCaption caption={caption} maxLines={6} />
        {media.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-border/50">
            <PreviewMedia media={media} />
          </div>
        ) : null}
      </div>
    </PreviewShell>
  )
}
