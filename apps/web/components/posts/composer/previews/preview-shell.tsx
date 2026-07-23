'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { Account } from '@socialista/types'
import { FilmIcon } from 'lucide-react'

import type { ComposerMediaItem } from '../composer-types'

export function PreviewShell({
  children,
  className,
  frameClassName,
}: {
  children: React.ReactNode
  className?: string
  frameClassName?: string
}) {
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

export function PreviewAccountHeader({
  account,
  subtitle,
}: {
  account: Account
  subtitle?: string
}) {
  const initials = (account.accountName || account.username || '?').slice(0, 2).toUpperCase()
  const handle = account.username
    ? `@${account.username.replace(/^@/, '')}`
    : account.accountName

  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5">
      <Avatar className="size-8 ring-1 ring-border/30">
        {account.accountAvatar ? (
          <AvatarImage src={account.accountAvatar} alt={account.accountName} />
        ) : null}
        <AvatarFallback className="text-[10px] font-medium">{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold tracking-tight">{handle}</p>
        {subtitle ? (
          <p className="truncate text-[10px] text-muted-foreground">{subtitle}</p>
        ) : null}
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
        <img
          src={first.url}
          alt={first.altText || 'Post media'}
          className="size-full object-cover"
        />
        {media.length > 1 ? (
          <span className="absolute top-2 right-2 rounded-full bg-black/65 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
            1/{media.length}
          </span>
        ) : null}
      </div>
    )
  }

  return (
    <div className={cn('relative flex items-center justify-center bg-background', aspectClassName)}>
      {first.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={first.thumbnailUrl} alt="" className="absolute inset-0 size-full object-cover" />
      ) : null}
      <span className="relative z-10 flex size-10 items-center justify-center rounded-full bg-background/90 shadow-xs ring-1 ring-border/50">
        <FilmIcon className="size-4 text-muted-foreground" strokeWidth={1.75} />
      </span>
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
    return (
      <p className={cn('text-xs italic text-muted-foreground/70', className)}>
        Your caption will appear here
      </p>
    )
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
