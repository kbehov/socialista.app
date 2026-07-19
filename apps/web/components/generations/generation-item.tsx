'use client'

import { GenerationStatusBadge } from '@/components/generations/generation-status-badge'
import {
  formatAbsoluteDate,
  GENERATION_KIND_LABELS,
  getGenerationTitle,
} from '@/components/generations/generation-meta'
import { Badge } from '@/components/ui/badge'
import { TableCell, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { formatCost, formatDuration, formatRelativeTime } from '@/utils/format'
import type { Generation } from '@socialista/types'
import { ImageIcon, VideoIcon } from 'lucide-react'

type GenerationItemProps = {
  generation: Generation
  onSelect: (generation: Generation) => void
}

function ResultThumb({ generation }: { generation: Generation }) {
  const url = generation.result?.url
  const type = generation.result?.type ?? (generation.kind === 'video' ? 'video' : 'image')

  if (url && type === 'image') {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote generation URLs vary by provider
      <img
        src={url}
        alt=""
        className="size-full object-cover"
      />
    )
  }

  return (
    <span className="flex size-full items-center justify-center text-muted-foreground">
      {type === 'video' ? (
        <VideoIcon className="size-4 opacity-70" strokeWidth={1.75} />
      ) : (
        <ImageIcon className="size-4 opacity-70" strokeWidth={1.75} />
      )}
    </span>
  )
}

export function GenerationItem({ generation, onSelect }: GenerationItemProps) {
  const title = getGenerationTitle(generation.prompt, generation.kind)
  const kindLabel = GENERATION_KIND_LABELS[generation.kind]
  const modelLabel = generation.modelName ?? generation.model

  return (
    <TableRow
      className={cn(
        'group cursor-pointer border-border/50 hover:bg-muted/25',
        'focus-visible:bg-muted/30 focus-visible:outline-none',
      )}
      tabIndex={0}
      role="button"
      aria-label={`View generation: ${title}`}
      onClick={() => onSelect(generation)}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(generation)
        }
      }}
    >
      <TableCell className="px-4 py-3.5 whitespace-normal">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/60">
            <ResultThumb generation={generation} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-1 text-sm font-medium tracking-tight text-foreground">
              {title}
            </p>
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground md:hidden">
              {kindLabel} · {modelLabel}
            </p>
          </div>
        </div>
      </TableCell>

      <TableCell className="hidden px-4 py-3.5 sm:table-cell">
        <Badge variant="secondary" className="font-medium">
          {kindLabel}
        </Badge>
      </TableCell>

      <TableCell className="px-4 py-3.5">
        <GenerationStatusBadge status={generation.status} />
      </TableCell>

      <TableCell className="hidden px-4 py-3.5 md:table-cell">
        <span className="line-clamp-1 text-sm tracking-tight text-foreground">{modelLabel}</span>
      </TableCell>

      <TableCell className="hidden px-4 py-3.5 lg:table-cell">
        <span className="text-xs tabular-nums text-muted-foreground">
          {formatCost(generation.creditsCharged || generation.cost)}
        </span>
      </TableCell>

      <TableCell className="hidden px-4 py-3.5 xl:table-cell">
        <span className="text-xs tabular-nums text-muted-foreground">
          {formatDuration(generation.durationMs)}
        </span>
      </TableCell>

      <TableCell className="hidden px-4 py-3.5 lg:table-cell">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-default text-xs text-muted-foreground">
              {formatRelativeTime(generation.createdAt)}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top">{formatAbsoluteDate(generation.createdAt)}</TooltipContent>
        </Tooltip>
      </TableCell>
    </TableRow>
  )
}
