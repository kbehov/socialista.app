'use client'

import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { useCarouselPreviewLayout } from '@/components/carousel/carousel-preview-layout'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useForwardWheelScroll } from '@/hooks/carousel/use-forward-wheel-scroll'
import { VERTICAL_STACK_SECTION_PADDING, SLIDESHOW_STACK_SCROLLBAR_CLASS } from '@/lib/carousel/canvas-viewport'
import { useEditorStore } from '@/lib/carousel/store'
import { cn } from '@/lib/utils'
import type { Slide, SlideId } from '@socialista/types'
import { CopyIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { SlideCanvasShell } from './slide-canvas-shell'

type SlidePreviewStackProps = {
  canvasHint?: string | null
}

function AddPageButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      data-add-page
      onClick={onClick}
      className="slideshow-editor-stack-add-page flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border/70 bg-background/60 px-4 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-background hover:text-foreground"
    >
      <PlusIcon className="size-3.5" />
      Add slide
    </button>
  )
}

function SlideStackActions({
  slideId,
  slideCount,
  onDuplicate,
  onRequestDelete,
}: {
  slideId: SlideId
  slideCount: number
  onDuplicate: (id: SlideId) => void
  onRequestDelete: (id: SlideId) => void
}) {
  return (
    <div data-slide-actions className="pointer-events-auto flex w-full items-center justify-end gap-0.5 px-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="size-8"
            onClick={() => onDuplicate(slideId)}
            aria-label="Duplicate slide"
          >
            <CopyIcon className="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Duplicate slide</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="size-8 text-destructive hover:text-destructive"
            onClick={() => onRequestDelete(slideId)}
            disabled={slideCount <= 1}
            aria-label="Delete slide"
          >
            <Trash2Icon className="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Delete slide</TooltipContent>
      </Tooltip>
    </div>
  )
}

function SlideStackItem({
  slide,
  index,
  isActive,
  slideCount,
  canvasHint,
  slideWidth,
  onActivate,
  onDuplicate,
  onRequestDelete,
  onRegisterRef,
}: {
  slide: Slide
  index: number
  isActive: boolean
  slideCount: number
  canvasHint?: string | null
  slideWidth?: number
  onActivate: () => void
  onDuplicate: (id: SlideId) => void
  onRequestDelete: (id: SlideId) => void
  onRegisterRef: (id: SlideId, el: HTMLDivElement | null) => void
}) {
  return (
    <div
      ref={el => onRegisterRef(slide.id, el)}
      data-slide-stack
      data-slide-index={index}
      className="slideshow-editor-stack-slide flex w-full flex-col items-center"
      style={slideWidth ? { maxWidth: slideWidth } : undefined}
    >
      {isActive ? (
        <SlideStackActions
          slideId={slide.id}
          slideCount={slideCount}
          onDuplicate={onDuplicate}
          onRequestDelete={onRequestDelete}
        />
      ) : (
        <div className="h-8 w-full shrink-0" aria-hidden />
      )}

      <div
        role="button"
        tabIndex={isActive ? 0 : -1}
        aria-label={`Page ${index + 1}${isActive ? ', selected' : ''}`}
        aria-current={isActive ? 'true' : undefined}
        onClick={isActive ? undefined : onActivate}
        onKeyDown={event => {
          if (isActive) return
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onActivate()
          }
        }}
        className={cn(
          'w-full overflow-hidden rounded-lg bg-background outline-none transition-[opacity,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-ring',
          isActive
            ? 'cursor-default shadow-md ring-2 ring-primary/25'
            : 'cursor-pointer opacity-60 hover:opacity-90',
        )}
      >
        <SlideCanvasShell
          slide={slide}
          interactive={isActive}
          canvasHint={isActive ? canvasHint : undefined}
        />
      </div>
    </div>
  )
}

export function SlidePreviewStack({ canvasHint }: SlidePreviewStackProps) {
  const slides = useEditorStore(s => s.slides)
  const activeSlideId = useEditorStore(s => s.activeSlideId)
  const setActiveSlide = useEditorStore(s => s.setActiveSlide)
  const addSlide = useEditorStore(s => s.addSlide)
  const duplicateSlide = useEditorStore(s => s.duplicateSlide)
  const removeSlide = useEditorStore(s => s.removeSlide)

  const layout = useCarouselPreviewLayout()
  const canvas = useEditorStore(s => s.canvas)
  const slideGap = layout?.slideGap ?? 32
  const slideWidth = layout?.visualWidth

  const scrollRef = useRef<HTMLDivElement>(null)
  const slideRefs = useRef(new Map<SlideId, HTMLDivElement>())
  const skipScrollRef = useRef(false)
  const [deleteSlideId, setDeleteSlideId] = useState<SlideId | null>(null)

  useForwardWheelScroll(scrollRef)

  const registerSlideRef = useCallback((id: SlideId, el: HTMLDivElement | null) => {
    if (el) slideRefs.current.set(id, el)
    else slideRefs.current.delete(id)
  }, [])

  const handleActivate = useCallback(
    (slideId: SlideId) => {
      if (slideId === activeSlideId) return
      skipScrollRef.current = true
      setActiveSlide(slideId)
    },
    [activeSlideId, setActiveSlide],
  )

  useEffect(() => {
    if (skipScrollRef.current) {
      skipScrollRef.current = false
      return
    }

    const activeId = activeSlideId
    if (!activeId) return

    const el = slideRefs.current.get(activeId)
    if (!el) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ block: 'center', behavior: prefersReducedMotion ? 'auto' : 'smooth' })
  }, [activeSlideId])

  if (slides.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center" role="status">
        <p className="text-sm font-medium text-muted-foreground">No slides yet</p>
        <p className="max-w-xs text-xs text-muted-foreground/80">
          Use AI generate or TikTok import to create your first slides.
        </p>
      </div>
    )
  }

  const isLayoutReady = slideWidth != null && slideWidth > 0

  return (
    <>
      <div
        ref={scrollRef}
        className={cn(
          'slideshow-editor-stack h-full min-h-0 w-full overflow-x-hidden overflow-y-auto overscroll-contain',
          SLIDESHOW_STACK_SCROLLBAR_CLASS,
        )}
      >
        <div
          className="mx-auto flex w-full flex-col items-center"
          style={{
            gap: slideGap,
            maxWidth: slideWidth ? slideWidth + 64 : undefined,
            padding: `${VERTICAL_STACK_SECTION_PADDING}px 24px`,
          }}
        >
          {slides.map((slide, index) =>
            isLayoutReady ? (
              <SlideStackItem
                key={slide.id}
                slide={slide}
                index={index}
                isActive={slide.id === activeSlideId}
                slideCount={slides.length}
                canvasHint={canvasHint}
                slideWidth={slideWidth}
                onActivate={() => handleActivate(slide.id)}
                onDuplicate={duplicateSlide}
                onRequestDelete={setDeleteSlideId}
                onRegisterRef={registerSlideRef}
              />
            ) : (
              <div
                key={slide.id}
                className="w-full max-w-[440px] animate-pulse rounded-lg bg-muted"
                style={{ aspectRatio: `${canvas.width}/${canvas.height}`, maxWidth: slideWidth }}
              />
            ),
          )}
          <AddPageButton onClick={() => addSlide()} />
        </div>
      </div>

      <DeleteConfirmDialog
        open={deleteSlideId != null}
        onOpenChange={open => {
          if (!open) setDeleteSlideId(null)
        }}
        title="Delete this page?"
        description="This removes the page and its layers. You can undo with ⌘Z after deleting."
        confirmLabel="Delete page"
        onConfirm={() => {
          if (deleteSlideId) removeSlide(deleteSlideId)
          setDeleteSlideId(null)
        }}
      />
    </>
  )
}
