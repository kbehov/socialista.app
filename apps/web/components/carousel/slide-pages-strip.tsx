'use client'

import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { Button } from '@/components/ui/button'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useEditorStore } from '@/lib/carousel/store'
import { cn } from '@/lib/utils'
import type { Slide, SlideId } from '@socialista/types'
import { move } from '@dnd-kit/helpers'
import { DragDropProvider, type DragEndEvent } from '@dnd-kit/react'
import { useSortable } from '@dnd-kit/react/sortable'
import { CopyIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { SlideCanvas } from './slide-canvas'

const THUMB_WIDTH = 48

export function SlidePagesStrip({ className }: { className?: string }) {
  const slides = useEditorStore(s => s.slides)
  const activeSlideId = useEditorStore(s => s.activeSlideId)
  const addSlide = useEditorStore(s => s.addSlide)
  const setSlideOrder = useEditorStore(s => s.setSlideOrder)
  const stripRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!stripRef.current) return
    const scroller = stripRef.current
    const activeThumb = scroller.querySelector<HTMLElement>('[data-active-slide="true"]')
    if (!activeThumb) return

    const targetScroll = activeThumb.offsetLeft - (scroller.clientWidth - activeThumb.offsetWidth) / 2
    scroller.scrollTo({ left: Math.max(0, targetScroll), behavior: 'auto' })
  }, [activeSlideId, slides.length])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (event.canceled) return
      const ids = useEditorStore.getState().slides.map(slide => slide.id)
      const reordered = move(ids, event) as SlideId[]
      if (reordered.every((id, i) => id === ids[i])) return
      setSlideOrder(reordered)
    },
    [setSlideOrder],
  )

  return (
    <div
      data-pages-strip
      className={cn(
        'slideshow-editor-filmstrip-section flex min-w-0 shrink-0 items-center gap-2 border-t px-2 py-2 sm:px-3',
        className,
      )}
    >
      <DragDropProvider onDragEnd={handleDragEnd}>
        <div
          ref={stripRef}
          role="listbox"
          aria-label="Pages"
          aria-orientation="horizontal"
          className="studio-filmstrip-mask no-scrollbar flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-0.5"
        >
          {slides.map((slide, index) => (
            <PageThumb key={slide.id} slide={slide} index={index} slideCount={slides.length} />
          ))}
        </div>
      </DragDropProvider>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            className="size-9 shrink-0 touch-manipulation sm:size-8"
            onClick={() => addSlide()}
            aria-label="Add slide"
          >
            <PlusIcon className="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Add slide</TooltipContent>
      </Tooltip>
    </div>
  )
}

function PageThumb({
  slide,
  index,
  slideCount,
}: {
  slide: Slide
  index: number
  slideCount: number
}) {
  const slides = useEditorStore(s => s.slides)
  const activeSlideId = useEditorStore(s => s.activeSlideId)
  const setActiveSlide = useEditorStore(s => s.setActiveSlide)
  const removeSlide = useEditorStore(s => s.removeSlide)
  const duplicateSlide = useEditorStore(s => s.duplicateSlide)
  const reorderSlides = useEditorStore(s => s.reorderSlides)
  const canvas = useEditorStore(s => s.canvas)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const thumbHeight = THUMB_WIDTH * (canvas.height / canvas.width)
  const active = slide.id === activeSlideId

  const { ref, isDragging, isDropTarget } = useSortable({
    id: slide.id,
    index,
  })

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <button
            ref={ref}
            type="button"
            role="option"
            data-slide-thumb
            data-active-slide={active ? 'true' : undefined}
            aria-selected={active}
            aria-label={`Page ${index + 1}`}
            aria-current={active ? 'true' : undefined}
            tabIndex={active ? 0 : -1}
            onClick={() => setActiveSlide(slide.id)}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                setActiveSlide(slide.id)
              }
            }}
            style={{ width: THUMB_WIDTH, height: thumbHeight }}
            className={cn(
              'group relative shrink-0 cursor-grab overflow-hidden rounded-md border-2 bg-background outline-none transition-[opacity,box-shadow,transform,border-color] focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing',
              active
                ? 'border-primary opacity-100 shadow-sm ring-2 ring-primary/20'
                : 'border-transparent opacity-70 hover:border-muted-foreground/25 hover:opacity-100',
              isDragging && 'z-20 scale-[1.03] border-primary/50 opacity-80 shadow-lg',
              isDropTarget && !isDragging && 'border-primary/40 opacity-100',
            )}
          >
            <SlideCanvas slide={slide} interactive={false} forceWidth={THUMB_WIDTH} className="size-full" />
            <span className="pointer-events-none absolute left-0.5 top-0.5 flex size-4 items-center justify-center rounded bg-background/95 text-[10px] font-semibold tabular-nums text-foreground shadow-sm">
              {index + 1}
            </span>
          </button>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={() => setActiveSlide(slide.id)}>Open</ContextMenuItem>
          <ContextMenuItem onSelect={() => duplicateSlide(slide.id)}>
            <CopyIcon className="size-3.5" />
            Duplicate
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            disabled={index === 0}
            onSelect={() => reorderSlides(slide.id, slides[index - 1]!.id)}
          >
            Move left
          </ContextMenuItem>
          <ContextMenuItem
            disabled={index === slideCount - 1}
            onSelect={() => reorderSlides(slide.id, slides[index + 1]!.id)}
          >
            Move right
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            variant="destructive"
            disabled={slideCount <= 1}
            onSelect={() => setDeleteOpen(true)}
          >
            <Trash2Icon className="size-3.5" />
            Delete page
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this page?"
        description="This removes the page and its layers. You can undo with ⌘Z."
        confirmLabel="Delete page"
        onConfirm={() => {
          removeSlide(slide.id)
          setDeleteOpen(false)
        }}
      />
    </>
  )
}
