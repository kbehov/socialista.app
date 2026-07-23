'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  FilmIcon,
  ImageIcon,
  Trash2Icon,
} from 'lucide-react'
import { useState } from 'react'

import type { ComposerMediaItem } from './composer-types'

type MediaCarouselManagerProps = {
  media: ComposerMediaItem[]
  onRemove: (index: number) => void
  onReorder: (fromIndex: number, toIndex: number) => void
  onUpdateAltText: (index: number, altText: string) => void
  className?: string
}

export function MediaCarouselManager({
  media,
  onRemove,
  onReorder,
  onUpdateAltText,
  className,
}: MediaCarouselManagerProps) {
  const [editingAltIndex, setEditingAltIndex] = useState<number | null>(null)

  if (media.length === 0) return null

  return (
    <div className={cn('space-y-2.5', className)}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium text-muted-foreground">
          {media.length} attachment{media.length === 1 ? '' : 's'}
        </p>
        {media.length > 1 ? (
          <p className="text-[10px] text-muted-foreground">Use arrows to reorder</p>
        ) : null}
      </div>

      <ul className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {media.map((item, index) => {
          const isEditingAlt = editingAltIndex === index

          return (
            <li
              key={`${item.url}-${index}`}
              className="w-[7.5rem] shrink-0 overflow-hidden rounded-lg border border-border/50 bg-background"
            >
              <div className="group relative aspect-square bg-background">
                {item.kind === 'image' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.url}
                    alt={item.altText || `Media ${index + 1}`}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full flex-col items-center justify-center gap-1.5 text-muted-foreground">
                    {item.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.thumbnailUrl}
                        alt=""
                        className="absolute inset-0 size-full object-cover"
                      />
                    ) : null}
                    <span className="relative z-10 flex size-8 items-center justify-center rounded-full bg-background/90 shadow-xs ring-1 ring-border/50">
                      <FilmIcon className="size-3.5" strokeWidth={1.75} />
                    </span>
                    {item.durationSeconds ? (
                      <span className="relative z-10 rounded-full bg-background/90 px-1.5 py-0.5 text-[9px] font-medium tabular-nums shadow-xs">
                        {formatDuration(item.durationSeconds)}
                      </span>
                    ) : null}
                  </div>
                )}

                <span className="absolute top-1.5 left-1.5 flex items-center gap-0.5 rounded-full bg-background/90 px-1 py-0.5 text-[9px] font-medium shadow-xs ring-1 ring-border/40">
                  {item.kind === 'image' ? (
                    <ImageIcon className="size-2.5" strokeWidth={1.75} />
                  ) : (
                    <FilmIcon className="size-2.5" strokeWidth={1.75} />
                  )}
                  {index + 1}
                </span>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 size-6 rounded-full bg-background/90 text-destructive opacity-0 shadow-xs ring-1 ring-border/40 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-background hover:text-destructive"
                  onClick={() => onRemove(index)}
                  aria-label="Remove media"
                >
                  <Trash2Icon className="size-3" strokeWidth={1.75} />
                </Button>
              </div>

              <div className="flex items-center gap-0.5 border-t border-border/40 p-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-6 rounded-md"
                  disabled={index === 0}
                  onClick={() => onReorder(index, index - 1)}
                  aria-label="Move left"
                >
                  <ArrowLeftIcon className="size-3" strokeWidth={1.75} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-6 rounded-md"
                  disabled={index === media.length - 1}
                  onClick={() => onReorder(index, index + 1)}
                  aria-label="Move right"
                >
                  <ArrowRightIcon className="size-3" strokeWidth={1.75} />
                </Button>
                {item.kind === 'image' ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 flex-1 rounded-md px-1 text-[9px] font-medium"
                    onClick={() => setEditingAltIndex(isEditingAlt ? null : index)}
                  >
                    Alt
                  </Button>
                ) : (
                  <span className="flex-1" />
                )}
              </div>

              {isEditingAlt && item.kind === 'image' ? (
                <div className="border-t border-border/40 p-1.5">
                  <Input
                    value={item.altText ?? ''}
                    placeholder="Alt text…"
                    className="h-7 text-[10px]"
                    onChange={event => onUpdateAltText(index, event.target.value)}
                  />
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${String(secs).padStart(2, '0')}`
}
