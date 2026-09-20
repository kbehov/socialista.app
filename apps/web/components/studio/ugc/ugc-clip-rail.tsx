'use client'

import { UgcAddSceneMenu } from '@/components/studio/ugc/ugc-add-scene-menu'
import { UgcCampaignPresets } from '@/components/studio/ugc/ugc-campaign-presets'
import { UgcInfoTooltip } from '@/components/studio/ugc/ugc-info-tooltip'
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
import type { UgcClipRailRun } from '@/types/ugc.types'
import { UGC_SCENE_ICONS } from '@/utils/ugc/scene.utils'
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
  SparklesIcon,
  Trash2Icon,
  UnfoldHorizontalIcon,
} from 'lucide-react'
import Image from 'next/image'
import { useCallback, useState, type ReactNode } from 'react'

export type { UgcClipRailRun as ClipRailRun }

type UgcClipRailProps = {
  project: UgcProject
  selectedId?: string
  creating?: boolean
  applyingPreset?: boolean
  runsByClipId?: Record<string, UgcClipRailRun>
  onSelect: (clipId: string) => void
  onAdd: (type: UgcClipType) => void
  onUseStarter: () => void
  onDuplicate: (clipId: string) => void
  onDelete: (clipId: string) => void
  onExtend: (clipId: string) => void
  extendingClipId?: string | null
  onReorder: (clipIds: string[]) => void
  onApplyPreset: (presetId: UgcCampaignPresetId) => void
  onPlan?: () => void
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
  onExtend,
  extendingClipId,
  onReorder,
  onApplyPreset,
  onPlan,
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
    <aside
      id="ugc-tour-scenes"
      className="flex shrink-0 flex-col border-b border-black/[0.06] bg-background dark:border-white/[0.08] lg:h-full lg:min-h-0 lg:w-[252px] lg:border-r lg:border-b-0"
    >
      <div className="flex h-10 shrink-0 items-center justify-between gap-2 border-b border-black/[0.06] px-3 dark:border-white/[0.08]">
        <div className="flex min-w-0 items-center gap-1 text-[13px] font-medium tracking-[-0.01em]">
          <span>Scenes</span>
          <span className="font-normal tabular-nums text-muted-foreground">{clips.length}</span>
          <UgcInfoTooltip
            side="bottom"
            label="Your ad is a sequence of short scenes. Each scene: photo → voiceover → video. Drag to reorder."
          />
        </div>
        <div className="flex shrink-0 items-center -space-x-0.5">
          {onPlan ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Plan new UGC video"
                  onClick={onPlan}
                >
                  <SparklesIcon className="size-3.5" strokeWidth={1.75} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Plan new UGC video</TooltipContent>
            </Tooltip>
          ) : null}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
                aria-label="Campaign templates"
                onClick={() => setPresetOpen(true)}
              >
                <LayoutTemplateIcon className="size-3.5" strokeWidth={1.75} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Templates</TooltipContent>
          </Tooltip>
          <UgcAddSceneMenu clips={clips} creating={creating} onAdd={onAdd} onUseStarter={onUseStarter}>
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              disabled={atLimit}
              aria-label="Add scene"
            >
              <PlusIcon className="size-3.5" strokeWidth={1.75} />
            </Button>
          </UgcAddSceneMenu>
        </div>
      </div>

      <DragDropProvider onDragEnd={handleDragEnd}>
        <div className="flex gap-3 overflow-x-auto px-3 pb-3 pt-2.5 [-ms-overflow-style:none] [scrollbar-width:none] lg:min-h-0 lg:flex-1 lg:flex-col lg:gap-1 lg:overflow-y-auto lg:overflow-x-hidden lg:px-2 lg:pb-2.5 lg:pt-2 [&::-webkit-scrollbar]:hidden lg:[&::-webkit-scrollbar]:block lg:[&::-webkit-scrollbar]:w-1.5 lg:[&::-webkit-scrollbar-thumb]:rounded-full lg:[&::-webkit-scrollbar-thumb]:bg-black/10 lg:dark:[&::-webkit-scrollbar-thumb]:bg-white/10">
          {clips.length === 0 ? (
            <div className="hidden px-1 py-10 text-center lg:block">
              <div className="mx-auto flex size-9 items-center justify-center rounded-lg bg-muted/70 ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
                <PlusIcon className="size-4 text-muted-foreground" strokeWidth={1.75} />
              </div>
              <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
                Add a scene or start from a template.
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground/80">
                Scenes play in order, top to bottom.
              </p>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="mt-2.5 h-7 px-2.5 text-[12px] font-medium"
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
                onExtend={() => onExtend(clip.id)}
                extending={extendingClipId === clip.id}
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
  onExtend,
  extending,
}: {
  clip: UgcClip
  index: number
  selected: boolean
  canReorder: boolean
  run?: UgcClipRailRun
  onSelect: () => void
  onDuplicate: () => void
  onDelete: () => void
  onExtend: () => void
  extending?: boolean
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
      className={cn(
        'group relative w-[76px] shrink-0 lg:w-full',
        isDragging && 'z-10 scale-[0.98] opacity-60 motion-reduce:scale-100',
      )}
    >
      <div
        className={cn(
          'relative flex w-full items-stretch overflow-hidden rounded-[10px] transition-colors duration-150',
          selected ? 'bg-muted/90' : 'hover:bg-muted/45',
          isDropTarget && !isDragging && 'ring-1 ring-foreground/25 ring-inset',
        )}
      >
        {selected ? (
          <span
            className="absolute inset-y-2 left-0 z-10 w-0.5 rounded-full bg-foreground"
            aria-hidden
          />
        ) : null}
        {canReorder ? (
          <button
            ref={handleRef}
            type="button"
            className={cn(
              'flex shrink-0 cursor-grab touch-none items-center justify-center',
              'hover:text-foreground active:cursor-grabbing',
              'absolute top-1 left-1 z-10 size-5 rounded-md bg-black/50 text-white/95 backdrop-blur-sm',
              'lg:static lg:w-5 lg:opacity-0 lg:transition-opacity lg:duration-150',
              'lg:bg-transparent lg:text-muted-foreground/60 lg:backdrop-blur-none',
              'lg:group-hover:opacity-100 lg:group-focus-within:opacity-100 lg:hover:text-foreground',
            )}
            aria-label={`Drag to reorder ${title}`}
            onClick={event => event.preventDefault()}
          >
            <GripVerticalIcon className="size-3.5" strokeWidth={1.75} />
          </button>
        ) : null}

        <button
          type="button"
          onClick={onSelect}
          aria-pressed={selected}
          aria-label={`Scene ${index + 1}: ${title}`}
          className={cn(
            'flex min-w-0 flex-1 items-center gap-2 overflow-hidden text-left outline-none',
            'focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-inset',
            'active:scale-[0.99] motion-reduce:active:scale-100',
            canReorder && 'lg:pl-0',
          )}
        >
          <ScenePreview
            preview={preview}
            index={index}
            generating={generating}
            progress={progress}
            selected={selected}
            fallback={<Icon className="size-3.5" strokeWidth={1.5} />}
            className="hidden aspect-[9/16] w-11 shrink-0 rounded-[7px] lg:block"
            progressClassName="from-black/30"
            imageSizes="44px"
          />
          <span className="hidden min-w-0 flex-1 py-2 pr-8 lg:block">
            <span className="flex items-center gap-1.5 text-[11px] leading-none tabular-nums text-muted-foreground">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <span className="text-muted-foreground/35" aria-hidden>
                /
              </span>
              <span>{clip.durationSec}s</span>
            </span>
            <span className="mt-1 block truncate text-[13px] font-medium leading-snug tracking-[-0.01em]">
              {title}
            </span>
            <SceneStatusLine badge={badge} generating={generating} />
          </span>

          <ScenePreview
            preview={preview}
            index={index}
            generating={generating}
            progress={progress}
            selected={selected}
            showIndex
            className="relative aspect-[9/16] w-full overflow-hidden rounded-[10px] shadow-[0_4px_14px_-6px_rgba(0,0,0,0.35)] ring-1 ring-black/[0.08] dark:ring-white/[0.1] lg:hidden"
            progressClassName="from-black/40"
            imageSizes="76px"
          />
        </button>
      </div>

      <div className="mt-1.5 space-y-0.5 text-center lg:hidden">
        <p className="truncate text-[11px] font-medium leading-tight tracking-[-0.01em]">{title}</p>
        <SceneStatusLine badge={badge} generating={generating} className="justify-center" />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="icon-xs"
            variant="ghost"
            aria-label="Scene actions"
            className={cn(
              'absolute top-1 right-1 z-10 size-6 rounded-md',
              'bg-background/85 text-muted-foreground opacity-100 shadow-sm backdrop-blur-sm',
              'lg:top-1.5 lg:right-1.5 lg:size-6 lg:bg-transparent lg:opacity-0 lg:shadow-none lg:backdrop-blur-none',
              'lg:transition-opacity lg:duration-150',
              'lg:group-hover:opacity-100 lg:group-focus-within:opacity-100',
              'hover:bg-background hover:text-foreground lg:hover:bg-muted/80',
            )}
            onClick={event => event.stopPropagation()}
            onPointerDown={event => event.stopPropagation()}
            onMouseDown={event => event.stopPropagation()}
          >
            <MoreHorizontalIcon className="size-3.5" strokeWidth={1.75} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-36">
          <DropdownMenuItem
            disabled={!clip.videoUrl || extending}
            onClick={event => {
              event.stopPropagation()
              onExtend()
            }}
          >
            <UnfoldHorizontalIcon className="size-3.5" />
            Extend
          </DropdownMenuItem>
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

function SceneStatusLine({
  badge,
  generating,
  className,
}: {
  badge: string
  generating: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        'mt-1 flex items-center gap-1.5 truncate text-[11px] leading-none',
        sceneBadgeTone(badge, generating),
        className,
      )}
    >
      {generating ? (
        <span className="relative flex size-1.5 shrink-0">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-40 motion-reduce:animate-none" />
          <span className="relative inline-flex size-1.5 rounded-full bg-current" />
        </span>
      ) : null}
      <span className="truncate">{badge}</span>
    </span>
  )
}

function sceneBadgeTone(badge: string, generating: boolean): string {
  if (generating) return 'text-primary'
  if (badge === 'Rendered' || badge === 'Approved') {
    return 'text-emerald-600 dark:text-emerald-400'
  }
  if (badge === 'Photo ready') return 'text-foreground/75'
  return 'text-muted-foreground'
}

function ScenePreview({
  preview,
  index,
  generating,
  progress,
  selected,
  showIndex,
  fallback,
  className,
  progressClassName,
  imageSizes,
}: {
  preview?: string
  index: number
  generating: boolean
  progress: number
  selected?: boolean
  showIndex?: boolean
  fallback?: ReactNode
  className?: string
  progressClassName?: string
  imageSizes: string
}) {
  const barWidth = `${Math.max(8, Math.min(100, progress))}%`

  return (
    <span
      className={cn(
        'relative overflow-hidden bg-muted/80 ring-1 ring-black/[0.06] dark:ring-white/[0.08]',
        className,
      )}
    >
      {preview ? (
        <Image alt="" className="object-cover" fill sizes={imageSizes} src={preview} unoptimized />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/40 text-muted-foreground">
          {fallback ?? (
            <span className="text-[11px] font-medium tabular-nums text-muted-foreground/80">
              {String(index + 1).padStart(2, '0')}
            </span>
          )}
        </span>
      )}

      {showIndex ? (
        <span className="absolute top-1.5 left-1.5 flex size-[18px] items-center justify-center rounded-full bg-black/45 text-[10px] font-medium tabular-nums text-white/95 backdrop-blur-sm">
          {index + 1}
        </span>
      ) : null}

      {generating ? (
        <>
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/35 to-transparent" />
          <span className={cn('absolute inset-x-1.5 bottom-1 h-[3px] overflow-hidden rounded-full bg-black/25', progressClassName)}>
            <span
              className="block h-full rounded-full bg-white/95 transition-[width] duration-300 ease-out motion-reduce:transition-none"
              style={{ width: barWidth }}
            />
          </span>
        </>
      ) : null}

      {selected ? (
        <span className="pointer-events-none absolute inset-0 rounded-[inherit] ring-2 ring-foreground/35 ring-inset" />
      ) : null}
    </span>
  )
}
