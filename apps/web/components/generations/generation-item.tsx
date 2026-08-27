'use client'

import { GENERATION_KIND_LABELS, getGenerationTitle } from '@/components/generations/generation-meta'
import { GenerationStatusBadge } from '@/components/generations/generation-status-badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { formatAbsoluteDate, formatCost, formatDuration, formatRelativeTime } from '@/utils/format'
import type { Generation } from '@socialista/types'
import { ImageIcon, ImagesIcon, VideoIcon } from 'lucide-react'

const ROW_GRID =
  'sm:grid sm:grid-cols-[minmax(0,1fr)_4.75rem_5.25rem] sm:items-center sm:gap-3 md:grid-cols-[minmax(0,1fr)_4.75rem_5.25rem_minmax(0,6.5rem)] lg:grid-cols-[minmax(0,1fr)_4.75rem_5.25rem_minmax(0,6.5rem)_3.75rem_4.75rem] xl:grid-cols-[minmax(0,1fr)_4.75rem_5.25rem_minmax(0,6.5rem)_3.75rem_3.75rem_4.75rem]'

type GenerationItemProps = {
  generation: Generation
  index: number
  onSelect: (generation: Generation) => void
}

function ResultThumb({ generation }: { generation: Generation }) {
  const result = generation.result
  const type = result?.type ?? (generation.kind === 'video' ? 'video' : 'image')
  const rawImage = type === 'video' ? result?.thumbnailUrl : result?.url
  const imageSrc = rawImage && /^https?:\/\//.test(rawImage) ? rawImage : undefined
  const isRunning = generation.status === 'running'

  if (imageSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote generation URLs vary by provider
      <img src={imageSrc} alt="" className="size-full object-contain" />
    )
  }

  return (
    <span
      className={cn(
        'flex size-full items-center justify-center text-foreground/44',
        isRunning && 'motion-safe:animate-pulse',
      )}
    >
      {type === 'video' ? (
        <VideoIcon className="size-3.5" strokeWidth={1.5} />
      ) : generation.kind === 'slideshow' ? (
        <ImagesIcon className="size-3.5" strokeWidth={1.5} />
      ) : (
        <ImageIcon className="size-3.5" strokeWidth={1.5} />
      )}
    </span>
  )
}

export function GenerationItem({ generation, index, onSelect }: GenerationItemProps) {
  const title = getGenerationTitle(generation.prompt, generation.kind)
  const kindLabel = GENERATION_KIND_LABELS[generation.kind]
  const modelLabel = generation.modelName ?? generation.model

  return (
    <li
      className={cn(
        'group cursor-pointer transition-colors duration-150 ease-out',
        'hover:bg-foreground/[0.05] focus-visible:bg-foreground/[0.05]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:ring-inset',
        index % 2 === 1 && 'bg-foreground/[0.03]',
      )}
      tabIndex={0}
      role="button"
      aria-label={`View ${kindLabel.toLowerCase()} generation: ${title}`}
      onClick={() => onSelect(generation)}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(generation)
        }
      }}
    >
      <div className={cn('flex items-center gap-3 py-2', ROW_GRID)}>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="relative size-11 shrink-0 overflow-hidden rounded-md bg-foreground/[0.04]">
            <ResultThumb generation={generation} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium leading-tight tracking-[-0.01em] text-foreground">
              {title}
            </p>
            <p className="mt-0.5 truncate text-[11px] leading-tight text-foreground/56 sm:hidden">
              {kindLabel}
              <span aria-hidden> · </span>
              {modelLabel}
            </p>
          </div>
        </div>

        <div className="hidden min-w-0 sm:block">
          <span className="block truncate text-[13px] text-foreground/56">{kindLabel}</span>
        </div>

        <div className="hidden sm:block">
          <GenerationStatusBadge status={generation.status} />
        </div>

        <div className="hidden min-w-0 md:block">
          <span className="block truncate text-[13px] text-foreground/56">{modelLabel}</span>
        </div>

        <div className="hidden lg:block">
          <span className="text-[13px] tabular-nums text-foreground/56">
            {formatCost(generation.creditsCharged || generation.cost)}
          </span>
        </div>

        <div className="hidden xl:block">
          <span className="text-[13px] tabular-nums text-foreground/56">
            {formatDuration(generation.durationMs)}
          </span>
        </div>

        <div className="hidden lg:block">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-default text-[13px] text-foreground/56">
                {formatRelativeTime(generation.createdAt)}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">{formatAbsoluteDate(generation.createdAt)}</TooltipContent>
          </Tooltip>
        </div>

        <div className="shrink-0 sm:hidden">
          <GenerationStatusBadge status={generation.status} />
        </div>
      </div>
    </li>
  )
}

export { ROW_GRID as GENERATION_ROW_GRID }
