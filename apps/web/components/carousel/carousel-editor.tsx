'use client'

import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useEditorShortcuts } from '@/hooks/carousel/use-editor-shortcuts'
import { exportSlidesAsZip } from '@/lib/carousel/export'
import { useEditorStore } from '@/lib/carousel/store'
import { DownloadIcon, ImageIcon, Loader2Icon, PlusIcon, Redo2Icon, TypeIcon, Undo2Icon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { CanvasWorkspaceProvider } from '@/components/carousel/canvas-workspace-context'
import { CanvasZoomControls } from '@/components/carousel/canvas-zoom-controls'
import { EditorInspector, type InspectorTab } from './editor-inspector'
import { SlideImageEditProvider, useSlideImageEdit } from './slide-image-edit-provider'
import { SlideNavigator } from './slide-navigator'
import { SlidePreviewCarousel } from './slide-preview-carousel'
import { cn } from '@/lib/utils'

export function CarouselEditor() {
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
  const activeIndex = activeSlide ? slides.findIndex(s => s.id === activeSlide.id) + 1 : 1
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
    : 'Click text to edit · Style in the Text tab'

  return (
    <SlideImageEditProvider>
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
        activeIndex={activeIndex}
        slidesLength={slides.length}
      />
    </SlideImageEditProvider>
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
  activeIndex: number
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
  activeIndex,
  slidesLength,
  exportProgress,
  handleExport,
}: CarouselEditorContentProps) {
  useEditorShortcuts()
  const activeLayerId = useEditorStore(s => s.activeLayerId)
  const clearLayerSelection = useEditorStore(s => s.clearLayerSelection)
  const addSlide = useEditorStore(s => s.addSlide)
  const { deselectBackgroundEdit, isBackgroundEditSelected } = useSlideImageEdit()
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('slide')

  const capPreviewHeight = inspectorTab === 'text' || Boolean(activeLayerId)

  const showCanvasHint = Boolean(
    activeSlide &&
      !activeLayerId &&
      !exporting &&
      (hasBackground ? isBackgroundEditSelected(activeSlide.id) : hasLayers),
  )
  const isBackgroundToolbarOpen = Boolean(
    activeSlide && hasBackground && isBackgroundEditSelected(activeSlide.id),
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

  return (
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex shrink-0 items-center gap-1 border-b bg-muted/15 px-2.5 py-1 sm:gap-1.5 sm:px-3">
          <div className="flex items-center rounded-md border border-border/50 bg-background/60 p-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon-sm" variant="ghost" onClick={undo} disabled={!canUndo} aria-label="Undo">
                  <Undo2Icon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Undo <Kbd className="ml-1">⌘Z</Kbd>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon-sm" variant="ghost" onClick={redo} disabled={!canRedo} aria-label="Redo">
                  <Redo2Icon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Redo <Kbd className="ml-1">⌘⇧Z</Kbd>
              </TooltipContent>
            </Tooltip>
          </div>

          {activeSlide ? (
            <Button size="sm" variant="outline" className="h-8 bg-background/60" onClick={() => addTextLayer(activeSlide.id)}>
              <TypeIcon />
              <span className="hidden sm:inline">Add text</span>
            </Button>
          ) : null}

          <CanvasZoomControls className="hidden md:flex" />

          <div className="flex-1" />

          <div className="flex items-center gap-0.5 rounded-md border border-border/50 bg-background/60 py-0.5 pr-0.5 pl-2 text-xs text-muted-foreground">
            <span className="font-medium tabular-nums text-foreground">
              {activeIndex}
            </span>
            <span className="text-border">/</span>
            <span className="tabular-nums">{slidesLength}</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="size-6 shrink-0 rounded-sm"
                  onClick={() => addSlide()}
                  aria-label="Add slide"
                >
                  <PlusIcon className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add slide</TooltipContent>
            </Tooltip>
          </div>

          <Button size="sm" className="h-8" onClick={handleExport} disabled={exporting || slidesLength === 0}>
            {exporting ? <Loader2Icon className="animate-spin" /> : <DownloadIcon />}
            {exporting ? `${exportProgress.current}/${exportProgress.total}` : 'Export'}
          </Button>
        </div>

        {/* Canvas + inspector */}
        <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)_minmax(0,180px)] overflow-hidden lg:grid-cols-[minmax(0,1fr)_260px] lg:grid-rows-1">
          <div className="relative h-full min-h-0">
            <CanvasWorkspaceProvider workspaceRef={workspaceRef} capPreviewHeight={capPreviewHeight}>
              <div
                className={cn(
                  'studio-canvas-workspace relative flex h-full min-h-0 flex-col box-border',
                  capPreviewHeight && 'py-8',
                  isBackgroundToolbarOpen
                    ? 'overflow-visible'
                    : 'overflow-auto',
                )}
                onPointerDown={handleWorkspacePointerDown}
              >
                <div ref={workspaceRef} className="relative min-h-0 w-full flex-1">
                  {activeSlide ? (
                    <SlidePreviewCarousel className="h-full" canvasHint={showCanvasHint ? hintMessage : null} />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                      <ImageIcon className="size-8 text-muted-foreground/50" />
                      <p className="text-sm font-medium text-muted-foreground">No slide selected</p>
                      <p className="max-w-xs text-xs text-muted-foreground/80">
                        Generate or import slides from the panel on the left.
                      </p>
                    </div>
                  )}
                </div>

                <div className="pointer-events-none absolute bottom-3 left-3 z-10 md:hidden">
                  <CanvasZoomControls />
                </div>
              </div>
            </CanvasWorkspaceProvider>
          </div>

          <div className="flex h-full min-h-0 flex-col overflow-hidden border-t bg-card lg:border-t-0 lg:border-l">
            <EditorInspector tab={inspectorTab} onTabChange={setInspectorTab} />
          </div>
        </div>

        {/* Filmstrip */}
        <div className="shrink-0 border-t bg-muted/20 px-3 py-1">
          <div className="mb-1 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Slides</span>
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
                {slidesLength}
              </span>
            </div>
            <span className="hidden text-[10px] text-muted-foreground lg:inline">
              Drag to reorder
            </span>
          </div>
          <div className="studio-filmstrip-mask">
            <SlideNavigator variant="filmstrip" />
          </div>
        </div>
      </div>
  )
}
