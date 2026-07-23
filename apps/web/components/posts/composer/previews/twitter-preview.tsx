'use client'

import type { PreviewProps } from '../composer-types'
import {
  PreviewAccountHeader,
  PreviewCaption,
  PreviewMedia,
  PreviewShell,
} from './preview-shell'

export function TwitterPreview({ account, caption, media }: PreviewProps) {
  return (
    <PreviewShell>
      <PreviewAccountHeader account={account} subtitle="X" />
      <div className="space-y-2 px-3 pb-3">
        <PreviewCaption caption={caption} maxLines={8} />
        {media.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-border/50">
            <PreviewMedia media={media} aspectClassName="aspect-video" />
          </div>
        ) : null}
        <div className="flex justify-between pt-1 text-[11px] text-muted-foreground">
          <span>Reply</span>
          <span>Repost</span>
          <span>Like</span>
          <span>Share</span>
        </div>
      </div>
    </PreviewShell>
  )
}
