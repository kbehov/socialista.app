'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { ComposerMediaItem } from '@/types/composer-types'
import { formatHandle, getAccountInitials } from '@/utils/account-display.utils'
import type { AccountSummary } from '@socialista/types'
import { PauseIcon, PlayIcon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { usePreviewEmbedded } from './preview-embed-context'

export function PreviewShell({
  children,
  className,
  frameClassName,
}: {
  children: React.ReactNode
  className?: string
  frameClassName?: string
}) {
  const embedded = usePreviewEmbedded()

  if (embedded) {
    return (
      <div className={cn('w-full overflow-hidden bg-background', className, frameClassName)}>
        {children}
      </div>
    )
  }

  return (
    <div className={cn('flex w-full justify-center', className)}>
      <div
        className={cn(
          'w-full max-w-[260px] overflow-hidden rounded-xl border border-border/50 bg-background',
          'ring-1 ring-foreground/[0.03]',
          frameClassName,
        )}
      >
        {children}
      </div>
    </div>
  )
}

export function PreviewAccountHeader({ account, subtitle }: { account: AccountSummary; subtitle?: string }) {
  const initials = getAccountInitials(account)
  const handle = formatHandle(account.username) || account.accountName

  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5">
      <Avatar className="size-8 ring-1 ring-border/30">
        {account.accountAvatar ? <AvatarImage src={account.accountAvatar} alt={account.accountName} /> : null}
        <AvatarFallback className="text-[10px] font-medium">{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold tracking-tight">{handle}</p>
        {subtitle ? <p className="truncate text-[10px] text-muted-foreground">{subtitle}</p> : null}
      </div>
    </div>
  )
}

export function PreviewMedia({
  media,
  aspectClassName = 'aspect-square',
}: {
  media: ComposerMediaItem[]
  aspectClassName?: string
}) {
  const first = media[0]
  if (!first) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-background text-[11px] text-muted-foreground',
          aspectClassName,
        )}
      >
        No media attached
      </div>
    )
  }

  if (first.kind === 'image') {
    return (
      <div className={cn('relative bg-background', aspectClassName)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={first.url} alt={first.altText || 'Post media'} className="size-full object-cover" />
        {media.length > 1 ? <MediaCountBadge count={media.length} /> : null}
      </div>
    )
  }

  return <PreviewVideoPlayer item={first} mediaCount={media.length} aspectClassName={aspectClassName} />
}

function MediaCountBadge({ count }: { count: number }) {
  return (
    <span className="absolute top-2 right-2 z-20 rounded-full bg-black/65 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
      1/{count}
    </span>
  )
}

function formatPreviewDuration(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${String(secs).padStart(2, '0')}`
}

function PreviewVideoPlayer({
  item,
  mediaCount,
  aspectClassName,
}: {
  item: Extract<ComposerMediaItem, { kind: 'video' }>
  mediaCount: number
  aspectClassName: string
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // Reset play state when the attached video URL changes (media swap / reorder).
  useEffect(() => {
    setIsPlaying(false)
    const video = videoRef.current
    if (!video) return
    video.pause()
    video.currentTime = 0
  }, [item.url])

  const togglePlayback = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      void video.play().catch(() => {
        // Autoplay/play can fail (e.g. browser policy) — keep UI in paused state.
        setIsPlaying(false)
      })
    } else {
      video.pause()
    }
  }, [])

  return (
    <div className={cn('group/preview-video relative bg-black', aspectClassName)}>
      <video
        ref={videoRef}
        src={item.url}
        poster={item.thumbnailUrl}
        muted
        playsInline
        loop
        preload="metadata"
        className="size-full object-cover"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onClick={togglePlayback}
      />

      <button
        type="button"
        onClick={togglePlayback}
        aria-label={isPlaying ? 'Pause video' : 'Play video'}
        className={cn(
          'absolute inset-0 z-10 flex items-center justify-center transition-opacity',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-inset',
          isPlaying
            ? 'bg-transparent opacity-0 hover:bg-black/15 hover:opacity-100'
            : 'bg-black/20 opacity-100',
        )}
      >
        <span
          className={cn(
            'flex size-10 items-center justify-center rounded-full shadow-xs ring-1',
            'bg-background/90 text-foreground ring-border/50 backdrop-blur-sm',
            'transition-transform active:scale-95',
          )}
        >
          {isPlaying ? (
            <PauseIcon className="size-4" strokeWidth={1.75} />
          ) : (
            <PlayIcon className="ml-0.5 size-4 fill-current" strokeWidth={1.75} />
          )}
        </span>
      </button>

      {item.durationSeconds ? (
        <span className="pointer-events-none absolute bottom-2 left-2 z-20 rounded-full bg-black/65 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-white backdrop-blur-sm">
          {formatPreviewDuration(item.durationSeconds)}
        </span>
      ) : null}

      {mediaCount > 1 ? <MediaCountBadge count={mediaCount} /> : null}
    </div>
  )
}

export function PreviewCaption({
  caption,
  className,
  maxLines = 4,
}: {
  caption: string
  className?: string
  maxLines?: number
}) {
  if (!caption.trim()) {
    return <p className={cn('text-xs italic text-muted-foreground/70', className)}>Your caption will appear here</p>
  }

  return (
    <p
      className={cn('whitespace-pre-wrap text-xs leading-relaxed text-foreground', className)}
      style={{
        display: '-webkit-box',
        WebkitLineClamp: maxLines,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}
    >
      {caption}
    </p>
  )
}
