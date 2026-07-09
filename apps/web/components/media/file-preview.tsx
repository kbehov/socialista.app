'use client'

import { cn } from '@/lib/utils'
import { getMediaKind, type MediaKind } from '@/utils/media'
import { FileIcon, PlayIcon } from 'lucide-react'
import { useMemo } from 'react'

export type FilePreviewProps = {
  src: string
  alt?: string
  mimeType?: string
  kind?: MediaKind
  className?: string
  mediaClassName?: string
  showBadge?: boolean
  hoverPlay?: boolean
  objectFit?: 'cover' | 'contain'
  loading?: 'lazy' | 'eager'
}

function VideoPreview({
  src,
  className,
  mediaClassName,
  showBadge,
  hoverPlay,
  objectFit,
}: Pick<FilePreviewProps, 'src' | 'className' | 'mediaClassName' | 'showBadge' | 'hoverPlay' | 'objectFit'>) {
  return (
    <div className={cn('relative size-full overflow-hidden bg-muted', className)}>
      <video
        src={src}
        className={cn('size-full', objectFit === 'contain' ? 'object-contain' : 'object-cover', mediaClassName)}
        preload="metadata"
        muted
        playsInline
        loop={hoverPlay}
        onMouseEnter={hoverPlay ? event => void event.currentTarget.play() : undefined}
        onMouseLeave={
          hoverPlay
            ? event => {
                const video = event.currentTarget
                video.pause()
                video.currentTime = 0
              }
            : undefined
        }
      />

      {hoverPlay && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10">
          <div className="flex size-8 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100">
            <PlayIcon className="size-3.5 fill-current" />
          </div>
        </div>
      )}

      {showBadge && (
        <div className="pointer-events-none absolute right-1 bottom-1 rounded bg-black/60 px-1 py-0.5 text-[10px] font-medium tracking-wide text-white uppercase">
          Video
        </div>
      )}
    </div>
  )
}

function ImagePreview({
  src,
  alt,
  className,
  mediaClassName,
  objectFit,
  loading,
}: Pick<FilePreviewProps, 'src' | 'alt' | 'className' | 'mediaClassName' | 'objectFit' | 'loading'>) {
  return (
    <div className={cn('relative size-full overflow-hidden bg-muted', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading={loading}
        className={cn(
          'size-full transition-transform duration-200 group-hover:scale-105',
          objectFit === 'contain' ? 'object-contain' : 'object-cover',
          mediaClassName,
        )}
      />
    </div>
  )
}

function UnknownPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex size-full flex-col items-center justify-center gap-1 bg-muted text-muted-foreground',
        className,
      )}
    >
      <FileIcon className="size-5" strokeWidth={1.5} />
      <span className="text-[10px] font-medium uppercase">File</span>
    </div>
  )
}

export function FilePreview({
  src,
  alt = '',
  mimeType,
  kind,
  className,
  mediaClassName,
  showBadge = true,
  hoverPlay = true,
  objectFit = 'cover',
  loading = 'lazy',
}: FilePreviewProps) {
  const resolvedKind = useMemo(() => kind ?? getMediaKind(src, mimeType), [kind, src, mimeType])

  return (
    <div className={cn('group relative size-full', className)}>
      {resolvedKind === 'video' ? (
        <VideoPreview
          src={src}
          showBadge={showBadge}
          hoverPlay={hoverPlay}
          objectFit={objectFit}
          mediaClassName={mediaClassName}
        />
      ) : resolvedKind === 'image' ? (
        <ImagePreview src={src} alt={alt} objectFit={objectFit} loading={loading} mediaClassName={mediaClassName} />
      ) : (
        <UnknownPreview />
      )}
    </div>
  )
}
