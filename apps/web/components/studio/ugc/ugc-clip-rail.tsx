'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  UGC_CLIP_STORYBOARD_LABELS,
  UGC_CLIP_TYPE_LABELS,
  UGC_MAX_CLIPS,
  ugcClipStoryboardStatus,
  type UgcClip,
  type UgcProject,
} from '@socialista/types'
import { CopyIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

const RING_R = 5
const RING_C = 2 * Math.PI * RING_R

function ClipProgressRing({ progress }: { progress: number }) {
  const clamped = Math.max(0, Math.min(100, progress))
  return (
    <svg className="size-3.5 -rotate-90" viewBox="0 0 14 14" aria-hidden>
      <circle cx="7" cy="7" r={RING_R} fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="2" />
      <circle
        cx="7"
        cy="7"
        r={RING_R}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={RING_C}
        strokeDashoffset={RING_C * (1 - clamped / 100)}
      />
    </svg>
  )
}

export type ClipRailRun = {
  progress: number
  label: string
}

type UgcClipRailProps = {
  project: UgcProject
  clips: UgcClip[]
  selectedId?: string
  creatorNames: Record<string, string>
  runsByClipId?: Record<string, ClipRailRun>
  onSelect: (clipId: string) => void
  onCreate: () => void
  onDuplicate: (clipId: string) => void
  onDelete: (clipId: string) => void
  onReorder: (clipIds: string[]) => void
}

export function UgcClipRail({
  project,
  clips,
  selectedId,
  creatorNames,
  runsByClipId,
  onSelect,
  onCreate,
  onDuplicate,
  onDelete,
  onReorder,
}: UgcClipRailProps) {
  const atLimit = clips.length >= UGC_MAX_CLIPS
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const move = (fromId: string, toId: string) => {
    if (fromId === toId) return
    const ids = clips.map(clip => clip.id)
    const from = ids.indexOf(fromId)
    const to = ids.indexOf(toId)
    if (from < 0 || to < 0) return
    const next = [...ids]
    const [picked] = next.splice(from, 1)
    if (!picked) return
    next.splice(to, 0, picked)
    onReorder(next)
  }

  return (
    <aside className="flex shrink-0 flex-col border-b border-border/40 bg-background lg:h-full lg:min-h-0 lg:w-72 lg:border-r lg:border-b-0">
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold tracking-tight">Clips</p>
          <p className="text-[11px] text-muted-foreground">
            {clips.length === 1 ? '1 clip' : `${clips.length} clips`}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 px-2 text-[11px]"
          disabled={atLimit}
          onClick={onCreate}
        >
          <PlusIcon className="size-3.5" />
          Add
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto px-3 pb-3 lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden">
        {clips.length === 0 ? (
          <p className="hidden py-8 text-center text-[12px] leading-relaxed text-muted-foreground lg:block">
            Add a clip to start generating.
          </p>
        ) : (
          clips.map((clip, index) => {
            const preview =
              clip.thumbnailUrl ?? clip.stills.find(still => still.imageUrl)?.imageUrl
            const selected = clip.id === selectedId
            const status = ugcClipStoryboardStatus(project, clip)
            const run = runsByClipId?.[clip.id]
            const generating = Boolean(run) || clip.status === 'generating'
            const creatorName = clip.influencerId
              ? (creatorNames[clip.influencerId] ?? creatorNames[project.influencerId ?? ''] ?? 'Creator')
              : project.influencerId
                ? (creatorNames[project.influencerId] ?? 'Creator')
                : UGC_CLIP_TYPE_LABELS[clip.type]

            return (
              <div
                key={clip.id}
                draggable
                onDragStart={() => setDraggingId(clip.id)}
                onDragEnd={() => setDraggingId(null)}
                onDragOver={event => event.preventDefault()}
                onDrop={() => {
                  if (draggingId) move(draggingId, clip.id)
                  setDraggingId(null)
                }}
                className={cn('relative w-[96px] shrink-0 lg:w-full', draggingId === clip.id && 'opacity-60')}
              >
                <button
                  type="button"
                  onClick={() => onSelect(clip.id)}
                  aria-label={`${clip.name ?? UGC_CLIP_TYPE_LABELS[clip.type]}, clip ${index + 1}`}
                  aria-pressed={selected}
                  className={cn(
                    'w-full overflow-hidden rounded-xl text-left ring-1 transition active:scale-[0.98]',
                    selected ? 'ring-foreground/40 shadow-sm' : 'ring-border/60 hover:ring-border',
                  )}
                >
                  <div className="relative aspect-[9/16] bg-muted">
                    {preview ? (
                      <Image
                        alt=""
                        className="object-cover"
                        fill
                        sizes="180px"
                        src={preview}
                        unoptimized
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center px-2 text-center text-[10px] text-muted-foreground">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    )}
                    <span className="absolute top-1.5 left-1.5 rounded-full bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                      {String(index + 1).padStart(2, '0')} · {clip.durationSec}s
                    </span>
                    {generating ? (
                      <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-black/55 py-1 text-[10px] font-medium text-white">
                        <ClipProgressRing progress={run?.progress ?? 8} />
                        {run ? `${Math.round(run.progress)}%` : 'Generating'}
                      </span>
                    ) : null}
                  </div>
                </button>
                <p className="mt-1 truncate text-[11px] font-medium">
                  {clip.name ?? UGC_CLIP_TYPE_LABELS[clip.type]}
                </p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {generating ? run?.label ?? 'Generating' : UGC_CLIP_STORYBOARD_LABELS[status]} · {creatorName}
                </p>
                <div className="mt-0.5 flex gap-0.5">
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    aria-label="Duplicate clip"
                    onClick={() => onDuplicate(clip.id)}
                  >
                    <CopyIcon className="size-3" />
                  </Button>
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    aria-label="Delete clip"
                    onClick={() => onDelete(clip.id)}
                  >
                    <Trash2Icon className="size-3" />
                  </Button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </aside>
  )
}
