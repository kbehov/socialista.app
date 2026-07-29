'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { ComposerLayout } from '@/types/composer-types'
import { move } from '@dnd-kit/helpers'
import { DragDropProvider, type DragEndEvent } from '@dnd-kit/react'
import { useSortable } from '@dnd-kit/react/sortable'
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  FilmIcon,
  GripVerticalIcon,
  ImageIcon,
  Trash2Icon,
} from 'lucide-react'
import { useCallback, useState } from 'react'

import type { ComposerMediaItem } from '@/types/composer-types'

type MediaCarouselManagerProps = {
  media: ComposerMediaItem[]
  onRemove: (index: number) => void
  onReorder: (fromIndex: number, toIndex: number) => void
  onUpdateAltText: (index: number, altText: string) => void
  className?: string
  layout?: ComposerLayout
}

function MediaThumbnail({ item, index }: { item: ComposerMediaItem; index: number }) {
  return (
    <div className="relative aspect-square size-full overflow-hidden rounded-md bg-muted">
      {item.kind === 'image' ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.url} alt={item.altText || `Media ${index + 1}`} className="size-full object-cover" />
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-1.5 text-muted-foreground">
          {item.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.thumbnailUrl} alt="" className="absolute inset-0 size-full object-cover" />
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

      <span className="absolute top-1 left-1 flex items-center gap-0.5 rounded-full bg-background/90 px-1 py-0.5 text-[9px] font-medium shadow-xs ring-1 ring-border/40">
        {item.kind === 'image' ? (
          <ImageIcon className="size-2.5" strokeWidth={1.75} />
        ) : (
          <FilmIcon className="size-2.5" strokeWidth={1.75} />
        )}
        {index + 1}
      </span>
    </div>
  )
}

export function MediaCarouselManager({
  media,
  onRemove,
  onReorder,
  onUpdateAltText,
  className,
  layout = 'default',
}: MediaCarouselManagerProps) {
  const [editingAltIndex, setEditingAltIndex] = useState<number | null>(null)
  const isSheet = layout === 'sheet'
  const canReorder = media.length > 1

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (event.canceled) return

      const indices = media.map((_, index) => index)
      const reordered = move(indices, event) as number[]
      if (reordered.every((id, index) => id === indices[index])) return

      setEditingAltIndex(null)

      for (let newIndex = 0; newIndex < reordered.length; newIndex++) {
        const fromIndex = reordered[newIndex]
        if (fromIndex !== newIndex) {
          window.setTimeout(() => {
            onReorder(fromIndex, newIndex)
          }, 0)
          return
        }
      }
    },
    [media, onReorder],
  )

  if (media.length === 0) return null

  const content = isSheet ? (
    <div className={cn('space-y-2', className)}>
      <p className="text-[11px] font-medium text-muted-foreground">
        {media.length} attachment{media.length === 1 ? '' : 's'}
        {canReorder ? <span className="font-normal text-muted-foreground/80"> · Drag to reorder</span> : null}
      </p>

      <ul className="space-y-2">
        {media.map((item, index) => (
          <SheetMediaItem
            key={`${item.url}-${index}`}
            item={item}
            index={index}
            mediaCount={media.length}
            isEditingAlt={editingAltIndex === index}
            onRemove={onRemove}
            onReorder={onReorder}
            onToggleAlt={() => setEditingAltIndex(editingAltIndex === index ? null : index)}
            onUpdateAltText={onUpdateAltText}
          />
        ))}
      </ul>
    </div>
  ) : (
    <div className={cn('space-y-2.5', className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium text-muted-foreground">
          {media.length} attachment{media.length === 1 ? '' : 's'}
        </p>
        {canReorder ? <p className="shrink-0 text-[10px] text-muted-foreground">Drag to reorder</p> : null}
      </div>

      <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none">
        {media.map((item, index) => (
          <StripMediaItem
            key={`${item.url}-${index}`}
            item={item}
            index={index}
            mediaCount={media.length}
            isEditingAlt={editingAltIndex === index}
            onRemove={onRemove}
            onReorder={onReorder}
            onToggleAlt={() => setEditingAltIndex(editingAltIndex === index ? null : index)}
            onUpdateAltText={onUpdateAltText}
          />
        ))}
      </ul>
    </div>
  )

  return <DragDropProvider onDragEnd={handleDragEnd}>{content}</DragDropProvider>
}

type MediaItemProps = {
  item: ComposerMediaItem
  index: number
  mediaCount: number
  isEditingAlt: boolean
  onRemove: (index: number) => void
  onReorder: (fromIndex: number, toIndex: number) => void
  onToggleAlt: () => void
  onUpdateAltText: (index: number, altText: string) => void
}

function SheetMediaItem({
  item,
  index,
  mediaCount,
  isEditingAlt,
  onRemove,
  onReorder,
  onToggleAlt,
  onUpdateAltText,
}: MediaItemProps) {
  const { ref, handleRef, isDragging, isDropTarget } = useSortable({
    id: index,
    index,
  })

  return (
    <li
      ref={ref}
      className={cn(
        'overflow-hidden rounded-xl border border-border/50 bg-background transition-[opacity,box-shadow,border-color]',
        isDragging && 'z-10 opacity-60 shadow-md',
        isDropTarget && !isDragging && 'border-primary/40 ring-2 ring-primary/15',
      )}
    >
      <div className="flex gap-2 p-2.5">
        {mediaCount > 1 ? (
          <button
            ref={handleRef}
            type="button"
            className="flex shrink-0 cursor-grab touch-none items-center self-center px-0.5 text-muted-foreground/70 hover:text-muted-foreground active:cursor-grabbing"
            aria-label={`Drag to reorder ${item.kind} ${index + 1}`}
            onClick={event => event.preventDefault()}
          >
            <GripVerticalIcon className="size-3.5" strokeWidth={1.75} />
          </button>
        ) : null}

        <div className="size-16 shrink-0">
          <MediaThumbnail item={item} index={index} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-medium text-foreground">
              {item.kind === 'image' ? 'Image' : 'Video'} {index + 1}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 shrink-0 rounded-lg text-destructive hover:text-destructive"
              onPointerDown={event => event.stopPropagation()}
              onClick={event => {
                event.stopPropagation()
                onRemove(index)
              }}
              aria-label="Remove media"
            >
              <Trash2Icon className="size-3.5" strokeWidth={1.75} />
            </Button>
          </div>

          {item.kind === 'image' ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 w-fit rounded-lg px-2 text-[10px] font-medium"
              onClick={onToggleAlt}
            >
              {isEditingAlt ? 'Hide alt text' : 'Edit alt text'}
            </Button>
          ) : null}

          {mediaCount > 1 ? (
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 rounded-lg"
                disabled={index === 0}
                onClick={() => onReorder(index, index - 1)}
                aria-label="Move up"
              >
                <ArrowUpIcon className="size-3.5" strokeWidth={1.75} />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 rounded-lg"
                disabled={index === mediaCount - 1}
                onClick={() => onReorder(index, index + 1)}
                aria-label="Move down"
              >
                <ArrowDownIcon className="size-3.5" strokeWidth={1.75} />
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {isEditingAlt && item.kind === 'image' ? (
        <div className="border-t border-border/40 px-2.5 py-2">
          <Input
            value={item.altText ?? ''}
            placeholder="Describe this image for accessibility…"
            className="h-8 w-full min-w-0 text-xs"
            onChange={event => onUpdateAltText(index, event.target.value)}
          />
        </div>
      ) : null}
    </li>
  )
}

function StripMediaItem({
  item,
  index,
  mediaCount,
  isEditingAlt,
  onRemove,
  onReorder,
  onToggleAlt,
  onUpdateAltText,
}: MediaItemProps) {
  const { ref, handleRef, isDragging, isDropTarget } = useSortable({
    id: index,
    index,
  })

  return (
    <li
      ref={ref}
      className={cn(
        'w-[7.5rem] shrink-0 overflow-hidden rounded-lg border border-border/50 bg-background transition-[opacity,box-shadow,border-color]',
        isDragging && 'z-10 opacity-60 shadow-md',
        isDropTarget && !isDragging && 'border-primary/40 ring-2 ring-primary/15',
      )}
    >
      <div className="group relative aspect-square bg-background">
        <div
          ref={mediaCount > 1 ? handleRef : undefined}
          className={cn(
            'size-full',
            mediaCount > 1 && 'cursor-grab touch-none active:cursor-grabbing',
          )}
        >
          <MediaThumbnail item={item} index={index} />
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-1 right-1 z-10 size-6 rounded-full bg-background/90 text-destructive opacity-0 shadow-xs ring-1 ring-border/40 backdrop-blur-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 hover:bg-background hover:text-destructive"
          onPointerDown={event => event.stopPropagation()}
          onClick={event => {
            event.stopPropagation()
            onRemove(index)
          }}
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
          disabled={index === mediaCount - 1}
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
            onClick={onToggleAlt}
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
            className="h-7 w-full min-w-0 text-[10px]"
            onChange={event => onUpdateAltText(index, event.target.value)}
          />
        </div>
      ) : null}
    </li>
  )
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${String(secs).padStart(2, '0')}`
}
