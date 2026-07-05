'use client'

import { cn } from '@/lib/utils'
import { PlayIcon, VideoIcon } from 'lucide-react'

type VideoCardPreviewProps = {
  previewUrl?: string
  previewType?: 'video' | 'image'
  className?: string
}

function PreviewPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex size-full flex-col items-center justify-center gap-2 bg-neutral-950 text-white/50',
        className,
      )}
    >
      <VideoIcon className="size-5 opacity-60" strokeWidth={1.5} />
      <span className="text-[11px] font-medium">No preview</span>
    </div>
  )
}

function ImagePreview({ src }: { src: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className="size-full object-cover" draggable={false} />
  )
}

function VideoPreview({ src }: { src: string }) {
  return (
    <div className="relative size-full">
      <video
        src={`${src}#t=0.1`}
        muted
        playsInline
        preload="metadata"
        className="size-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
        <div className="flex size-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm">
          <PlayIcon className="ml-0.5 size-4 fill-current" />
        </div>
      </div>
    </div>
  )
}

export function VideoCardPreview({ previewUrl, previewType, className }: VideoCardPreviewProps) {
  if (!previewUrl || !previewType) {
    return <PreviewPlaceholder className={className} />
  }

  return (
    <div className={cn('relative size-full bg-black', className)}>
      {previewType === 'image' ? <ImagePreview src={previewUrl} /> : <VideoPreview src={previewUrl} />}
    </div>
  )
}
