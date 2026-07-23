'use client'

import type { PreviewProps } from '../composer-types'
import {
  PreviewAccountHeader,
  PreviewCaption,
  PreviewMedia,
  PreviewShell,
} from './preview-shell'

export function LinkedInPreview({ account, caption, media }: PreviewProps) {
  return (
    <PreviewShell>
      <PreviewAccountHeader account={account} subtitle="LinkedIn · Just now" />
      <div className="space-y-2 px-3 pb-3">
        <PreviewCaption caption={caption} maxLines={6} />
      </div>
      {media.length > 0 ? <PreviewMedia media={media} aspectClassName="aspect-video" /> : null}
      <div className="flex items-center gap-4 border-t border-border/50 px-3 py-2 text-[11px] text-muted-foreground">
        <span>Like</span>
        <span>Comment</span>
        <span>Repost</span>
        <span>Send</span>
      </div>
    </PreviewShell>
  )
}
