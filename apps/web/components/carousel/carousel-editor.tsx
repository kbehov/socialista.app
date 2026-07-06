'use client'

import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useEditorShortcuts } from '@/hooks/carousel/use-editor-shortcuts'
import { exportSlidesAsZip } from '@/lib/carousel/export'
import { useEditorStore } from '@/lib/carousel/store'
import { DownloadIcon, ImageIcon, Loader2Icon, Redo2Icon, Undo2Icon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { CanvasWorkspaceProvider } from '@/components/carousel/canvas-workspace-context'
import { CarouselPreviewLayoutProvider } from '@/components/carousel/carousel-preview-layout'
import { CanvasZoomControls } from '@/components/carousel/canvas-zoom-controls'
import { FormatSelector } from '@/components/carousel/format-selector'
import { SlideshowSaveBar } from '@/components/carousel/slideshow-save-bar'
import { SlideFilmstripTransport } from '@/components/carousel/slide-filmstrip-transport'
import { SlideImageEditProvider, useSlideImageEdit } from './slide-image-edit-provider'
import { SlideNavigator } from './slide-navigator'
import { SlidePreviewCarousel } from './slide-preview-carousel'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export function CarouselEditor({ panels }: { panels?: ReactNode }) {
  return (
    <SlideImageEditProvider>
      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:flex-row">
        {panels}
        <CarouselEditorMain />
      </div>
    </SlideImageEditProvider>
  )
}

function CarouselEditorMain() {
  const slides = useEditorStore(s => s.slides)
  const activeSlideId = useEditorStore(s => s.activeSlideId)
  const undo = useEditorStore(s => s.undo)
  const redo = useEditorStore(s => s.redo)
  const addTextLayer = useEditorStore(s => s.addTextLayer)
  const past = useEditorStore(s => s.past)
  const future = useEditorStore(s => s.future)

  const [exporting, setExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 0 })

  const workspaceRef = useRef<HTMLDivElement>(null)

  const activeSlide = slides.find(s => s.id === activeSlideId) ?? slides[0]
  const hasLayers = (activeSlide?.layers.length ?? 0) > 0
  const hasBackground = Boolean(activeSlide?.backgroundImageUrl)

  const canUndo = past.length > 0
  const canRedo = future.length > 0

  useEffect(() => {
    if (slides.length > 0 && !activeSlideId) {
      useEditorStore.getState().setActiveSlide(slides[0].id)
    }
  }, [slides, activeSlideId])

  const handleExport = useCallback(async () => {
    if (exporting || slides.length === 0) return
    setExporting(true)
    setExportProgress({ current: 0, total: slides.length })

    try {
      const canvasWidth = useEditorStore.getState().canvas.width
      await exportSlidesAsZip(slides, canvasWidth, {
        onProgress: (current, total) => setExportProgress({ current, total }),
      })
    } catch {
      toast.error('Export failed. Try removing external background images or re-uploading photos.')
    } finally {
      setExporting(false)
    }
  }, [exporting, slides])

  const hintMessage = hasBackground
    ? 'Drag image to pan · Corner handles to zoom'
    : 'Click text to edit · Style in the Edit panel'

  return (
    <main className="slideshow-editor-main flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <CarouselEditorContent
        workspaceRef={workspaceRef}
        activeSlide={activeSlide}
        hintMessage={hintMessage}
        hasBackground={hasBackground}
        hasLayers={hasLayers}
        exporting={exporting}
        exportProgress={exportProgress}
        handleExport={handleExport}
        canUndo={canUndo}
        canRedo={canRedo}
        undo={undo}
        redo={redo}
        addTextLayer={addTextLayer}
        slidesLength={slides.length}
      />
    </main>
  )
}

type CarouselEditorContentProps = {
  workspaceRef: React.RefObject<HTMLDivElement | null>
  activeSlide: ReturnType<typeof useEditorStore.getState>['slides'][number] | undefined
  hintMessage: string
  hasBackground: boolean
  hasLayers: boolean
  exporting: boolean
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
  addTextLayer: (slideId: string) => void
  slidesLength: number
  exportProgress: { current: number; total: number }
  handleExport: () => void
}

function CarouselEditorContent({
  workspaceRef,
  activeSlide,
  hintMessage,
  hasBackground,
  hasLayers,
  exporting,
  canUndo,
  canRedo,
  undo,
  redo,
  addTextLayer,
  slidesLength,
  exportProgress,
  handleExport,
}: CarouselEditorContentProps) {
  useEditorShortcuts()
  const activeLayerId = useEditorStore(s => s.activeLayerId)
  const clearLayerSelection = useEditorStore(s => s.clearLayerSelection)
  const { deselectBackgroundEdit, isBackgroundEditSelected } = useSlideImageEdit()

  const showCanvasHint = Boolean(
    activeSlide &&
      !activeLayerId &&
      !exporting &&
      (hasBackground ? isBackgroundEditSelected(activeSlide.id) : hasLayers),
  )

  const handleWorkspacePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('[data-slide-canvas]')) return
    if (target.closest('[data-bg-edit-toolbar]')) return
    if (target.closest('[data-canvas-controls]')) return
    if (target.closest('[data-carousel-nav]')) return
    if (target.closest('[data-slide-thumb]')) return
    if (target.closest('[data-canvas-hint]')) return
    deselectBackgroundEdit()
    clearLayerSelection()
  }

  const handleAddText = () => {
    if (!activeSlide) return
    addTextLayer(activeSlide.id)
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
      <div className="slideshow-editor-canvas-bar video-editor-canvas-bar flex min-w-0 shrink-0 items-center gap-1.5 overflow-x-auto border-b px-2 py-1.5 sm:gap-2 sm:px-3">
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon-sm" variant="ghost" className="size-8" onClick={undo} disabled={!canUndo}>
                <Undo2Icon className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Undo <Kbd className="ml-1">⌘Z</Kbd>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon-sm" variant="ghost" className="size-8" onClick={redo} disabled={!canRedo}>
                <Redo2Icon className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Redo <Kbd className="ml-1">⌘⇧Z</Kbd>
            </TooltipContent>
          </Tooltip>
        </div>

        <CanvasZoomControls className="hidden sm:flex" />

        <div className="min-w-0 flex-1" />

        <FormatSelector showLabel={false} className="hidden w-[min(100%,160px)] shrink-0 md:flex lg:w-[180px]" />
        <SlideshowSaveBar showLabel={false} className="hidden min-w-0 max-w-[160px] shrink-0 md:flex lg:max-w-[200px]" />

        <Button
          size="sm"
          className={cn('h-8 gap-1.5 px-3', slidesLength > 0 && 'bg-primary hover:bg-primary/90')}
          onClick={handleExport}
          disabled={exporting || slidesLength === 0}
        >
          {exporting ? <Loader2Icon className="size-3.5 animate-spin" /> : <DownloadIcon className="size-3.5" />}
          <span className="hidden sm:inline">
            {exporting ? `${exportProgress.current}/${exportProgress.total}` : 'Export'}
          </span>
        </Button>
      </div>

      <CanvasWorkspaceProvider workspaceRef={workspaceRef}>
        <div
          ref={workspaceRef}
          className="slideshow-editor-canvas-area video-editor-canvas-area relative min-h-0 min-w-0 flex-1 overflow-hidden"
          onPointerDown={handleWorkspacePointerDown}
        >
          <CarouselPreviewLayoutProvider>
            {activeSlide ? (
              <SlidePreviewCarousel className="h-full" canvasHint={showCanvasHint ? hintMessage : null} />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                <ImageIcon className="size-8 text-muted-foreground/50" />
                <p className="text-sm font-medium text-muted-foreground">No slides yet</p>
                <p className="max-w-xs text-xs text-muted-foreground/80">
                  Use Generate in the sidebar to create TikTok or Instagram carousels with AI, or import from TikTok.
                </p>
              </div>
            )}
          </CarouselPreviewLayoutProvider>

          <div className="pointer-events-none absolute bottom-3 left-3 z-10 sm:hidden">
            <CanvasZoomControls />
          </div>
        </div>
      </CanvasWorkspaceProvider>

      <div className="slideshow-editor-filmstrip-section video-editor-timeline-section flex min-w-0 shrink-0 flex-col overflow-hidden border-t">
        <SlideFilmstripTransport onAddText={handleAddText} />
        <div className="min-h-[104px] min-w-0 overflow-hidden px-2 py-2 sm:px-3">
          <div className="studio-filmstrip-mask">
            <SlideNavigator variant="filmstrip" />
          </div>
        </div>
      </div>
    </div>
  )
}
