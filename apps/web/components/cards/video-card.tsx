'use client'

import { VideoCardPreview } from '@/components/cards/video-card-preview'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/utils/format'
import type { VideoSummaryResponse } from '@socialista/types'
import { CopyIcon, Loader2Icon, Trash2Icon } from 'lucide-react'
import Link from 'next/link'

type VideoCardProps = {
  video: VideoSummaryResponse
  onDelete: (video: VideoSummaryResponse) => void
  onDuplicate: (video: VideoSummaryResponse) => void
  isDuplicating: boolean
}

export function VideoCard({ video, onDelete, onDuplicate, isDuplicating }: VideoCardProps) {
  const href = DASHBOARD_ROUTES.STUDIO.video(video.id)
  const aspectRatio = video.resolution.width / video.resolution.height

  return (
    <article className="group/card relative">
      <Link href={href} className="block focus-visible:outline-none">
        <div
          className={cn(
            'relative w-full overflow-hidden rounded-xl bg-black ring-1 ring-border/60',
            'transition-[box-shadow,ring-color] duration-200',
            'group-hover/card:ring-border group-hover/card:shadow-md',
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          )}
          style={{ aspectRatio }}
        >
          <VideoCardPreview previewUrl={video.previewUrl} previewType={video.previewType} />

          <span className="pointer-events-none absolute bottom-2 left-2 z-20 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
            {video.duration > 0 ? `${video.duration.toFixed(1)}s` : 'Empty'}
          </span>
          <span className="pointer-events-none absolute bottom-2 right-2 z-20 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
            {video.resolution.width}×{video.resolution.height}
          </span>
        </div>
      </Link>

      <div className="mt-2.5 space-y-1.5 px-0.5">
        <Link href={href} className="block min-w-0 focus-visible:underline focus-visible:outline-none">
          <h2 className="truncate text-sm font-medium leading-snug tracking-tight">{video.name}</h2>
        </Link>
        <div className="flex items-center gap-2 text-[11px] tabular-nums text-muted-foreground">
          <span className="shrink-0">{formatRelativeTime(video.updatedAt)}</span>
          <span className="text-border">·</span>
          <span className="truncate">{video.clipCount} clips</span>
        </div>
      </div>

      <div className="absolute top-2 right-2 z-30 flex items-center gap-1 opacity-0 transition-opacity duration-150 group-hover/card:opacity-100 group-focus-within/card:opacity-100">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              className="size-8 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/55 hover:text-white"
              aria-label={`Duplicate ${video.name}`}
              disabled={isDuplicating}
              onClick={event => {
                event.preventDefault()
                event.stopPropagation()
                onDuplicate(video)
              }}
            >
              {isDuplicating ? <Loader2Icon className="size-3.5 animate-spin" /> : <CopyIcon className="size-3.5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Duplicate</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              className="size-8 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/55 hover:text-white"
              aria-label={`Delete ${video.name}`}
              onClick={event => {
                event.preventDefault()
                event.stopPropagation()
                onDelete(video)
              }}
            >
              <Trash2Icon className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Delete</TooltipContent>
        </Tooltip>
      </div>
    </article>
  )
}
