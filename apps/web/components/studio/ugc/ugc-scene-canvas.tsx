'use client'

import { Button } from '@/components/ui/button'
import { clipHasStill } from '@/lib/studio/ugc/ugc-stage'
import { cn } from '@/lib/utils'
import { getAspectRatioClass } from '@/utils/aspect-ratio'
import type { UgcClip } from '@socialista/types'
import { UGC_CLIP_TYPE_LABELS } from '@socialista/types'
import { CheckIcon, ImageIcon, Loader2Icon, RefreshCwIcon, VideoIcon } from 'lucide-react'
import Image from 'next/image'

type UgcSceneCanvasProps = {
  clip: UgcClip
  aspectRatio?: string
  generatingStill?: boolean
  generatingVideo?: boolean
  stillsProgress?: number
  stillsProgressLabel?: string
  videoProgressLabel?: string
  busy?: boolean
  hideActions?: boolean
  onGenerateStill?: () => void
  onRegenerateStill?: () => void
  onGenerateVideo?: () => void
  onRegenerateVideo?: () => void
  onToggleApproved?: (approved: boolean) => void
}

export function UgcSceneCanvas({
  clip,
  aspectRatio,
  generatingStill,
  generatingVideo,
  stillsProgress,
  stillsProgressLabel,
  videoProgressLabel,
  busy,
  hideActions,
  onGenerateStill,
  onRegenerateStill,
  onGenerateVideo,
  onRegenerateVideo,
  onToggleApproved,
}: UgcSceneCanvasProps) {
  const still = clip.stills.find(item => item.imageUrl)?.imageUrl
  const hasStill = clipHasStill(clip)
  const generating = generatingStill || generatingVideo || clip.status === 'generating'
  const progressLabel = generatingVideo
    ? videoProgressLabel ?? 'Rendering…'
    : stillsProgressLabel ?? 'Generating photo…'
  const progress = stillsProgress

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 p-4 lg:p-6">
      <div
        className={cn(
          'relative mx-auto w-full max-w-[320px] overflow-hidden rounded-3xl bg-muted/40 ring-1 ring-border/60',
          clip.approved && 'ring-foreground/30',
        )}
      >
        <div className={cn('relative w-full', getAspectRatioClass(aspectRatio ?? '9:16'))}>
          {clip.videoUrl ? (
            <video
              className="size-full object-cover"
              controls
              playsInline
              loop
              src={clip.videoUrl}
              poster={clip.thumbnailUrl ?? still}
            />
          ) : still ? (
            <Image alt="" className="object-cover" fill sizes="320px" src={still} unoptimized />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
              <ImageIcon className="size-6 text-muted-foreground" strokeWidth={1.5} />
              <p className="text-[13px] font-medium">First scene photo</p>
              <p className="text-[11px] text-muted-foreground">
                Generate a start frame for {UGC_CLIP_TYPE_LABELS[clip.type].toLowerCase()}.
              </p>
            </div>
          )}
          {generating ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 text-white">
              <Loader2Icon className="size-6 animate-spin" />
              <p className="text-[12px]">{progressLabel}</p>
              {typeof progress === 'number' ? (
                <p className="text-[11px] tabular-nums">{Math.round(progress)}%</p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {hideActions ? null : (
        <div className="mx-auto flex w-full max-w-[320px] flex-col gap-2">
          {hasStill ? (
            <div className="flex gap-2">
              <Button
                type="button"
                variant={clip.videoUrl ? 'outline' : 'default'}
                className="h-9 flex-1 text-[13px]"
                disabled={busy || generating}
                onClick={clip.videoUrl ? onRegenerateVideo : onGenerateVideo}
              >
                {generatingVideo ? (
                  <Loader2Icon className="size-3.5 animate-spin" />
                ) : clip.videoUrl ? (
                  <RefreshCwIcon className="size-3.5" />
                ) : (
                  <VideoIcon className="size-3.5" />
                )}
                {clip.videoUrl ? 'Redo video' : 'Generate video'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-9 px-3"
                disabled={busy || generating}
                onClick={onRegenerateStill}
              >
                <RefreshCwIcon className="size-3.5" />
                Photo
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              className="h-9 w-full text-[13px]"
              disabled={busy || generating}
              onClick={onGenerateStill}
            >
              {generatingStill ? <Loader2Icon className="size-3.5 animate-spin" /> : <ImageIcon className="size-3.5" />}
              Generate first-scene photo
            </Button>
          )}
          {hasStill ? (
            <Button
              type="button"
              variant={clip.approved ? 'default' : 'outline'}
              className="h-8 text-[12px]"
              disabled={busy || generating}
              onClick={() => onToggleApproved?.(!clip.approved)}
            >
              <CheckIcon className="size-3.5" />
              {clip.approved ? 'Approved' : 'Approve scene'}
            </Button>
          ) : null}
        </div>
      )}
    </div>
  )
}
