'use client'

import type { PreviewProps } from '../composer-types'
import {
  PreviewAccountHeader,
  PreviewCaption,
  PreviewMedia,
  PreviewShell,
} from './preview-shell'

export function TikTokPreview({ account, caption, media }: PreviewProps) {
  return (
    <PreviewShell frameClassName="max-w-[260px] bg-black text-white">
      <div className="relative">
        <PreviewMedia media={media} aspectClassName="aspect-[9/16]" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-10">
          <PreviewAccountHeader account={account} subtitle="TikTok" />
          <PreviewCaption caption={caption} className="px-3 pb-2 text-white" maxLines={3} />
        </div>
      </div>
    </PreviewShell>
  )
}
