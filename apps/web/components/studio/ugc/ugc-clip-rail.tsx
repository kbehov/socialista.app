'use client'

import { UgcAddSceneMenu, UGC_SCENE_ICONS } from '@/components/studio/ugc/ugc-add-scene-menu'
import { UgcCampaignPresets } from '@/components/studio/ugc/ugc-campaign-presets'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ugcSceneBadge } from '@/lib/studio/ugc/ugc-stage'
import { cn } from '@/lib/utils'
import {
  UGC_CLIP_TYPE_LABELS,
  UGC_MAX_CLIPS,
  type UgcCampaignPresetId,
  type UgcClip,
  type UgcClipType,
  type UgcProject,
} from '@socialista/types'
import { move } from '@dnd-kit/helpers'
import { DragDropProvider, type DragEndEvent } from '@dnd-kit/react'
import { useSortable } from '@dnd-kit/react/sortable'
import {
  CopyIcon,
  GripVerticalIcon,
  LayoutTemplateIcon,
  MoreHorizontalIcon,
  PlusIcon,
  Trash2Icon,
} from 'lucide-react'
import Image from 'next/image'
import { useCallback, useState } from 'react'

export type ClipRailRun = {
  progress: number
  label: string
}

type UgcClipRailProps = {
  project: UgcProject
  selectedId?: string
  creating?: boolean
  applyingPreset?: boolean
  runsByClipId?: Record<string, ClipRailRun>
  onSelect: (clipId: string) => void
  onAdd: (type: UgcClipType) => void
  onUseStarter: () => void
  onDuplicate: (clipId: string) => void
  onDelete: (clipId: string) => void
  onReorder: (clipIds: string[]) => void
  onApplyPreset: (presetId: UgcCampaignPresetId) => void
}

export function UgcClipRail({
  project,
  selectedId,
  creating,
  applyingPreset,
  runsByClipId,
  onSelect,
  onAdd,
  onUseStarter,
  onDuplicate,
  onDelete,
  onReorder,
  onApplyPreset,
}: UgcClipRailProps) {
  const clips = project.clips
  const atLimit = clips.length >= UGC_MAX_CLIPS
  const canReorder = clips.length > 1
  const [presetOpen, setPresetOpen] = useState(false)

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (event.canceled) return
      const ids = clips.map(clip => clip.id)
      const reordered = move(ids, event) as string[]
      if (reordered.every((id, i) => id === ids[i])) return
      window.setTimeout(() => {
        onReorder(reordered)
      }, 0)
    },
    [clips, onReorder],
  )

  return (
    <aside className="flex shrink-0 flex-col border-b border-black/[0.06] bg-background dark:border-white/[0.08] lg:h-full lg:min-h-0 lg:w-[240px] lg:border-r lg:border-b-0">
      <div className="flex h-10 items-center justify-between gap-2 border-b border-black/[0.06] px-3 dark:border-white/[0.08]">
        <p className="min-w-0 text-[13px] font-medium tracking-tight">
          Scenes
          <span className="ml-1.5 font-normal tabular-nums text-muted-foreground">{clips.length}</span>
        </p>
        <div className="flex shrink-0 items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                className="text-muted-foreground"
                aria-label="Campaign templates"
                onClick={() => setPresetOpen(true)}
              >
                <LayoutTemplateIcon className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Templates</TooltipContent>
          </Tooltip>
          <UgcAddSceneMenu clips={clips} creating={creating} onAdd={onAdd} onUseStarter={onUseStarter}>
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              className="text-muted-foreground"
              disabled={atLimit}
              aria-label="Add scene"
            >
              <PlusIcon className="size-3.5" />
            </Button>
          </UgcAddSceneMenu>
        </div>
      </div>

      <DragDropProvider onDragEnd={handleDragEnd}>
        <div className="mt-2 flex gap-3 overflow-x-auto px-3 pb-3 lg:mt-2.5 lg:min-h-0 lg:flex-1 lg:flex-col lg:gap-2.5 lg:overflow-y-auto lg:overflow-x-hidden lg:px-2 lg:pb-3">
          {clips.length === 0 ? (
            <div className="hidden px-1 py-8 text-center lg:block">
              <p className="text-[12px] leading-relaxed text-muted-foreground">
                Add a scene or start from a template.
              </p>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="mt-2 h-7 text-[12px]"
                disabled={creating}
                onClick={onUseStarter}
              >
                Use a 3-scene ad
              </Button>
            </div>
          ) : (
            clips.map((clip, index) => (
              <SceneRailCard
                key={clip.id}
                clip={clip}
                index={index}
                selected={clip.id === selectedId}
                canReorder={canReorder}
                run={runsByClipId?.[clip.id]}
                onSelect={() => onSelect(clip.id)}
                onDuplicate={() => onDuplicate(clip.id)}
                onDelete={() => onDelete(clip.id)}
              />
            ))
          )}
        </div>
      </DragDropProvider>

      <UgcCampaignPresets
        open={presetOpen}
        applying={applyingPreset}
        onOpenChange={setPresetOpen}
        onApply={presetId => {
          onApplyPreset(presetId)
          setPresetOpen(false)
        }}
      />
    </aside>
  )
}

function SceneRailCard({
  clip,
  index,
  selected,
  canReorder,
  run,
  onSelect,
  onDuplicate,
  onDelete,
}: {
  clip: UgcClip
  index: number
  selected: boolean
  canReorder: boolean
  run?: ClipRailRun
  onSelect: () => void
  onDuplicate: () => void
  onDelete: () => void
}) {
  const preview = clip.thumbnailUrl ?? clip.stills.find(still => still.imageUrl)?.imageUrl
  const generating = Boolean(run) || clip.status === 'generating'
  const Icon = UGC_SCENE_ICONS[clip.type]
  const title = clip.name ?? UGC_CLIP_TYPE_LABELS[clip.type]
  const badge = generating ? (run?.label ?? 'Working') : ugcSceneBadge(clip, generating)
  const progress = run?.progress ?? (generating ? 8 : 0)

  const { ref, handleRef, isDragging, isDropTarget } = useSortable({
    id: clip.id,
    index,
    group: 'ugc-clips',
    disabled: !canReorder,
  })

  return (
    <div
      ref={ref}
      className={cn('group relative w-[72px] shrink-0 lg:w-full', isDragging && 'z-10 opacity-50')}
    >
      <div
        className={cn(
          'relative flex w-full items-center overflow-hidden rounded-lg transition-colors',
          selected ? 'bg-muted' : 'hover:bg-muted/50',
          isDropTarget && !isDragging && 'ring-1 ring-foreground/20 ring-inset',
        )}
      >
        {canReorder ? (
          <button
            ref={handleRef}
            type="button"
            className={cn(
              'flex shrink-0 cursor-grab touch-none items-center justify-center',
              'hover:text-muted-foreground active:cursor-grabbing',
              'absolute top-1 left-0.5 z-10 size-5 rounded-md bg-black/45 text-white/90 backdrop-blur-sm',
              'lg:static lg:size-auto lg:self-stretch lg:bg-transparent lg:px-1 lg:text-muted-foreground/70 lg:backdrop-blur-none',
            )}
            aria-label={`Drag to reorder ${title}`}
            onClick={event => event.preventDefault()}
          >
            <GripVerticalIcon className="size-3.5" />
          </button>
        ) : null}

        <button
          type="button"
          onClick={onSelect}
          aria-pressed={selected}
          className={cn(
            'flex min-w-0 flex-1 items-center gap-2.5 overflow-hidden text-left',
            'active:scale-[0.99] motion-reduce:active:scale-100',
          )}
        >
          <span className="relative hidden aspect-[9/16] w-10 shrink-0 overflow-hidden rounded-md bg-muted lg:block">
            {preview ? (
              <Image alt="" className="object-cover" fill sizes="40px" src={preview} unoptimized />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                <Icon className="size-3" strokeWidth={1.5} />
              </span>
            )}
            {generating ? (
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-black/20">
                <span
                  className="block h-full bg-white/90 transition-[width] duration-300"
                  style={{ width: `${Math.max(8, Math.min(100, progress))}%` }}
                />
              </span>
            ) : null}
          </span>
          <span className="hidden min-w-0 flex-1 py-1.5 pr-7 lg:block">
            <span className="flex items-center gap-1.5 text-[11px] tabular-nums text-muted-foreground">
              {String(index + 1).padStart(2, '0')}
              <span className="text-border">·</span>
              {clip.durationSec}s
            </span>
            <span className="mt-0.5 block truncate text-[13px] font-medium tracking-tight">{title}</span>
            <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">{badge}</span>
          </span>

          <span className="relative aspect-[9/16] w-full overflow-hidden rounded-lg bg-muted lg:hidden">
            {preview ? (
              <Image alt="" className="object-cover" fill sizes="72px" src={preview} unoptimized />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center text-[11px] tabular-nums text-muted-foreground">
                {String(index + 1).padStart(2, '0')}
              </span>
            )}
            {generating ? (
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-black/25">
                <span
                  className="block h-full bg-white/90"
                  style={{ width: `${Math.max(8, Math.min(100, progress))}%` }}
                />
              </span>
            ) : null}
            {selected ? <span className="absolute inset-0 ring-1 ring-foreground/40 ring-inset" /> : null}
          </span>
        </button>
      </div>

      <p className="mt-1 truncate text-center text-[11px] font-medium lg:hidden">{title}</p>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="icon-xs"
            variant="ghost"
            aria-label="Scene actions"
            className="absolute top-1 right-1 z-10 size-6 bg-background/80 text-muted-foreground opacity-100 shadow-sm backdrop-blur-sm lg:top-1.5 lg:right-1 lg:bg-transparent lg:opacity-0 lg:shadow-none lg:backdrop-blur-none lg:group-hover:opacity-100 lg:group-focus-within:opacity-100"
            onClick={event => event.stopPropagation()}
            onPointerDown={event => event.stopPropagation()}
            onMouseDown={event => event.stopPropagation()}
          >
            <MoreHorizontalIcon className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-36">
          <DropdownMenuItem
            onClick={event => {
              event.stopPropagation()
              onDuplicate()
            }}
          >
            <CopyIcon className="size-3.5" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={event => {
              event.stopPropagation()
              onDelete()
            }}
          >
            <Trash2Icon className="size-3.5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
