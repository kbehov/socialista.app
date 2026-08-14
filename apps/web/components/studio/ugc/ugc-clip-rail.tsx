'use client'

import { UgcClipTypePicker } from '@/components/studio/ugc/ugc-clip-type-picker'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { UGC_CLIP_TYPE_LABELS, UGC_MAX_CLIPS, type UgcClip, type UgcClipType } from '@socialista/types'
import { CopyIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import Image from 'next/image'

type UgcClipRailProps = {
  clips: UgcClip[]
  selectedId?: string
  creatorNames: Record<string, string>
  disabled?: boolean
  typeDialogOpen: boolean
  onTypeDialogOpenChange: (open: boolean) => void
  onSelect: (clipId: string) => void
  onCreate: (type: UgcClipType) => void
  onDuplicate: (clipId: string) => void
  onDelete: (clipId: string) => void
}

export function UgcClipRail({
  clips,
  selectedId,
  creatorNames,
  disabled,
  typeDialogOpen,
  onTypeDialogOpenChange,
  onSelect,
  onCreate,
  onDuplicate,
  onDelete,
}: UgcClipRailProps) {
  const atLimit = clips.length >= UGC_MAX_CLIPS

  return (
    <aside className="flex shrink-0 flex-col border-b border-border/40 bg-background lg:h-full lg:min-h-0 lg:w-52 lg:border-r lg:border-b-0">
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
          disabled={disabled || atLimit}
          onClick={() => onTypeDialogOpenChange(true)}
        >
          <PlusIcon className="size-3.5" />
          Add
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto px-3 pb-3 lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden">
        {clips.length === 0 ? (
          <p className="hidden py-6 text-center text-[11px] leading-relaxed text-muted-foreground lg:block">
            Pick a clip type to start this project.
          </p>
        ) : (
          clips.map(clip => {
            const preview = clip.thumbnailUrl ?? clip.stills.find(still => still.imageUrl)?.imageUrl
            const selected = clip.id === selectedId
            return (
              <div key={clip.id} className="relative w-[88px] shrink-0 lg:w-full">
                <button
                  type="button"
                  onClick={() => onSelect(clip.id)}
                  className={cn(
                    'w-full overflow-hidden rounded-xl text-left ring-1 transition active:scale-[0.98]',
                    selected ? 'ring-foreground/40 shadow-sm' : 'ring-border/60 hover:ring-border',
                  )}
                >
                  <div className="relative aspect-[9/16] bg-muted">
                    {preview ? (
                      <Image alt="" className="object-cover" fill sizes="160px" src={preview} unoptimized />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center px-2 text-center text-[10px] text-muted-foreground">
                        {UGC_CLIP_TYPE_LABELS[clip.type]}
                      </span>
                    )}
                    <span className="absolute top-1.5 left-1.5 rounded-full bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                      {clip.durationSec}s
                    </span>
                    {clip.status === 'generating' ? (
                      <span className="absolute inset-x-0 bottom-0 bg-black/50 py-1 text-center text-[10px] font-medium text-white">
                        Generating
                      </span>
                    ) : null}
                  </div>
                </button>
                <p className="mt-1 truncate text-[11px] font-medium">
                  {clip.name ?? UGC_CLIP_TYPE_LABELS[clip.type]}
                </p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {clip.influencerId ? (creatorNames[clip.influencerId] ?? 'Creator') : UGC_CLIP_TYPE_LABELS[clip.type]}
                </p>
                <div className="mt-0.5 flex gap-0.5">
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    disabled={disabled}
                    aria-label="Duplicate clip"
                    onClick={() => onDuplicate(clip.id)}
                  >
                    <CopyIcon className="size-3" />
                  </Button>
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    disabled={disabled}
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

      <Dialog open={typeDialogOpen} onOpenChange={onTypeDialogOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>What do you want to make?</DialogTitle>
            <DialogDescription>Each clip is its own 5–15s video. Add as many as you need.</DialogDescription>
          </DialogHeader>
          <UgcClipTypePicker
            framed={false}
            disabled={disabled}
            onSelect={type => {
              onCreate(type)
              onTypeDialogOpenChange(false)
            }}
          />
        </DialogContent>
      </Dialog>
    </aside>
  )
}
