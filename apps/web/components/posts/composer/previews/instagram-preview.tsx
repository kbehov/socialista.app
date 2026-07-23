'use client'

import type { PreviewProps } from '../composer-types'
import {
  PreviewAccountHeader,
  PreviewCaption,
  PreviewMedia,
  PreviewShell,
} from './preview-shell'

export function InstagramPreview({ account, caption, media }: PreviewProps) {
  return (
    <PreviewShell>
      <PreviewAccountHeader account={account} subtitle="Instagram" />
      <PreviewMedia media={media} aspectClassName="aspect-[4/5]" />
      <div className="space-y-2 px-3 py-3">
        <div className="flex gap-3 text-muted-foreground">
          <HeartDots />
        </div>
        <PreviewCaption caption={caption} />
      </div>
    </PreviewShell>
  )
}

function HeartDots() {
  return (
    <div className="flex items-center gap-3 text-[11px]">
      <span>♡</span>
      <span>💬</span>
      <span>➤</span>
    </div>
  )
}
