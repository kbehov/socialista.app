'use client'

import { Button } from '@/components/ui/button'
import { clipHasStill } from '@/lib/studio/ugc/ugc-stage'
import { cn } from '@/lib/utils'
import type { UgcClip } from '@socialista/types'
import { UGC_CLIP_TYPE_LABELS } from '@socialista/types'
import { CheckIcon, Loader2Icon, RefreshCwIcon } from 'lucide-react'
import Image from 'next/image'

type UgcSceneCardProps = {
  clip: UgcClip
  index: number
  selected?: boolean
  generating?: boolean
  busy?: boolean
  run?: { progress: number; label: string }
  onSelect: () => void
  onToggleApproved: (approved: boolean) => void
  onRegenerateStill: () => void
  onRegenerateVideo: () => void
}

export function UgcSceneCard({
  clip,
  index,
  selected,
  generating,
  busy,
  run,
  onSelect,
  onToggleApproved,
  onRegenerateStill,
  onRegenerateVideo,
}: UgcSceneCardProps) {
  const still = clip.stills.find(item => item.imageUrl)?.imageUrl
  const hasStill = clipHasStill(clip)
  const approved = Boolean(clip.approved)
  const snippet = clip.script?.text.trim()

  return (
    <div className="space-y-1.5">
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl bg-muted/40 ring-1 transition',
          selected ? 'ring-foreground/35' : 'ring-border/50',
        )}
      >
        <div
          role="button"
          tabIndex={0}
          onClick={onSelect}
          onKeyDown={event => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onSelect()
            }
          }}
          className="relative aspect-[9/16] w-full cursor-pointer"
        >
          {clip.videoUrl ? (
            <video
              className="size-full object-cover"
              playsInline
              muted
              loop
              src={clip.videoUrl}
              poster={clip.thumbnailUrl ?? still}
            />
          ) : still ? (
            <Image alt="" className="object-cover" fill sizes="240px" src={still} unoptimized />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center px-3 text-center text-[12px] text-muted-foreground">
              {UGC_CLIP_TYPE_LABELS[clip.type]}
            </span>
          )}
          {generating ? (
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/45 text-white">
              <Loader2Icon className="size-5 animate-spin" />
              <span className="text-[10px]">{run ? `${Math.round(run.progress)}%` : 'Working'}</span>
            </span>
          ) : null}
        </div>
        {hasStill ? (
          <button
            type="button"
            aria-pressed={approved}
            aria-label={approved ? 'Unapprove scene' : 'Approve scene'}
            onClick={() => onToggleApproved(!approved)}
            className={cn(
              'absolute top-2 right-2 flex size-6 items-center justify-center rounded-full ring-1 transition',
              approved
                ? 'bg-foreground text-background ring-foreground'
                : 'bg-background/80 text-muted-foreground ring-border/70',
            )}
          >
            <CheckIcon className="size-3.5" strokeWidth={2.5} />
          </button>
        ) : null}
      </div>
      <p className="truncate text-[12px] font-medium">
        {index + 1}. {UGC_CLIP_TYPE_LABELS[clip.type]}
      </p>
      {snippet ? (
        <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground">{snippet}</p>
      ) : null}
      {clip.videoUrl ? (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 w-full text-[11px]"
          disabled={busy || generating}
          onClick={onRegenerateVideo}
        >
          <RefreshCwIcon className="size-3" />
          Redo video
        </Button>
      ) : still ? (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 w-full text-[11px]"
          disabled={busy || generating}
          onClick={onRegenerateStill}
        >
          <RefreshCwIcon className="size-3" />
          Redo photo
        </Button>
      ) : null}
    </div>
  )
}
