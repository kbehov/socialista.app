'use client'

import type { PreviewProps } from '../composer-types'
import {
  PreviewAccountHeader,
  PreviewCaption,
  PreviewMedia,
  PreviewShell,
} from './preview-shell'

export function PinterestPreview({ account, caption, media }: PreviewProps) {
  return (
    <PreviewShell frameClassName="max-w-[280px]">
      <div className="overflow-hidden rounded-t-2xl">
        <PreviewMedia media={media} aspectClassName="aspect-[2/3]" />
      </div>
      <div className="space-y-2 px-3 py-3">
        <PreviewCaption caption={caption} maxLines={3} className="font-medium" />
        <PreviewAccountHeader account={account} subtitle="Pinterest" />
      </div>
    </PreviewShell>
  )
}
