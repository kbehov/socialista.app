'use client'

import type { PreviewProps } from '../composer-types'
import {
  PreviewAccountHeader,
  PreviewCaption,
  PreviewMedia,
  PreviewShell,
} from './preview-shell'

export function ThreadsPreview({ account, caption, media }: PreviewProps) {
  return (
    <PreviewShell>
      <PreviewAccountHeader account={account} subtitle="Threads" />
      <div className="space-y-2 px-3 pb-3">
        <PreviewCaption caption={caption} maxLines={8} />
        {media.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-border/50">
            <PreviewMedia media={media} aspectClassName="aspect-square" />
          </div>
        ) : null}
      </div>
    </PreviewShell>
  )
}
