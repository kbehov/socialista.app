'use client'

import { dashboardSurface } from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { UGC_CLIP_TYPE_LABELS, type UgcClip } from '@socialista/types'
import { CopyIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import Image from 'next/image'

type UgcClipGalleryProps = {
  clips: UgcClip[]
  selectedId?: string
  creatorNames: Record<string, string>
  disabled?: boolean
  onSelect: (clipId: string) => void
  onAdd: () => void
  onDuplicate: (clipId: string) => void
  onDelete: (clipId: string) => void
}

export function UgcClipGallery({
  clips,
  selectedId,
  creatorNames,
  disabled,
  onSelect,
  onAdd,
  onDuplicate,
  onDelete,
}: UgcClipGalleryProps) {
  return (
    <section className={dashboardSurface.section}>
      <div className={cn(dashboardSurface.sectionHeader, 'flex items-center justify-between px-4 py-3')}>
        <div>
          <h2 className={dashboardSurface.sectionTitle}>Clips</h2>
          <p className={dashboardSurface.sectionDescription}>
            {clips.length === 1 ? '1 clip' : `${clips.length} clips`} in this project
          </p>
        </div>
        <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={onAdd}>
          <PlusIcon className="size-3.5" />
          Add clip
        </Button>
      </div>
      <div className="flex gap-2 overflow-x-auto p-4">
        {clips.map(clip => {
          const preview = clip.thumbnailUrl ?? clip.stills.find(still => still.imageUrl)?.imageUrl
          const selected = clip.id === selectedId
          return (
            <div key={clip.id} className="relative w-[104px] shrink-0">
              <button
                type="button"
                onClick={() => onSelect(clip.id)}
                className={cn(
                  'w-full overflow-hidden rounded-xl text-left ring-1 transition',
                  selected ? 'ring-foreground/40 shadow-sm' : 'ring-border/60 hover:ring-border',
                )}
              >
                <div className="relative aspect-[9/16] bg-muted">
                  {preview ? (
                    <Image alt="" className="object-cover" fill sizes="104px" src={preview} unoptimized />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center px-2 text-center text-[10px] text-muted-foreground">
                      {UGC_CLIP_TYPE_LABELS[clip.type]}
                    </span>
                  )}
                  <span className="absolute top-1.5 left-1.5 rounded-full bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                    {clip.durationSec}s
                  </span>
                </div>
              </button>
              <p className="mt-1 truncate text-[11px] font-medium">
                {clip.name ?? UGC_CLIP_TYPE_LABELS[clip.type]}
              </p>
              <p className="truncate text-[10px] text-muted-foreground">
                {clip.influencerId ? (creatorNames[clip.influencerId] ?? 'Creator') : UGC_CLIP_TYPE_LABELS[clip.type]}
              </p>
              <div className="mt-1 flex gap-0.5">
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
        })}
      </div>
    </section>
  )
}
