'use client'

import { ImageZoom } from '@/components/kibo-ui/image-zoom'
import { PlayIcon, VideoIcon } from 'lucide-react'

type InfluencerProfileGridCellProps = {
  url: string
  name: string
  index: number
  hasClips: boolean
  canGenerateHook: boolean
  onGenerateHook: () => void
}

export function InfluencerProfileGridCell({
  url,
  name,
  index,
  hasClips,
  canGenerateHook,
  onGenerateHook,
}: InfluencerProfileGridCellProps) {
  return (
    <div className="group/cell relative aspect-square overflow-hidden bg-muted/30 outline outline-1 outline-[oklch(0_0_0/0.1)] dark:outline-[oklch(1_0_0/0.1)]">
      <ImageZoom className="size-full [&_img]:size-full [&_img]:cursor-zoom-in [&_img]:object-cover">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={`${name} ${index + 1}`}
          loading="lazy"
          className="size-full object-cover"
        />
      </ImageZoom>
      {hasClips ? (
        <span className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm">
          <PlayIcon className="size-3 translate-x-px" fill="currentColor" strokeWidth={0} />
        </span>
      ) : null}
      {canGenerateHook ? (
        <button
          type="button"
          onClick={onGenerateHook}
          className="absolute inset-x-1.5 bottom-1.5 flex items-center justify-center gap-1 rounded-full bg-black/55 px-2.5 py-1.5 text-[11px] font-medium text-white opacity-0 backdrop-blur-sm transition-[opacity,scale] duration-150 ease-[cubic-bezier(0.2,0,0,1)] group-hover/cell:opacity-100 group-focus-within/cell:opacity-100 max-sm:opacity-100 active:scale-[0.96]"
        >
          <VideoIcon className="size-3" strokeWidth={1.75} />
          Hook
        </button>
      ) : null}
    </div>
  )
}
