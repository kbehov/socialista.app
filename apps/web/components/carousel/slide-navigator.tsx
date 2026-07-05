'use client'

import { useCallback, useEffect, useRef } from 'react'
import { DragDropProvider, type DragEndEvent } from '@dnd-kit/react'
import { useSortable } from '@dnd-kit/react/sortable'
import { move } from '@dnd-kit/helpers'
import type { Slide, SlideId } from '@socialista/types'
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { useEditorStore } from '@/lib/carousel/store'
import { Button } from '@/components/ui/button'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { cn } from '@/lib/utils'
import { SlideCanvas } from './slide-canvas'

type SlideNavigatorProps = {
  variant?: 'default' | 'filmstrip'
}

export function SlideNavigator({ variant = 'default' }: SlideNavigatorProps) {
  const slides = useEditorStore(s => s.slides)
  const activeSlideId = useEditorStore(s => s.activeSlideId)
  const addSlide = useEditorStore(s => s.addSlide)
  const setSlideOrder = useEditorStore(s => s.setSlideOrder)
  const stripRef = useRef<HTMLDivElement>(null)

  const isFilmstrip = variant === 'filmstrip'

  useEffect(() => {
    if (!isFilmstrip || !stripRef.current) return
    const scroller = stripRef.current
    const activeThumb = scroller.querySelector<HTMLElement>('[data-active-slide="true"]')
    if (!activeThumb) return

    const targetScroll = activeThumb.offsetLeft - (scroller.clientWidth - activeThumb.offsetWidth) / 2
    scroller.scrollTo({ left: Math.max(0, targetScroll), behavior: 'auto' })
  }, [activeSlideId, isFilmstrip, slides.length])

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
    <div className={cn('flex flex-col gap-2', isFilmstrip && 'gap-1')}>
      {!isFilmstrip ? (
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            {slides.length} slide{slides.length === 1 ? '' : 's'}
          </span>
          <Button size="xs" variant="outline" onClick={() => addSlide()}>
            <PlusIcon /> Add slide
          </Button>
        </div>
      ) : null}

      <DragDropProvider onDragEnd={handleDragEnd}>
        <div className="flex items-center gap-2">
          <div
            ref={stripRef}
            className={cn(
              'flex min-w-0 flex-1 gap-3 overflow-x-auto py-0.5',
              isFilmstrip && 'no-scrollbar',
            )}
          >
            {slides.map((slide, index) => (
              <SortableSlideThumb
                key={slide.id}
                slide={slide}
                index={index}
                variant={variant}
                slideCount={slides.length}
              />
            ))}
          </div>

          {isFilmstrip ? (
            <Button
              size="icon-sm"
              variant="outline"
              className="shrink-0"
              onClick={() => addSlide()}
              aria-label="Add slide"
            >
              <PlusIcon />
            </Button>
          ) : null}
        </div>
      </DragDropProvider>
    </div>
  )
}

function SortableSlideThumb({
  slide,
  index,
  variant,
  slideCount,
}: {
  slide: Slide
  index: number
  variant: 'default' | 'filmstrip'
  slideCount: number
}) {
  const slides = useEditorStore(s => s.slides)
  const activeSlideId = useEditorStore(s => s.activeSlideId)
  const setActiveSlide = useEditorStore(s => s.setActiveSlide)
  const removeSlide = useEditorStore(s => s.removeSlide)
  const duplicateSlide = useEditorStore(s => s.duplicateSlide)
  const reorderSlides = useEditorStore(s => s.reorderSlides)

  const isFilmstrip = variant === 'filmstrip'
  const canvas = useEditorStore(s => s.canvas)
  const thumbWidth = isFilmstrip ? 56 : 128
  const thumbHeight = thumbWidth * (canvas.height / canvas.width)
  const active = slide.id === activeSlideId

  const { ref, isDragging, isDropTarget } = useSortable({
    id: slide.id,
    index,
  })

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={ref}
          data-slide-thumb
          data-active-slide={active ? 'true' : undefined}
          role="button"
          tabIndex={0}
          onClick={() => setActiveSlide(slide.id)}
          onKeyDown={event => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              setActiveSlide(slide.id)
            }
          }}
          style={{ width: thumbWidth, height: thumbHeight }}
          className={cn(
            'group relative shrink-0 cursor-grab overflow-hidden rounded-md border-2 outline-none transition-[opacity,box-shadow,transform,border-color] active:cursor-grabbing',
            active
              ? 'border-primary opacity-100 shadow-md ring-2 ring-primary/20'
              : 'border-transparent opacity-75 hover:border-muted-foreground/25 hover:opacity-100',
            isDragging && 'z-20 scale-[1.03] border-primary/50 opacity-80 shadow-lg',
            isDropTarget && !isDragging && 'border-primary/40 opacity-100 shadow-lg',
          )}
          aria-label={`Slide ${index + 1}`}
          aria-current={active ? 'true' : undefined}
        >
          <SlideCanvas slide={slide} interactive={false} forceWidth={thumbWidth} className="size-full" />
          <div className="pointer-events-none absolute left-1 top-1 flex size-4 items-center justify-center rounded bg-background/95 text-[10px] font-semibold tabular-nums text-foreground shadow-sm">
            {index + 1}
          </div>
          {!isFilmstrip ? (
            <div className="absolute right-1 top-1 flex gap-0.5 opacity-0 transition group-hover:opacity-100">
              <FilmstripAction
                onClick={() => reorderSlides(slide.id, slides[index - 1].id)}
                disabled={index === 0}
                label="Move left"
              >
                <ChevronLeftIcon className="size-3" />
              </FilmstripAction>
              <FilmstripAction
                onClick={() => reorderSlides(slide.id, slides[index + 1].id)}
                disabled={index === slideCount - 1}
                label="Move right"
              >
                <ChevronRightIcon className="size-3" />
              </FilmstripAction>
              <FilmstripAction
                onClick={() => removeSlide(slide.id)}
                disabled={slideCount <= 1}
                label="Delete slide"
                destructive
              >
                <Trash2Icon className="size-3" />
              </FilmstripAction>
            </div>
          ) : null}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={() => setActiveSlide(slide.id)}>Open</ContextMenuItem>
        <ContextMenuItem onSelect={() => duplicateSlide(slide.id)}>Duplicate slide</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          disabled={index === 0}
          onSelect={() => reorderSlides(slide.id, slides[index - 1].id)}
        >
          Move left
        </ContextMenuItem>
        <ContextMenuItem
          disabled={index === slideCount - 1}
          onSelect={() => reorderSlides(slide.id, slides[index + 1].id)}
        >
          Move right
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          variant="destructive"
          disabled={slideCount <= 1}
          onSelect={() => removeSlide(slide.id)}
        >
          Delete slide
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

function FilmstripAction({
  children,
  onClick,
  disabled,
  label,
  destructive,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  label: string
  destructive?: boolean
}) {
  return (
    <button
      type="button"
      className={cn(
        'pointer-events-auto rounded bg-background/80 p-0.5 hover:bg-background disabled:opacity-30',
        destructive ? 'text-destructive hover:bg-destructive/10' : 'text-muted-foreground hover:text-foreground',
      )}
      onClick={event => {
        event.stopPropagation()
        onClick()
      }}
      disabled={disabled}
      aria-label={label}
    >
      {children}
    </button>
  )
}
