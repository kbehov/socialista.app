'use client'

import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useEditorShortcuts } from '@/hooks/carousel/use-editor-shortcuts'
import { exportSlidesAsZip } from '@/lib/carousel/export'
import { useEditorStore } from '@/lib/carousel/store'
import { DownloadIcon, ImageIcon, Loader2Icon, MousePointer2Icon, Redo2Icon, TypeIcon, Undo2Icon } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useForwardWheelScroll } from '@/hooks/carousel/use-forward-wheel-scroll'
import { EditorInspector } from './editor-inspector'
import { AspectRatioBadge } from './format-selector'
import { SlideImageEditProvider } from './slide-image-edit-provider'
import { SlideNavigator } from './slide-navigator'
import { SlidePreviewCarousel } from './slide-preview-carousel'

export function CarouselEditor() {
  useEditorShortcuts()

  const slides = useEditorStore(s => s.slides)
  const activeSlideId = useEditorStore(s => s.activeSlideId)
  const activeLayerId = useEditorStore(s => s.activeLayerId)
  const undo = useEditorStore(s => s.undo)
  const redo = useEditorStore(s => s.redo)
  const addTextLayer = useEditorStore(s => s.addTextLayer)
  const past = useEditorStore(s => s.past)
  const future = useEditorStore(s => s.future)

  const [exporting, setExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 0 })

  const canvasWorkspaceRef = useRef<HTMLDivElement>(null)
  useForwardWheelScroll(canvasWorkspaceRef)

  const activeSlide = slides.find(s => s.id === activeSlideId) ?? slides[0]
  const activeIndex = activeSlide ? slides.findIndex(s => s.id === activeSlide.id) + 1 : 1
  const hasLayers = (activeSlide?.layers.length ?? 0) > 0
  const hasBackground = Boolean(activeSlide?.backgroundImageUrl)

  const canUndo = past.length > 0
  const canRedo = future.length > 0

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

  const showCanvasHint = activeSlide && !activeLayerId && !exporting && hasLayers

  const hintMessage = hasBackground
    ? 'Click the image for crop & zoom · Click text to edit'
    : 'Click text to edit · Style in the Text tab'

  return (
    <SlideImageEditProvider>
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex shrink-0 items-center gap-2 border-b px-3 py-2">
          <div className="flex items-center gap-0.5">
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

          <div className="hidden h-5 w-px bg-border sm:block" />

          {activeSlide ? (
            <Button size="sm" variant="outline" onClick={() => addTextLayer(activeSlide.id)}>
              <TypeIcon />
              <span className="hidden sm:inline">Add text</span>
            </Button>
          ) : null}

          <div className="flex-1" />

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="tabular-nums">
              {activeIndex}/{slides.length}
            </span>
            <span className="hidden text-border sm:inline">·</span>
            <AspectRatioBadge className="hidden sm:inline-flex" />
          </div>

          <Button size="sm" onClick={handleExport} disabled={exporting || slides.length === 0}>
            {exporting ? <Loader2Icon className="animate-spin" /> : <DownloadIcon />}
            {exporting ? `${exportProgress.current}/${exportProgress.total}` : 'Export'}
          </Button>
        </div>

        {/* Canvas + inspector */}
        <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)_minmax(0,min(200px,24vh))] overflow-hidden xl:grid-cols-[minmax(0,1fr)_272px] xl:grid-rows-1">
          <div className="relative flex min-h-0 flex-col overflow-hidden">
            <div ref={canvasWorkspaceRef} className="studio-canvas-workspace sidebar-scrollbar relative min-h-0 flex-1 overflow-y-auto p-1 sm:p-2">
              {activeSlide ? (
                <div className="flex min-h-full w-full justify-center py-1 sm:py-2">
                  <SlidePreviewCarousel className="w-full" />
                </div>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                  <ImageIcon className="size-8 text-muted-foreground/50" />
                  <p className="text-sm font-medium text-muted-foreground">No slide selected</p>
                  <p className="max-w-xs text-xs text-muted-foreground/80">
                    Generate or import slides from the panel on the left.
                  </p>
                </div>
              )}

              {showCanvasHint ? (
                <div className="pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-center px-4 sm:top-4">
                  <div className="flex max-w-md items-center gap-2 rounded-full border bg-background/95 px-3 py-1.5 text-[11px] text-muted-foreground shadow-sm backdrop-blur-sm">
                    <MousePointer2Icon className="size-3.5 shrink-0 text-primary/70" />
                    <span>{hintMessage}</span>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex h-full min-h-0 max-h-[min(280px,28vh)] flex-col overflow-hidden border-t bg-card xl:max-h-none xl:border-t-0 xl:border-l">
            <EditorInspector />
          </div>
        </div>

        {/* Filmstrip */}
        <div className="shrink-0 border-t bg-muted/25 px-3 py-2">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Slides</span>
            <span className="hidden text-[11px] text-muted-foreground sm:inline">
              Drag to reorder · Right-click for options
            </span>
          </div>
          <SlideNavigator variant="filmstrip" />
        </div>
      </div>
    </SlideImageEditProvider>
  )
}
