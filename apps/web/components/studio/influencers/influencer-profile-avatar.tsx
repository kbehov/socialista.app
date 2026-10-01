'use client'

import { ImageZoom } from '@/components/kibo-ui/image-zoom'

type InfluencerProfileAvatarProps = {
  imageUrl: string
  name: string
}

export function InfluencerProfileAvatar({ imageUrl, name }: InfluencerProfileAvatarProps) {
  return (
    <div className="relative size-20 shrink-0 overflow-hidden rounded-full bg-muted/40 outline outline-1 outline-[oklch(0_0_0/0.1)] sm:size-24 dark:outline-[oklch(1_0_0/0.1)]">
      <ImageZoom className="size-full [&_img]:size-full [&_img]:cursor-zoom-in [&_img]:rounded-full [&_img]:object-cover">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={name} className="size-full object-cover" />
      </ImageZoom>
    </div>
  )
}
