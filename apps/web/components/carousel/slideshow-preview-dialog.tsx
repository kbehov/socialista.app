'use client'

import { SlideCanvas } from '@/components/carousel/slide-canvas'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useEditorStore } from '@/lib/carousel/store'
import { cn } from '@/lib/utils'
import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon, XIcon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

type SlideshowPreviewDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExport?: () => void
}

export function SlideshowPreviewDialog({ open, onOpenChange, onExport }: SlideshowPreviewDialogProps) {
  const slides = useEditorStore(s => s.slides)
  const activeSlideId = useEditorStore(s => s.activeSlideId)
  const initialIndex = Math.max(
    0,
    slides.findIndex(slide => slide.id === activeSlideId),
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[min(92vh,900px)] w-[min(96vw,720px)] max-w-none flex-col gap-0 overflow-hidden border-white/10 bg-neutral-950 p-0 text-white sm:rounded-2xl"
      >
        {open ? (
          <PreviewBody
            key={`${activeSlideId ?? 'none'}-${initialIndex}`}
            initialIndex={initialIndex}
            onOpenChange={onOpenChange}
            onExport={onExport}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function PreviewBody({
  initialIndex,
  onOpenChange,
  onExport,
}: {
  initialIndex: number
  onOpenChange: (open: boolean) => void
  onExport?: () => void
}) {
  const slides = useEditorStore(s => s.slides)
  const canvas = useEditorStore(s => s.canvas)
  const [index, setIndex] = useState(initialIndex)
  const touchStartX = useRef<number | null>(null)

  const goPrev = useCallback(() => {
    setIndex(current => Math.max(0, current - 1))
  }, [])

  const goNext = useCallback(() => {
    setIndex(current => Math.min(slides.length - 1, current + 1))
  }, [slides.length])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault()
        goPrev()
      }
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown' || event.key === ' ') {
        event.preventDefault()
        goNext()
      }
      if (event.key === 'Escape') {
        onOpenChange(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [goNext, goPrev, onOpenChange])

  const slide = slides[index]
  const aspect = canvas.width / Math.max(1, canvas.height)

  return (
    <>
      <DialogHeader className="flex flex-row items-center justify-between space-y-0 border-b border-white/10 px-4 py-3">
        <div className="min-w-0">
          <DialogTitle className="text-[13px] font-medium tracking-tight text-white">Preview</DialogTitle>
          <DialogDescription className="text-[11px] text-white/60">
            Page {slides.length === 0 ? 0 : index + 1} of {slides.length}
          </DialogDescription>
        </div>
        <div className="flex items-center gap-1.5">
          {onExport ? (
            <Button
              size="sm"
              variant="secondary"
              className="h-8 gap-1.5"
              onClick={() => {
                onExport()
                onOpenChange(false)
              }}
            >
              <DownloadIcon className="size-3.5" />
              Export
            </Button>
          ) : null}
          <Button
            size="icon-sm"
            variant="ghost"
            className="size-8 text-white hover:bg-white/10 hover:text-white"
            onClick={() => onOpenChange(false)}
            aria-label="Close preview"
          >
            <XIcon className="size-4" />
          </Button>
        </div>
      </DialogHeader>

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center bg-neutral-950 px-10 py-6"
        onTouchStart={event => {
          touchStartX.current = event.changedTouches[0]?.clientX ?? null
        }}
        onTouchEnd={event => {
          const startX = touchStartX.current
          const endX = event.changedTouches[0]?.clientX
          touchStartX.current = null
          if (startX == null || endX == null) return
          const delta = endX - startX
          if (Math.abs(delta) < 48) return
          if (delta > 0) goPrev()
          else goNext()
        }}
      >
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          className="absolute left-2 top-1/2 z-10 size-9 -translate-y-1/2 text-white hover:bg-white/10 hover:text-white"
          onClick={goPrev}
          disabled={index <= 0}
          aria-label="Previous page"
        >
          <ChevronLeftIcon className="size-5" />
        </Button>

        <div
          className="relative w-full max-w-110 overflow-hidden rounded-lg ring-1 ring-white/10"
          style={{ aspectRatio: aspect }}
        >
          {slide ? (
            <SlideCanvas slide={slide} interactive={false} className="size-full" />
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-white/50">No slides</div>
          )}
        </div>

        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          className="absolute right-2 top-1/2 z-10 size-9 -translate-y-1/2 text-white hover:bg-white/10 hover:text-white"
          onClick={goNext}
          disabled={index >= slides.length - 1}
          aria-label="Next page"
        >
          <ChevronRightIcon className="size-5" />
        </Button>
      </div>

      <div className="flex items-center justify-center gap-1.5 border-t border-white/10 px-4 py-3">
        {slides.map((item, pageIndex) => (
          <button
            key={item.id}
            type="button"
            aria-label={`Go to page ${pageIndex + 1}`}
            aria-current={pageIndex === index ? 'true' : undefined}
            onClick={() => setIndex(pageIndex)}
            className={cn(
              'size-2 rounded-full transition-colors',
              pageIndex === index ? 'bg-white' : 'bg-white/30 hover:bg-white/50',
            )}
          />
        ))}
      </div>
    </>
  )
}
