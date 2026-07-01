'use client'

import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useEditorShortcuts } from '@/hooks/carousel/use-editor-shortcuts'
import { exportSlidesAsZip } from '@/lib/carousel/export'
import { useEditorStore } from '@/lib/carousel/store'
import { DownloadIcon, Loader2Icon, MousePointer2Icon, Redo2Icon, TypeIcon, Undo2Icon } from 'lucide-react'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
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

  const activeSlide = slides.find(s => s.id === activeSlideId) ?? slides[0]
  const activeIndex = activeSlide ? slides.findIndex(s => s.id === activeSlide.id) + 1 : 1
  const hasLayers = (activeSlide?.layers.length ?? 0) > 0

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

  return (
    <SlideImageEditProvider>
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
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
              Add text
            </Button>
          ) : null}

          <div className="flex-1" />

          <div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex">
            <span>
              Slide {activeIndex} of {slides.length}
            </span>
            <span>·</span>
            <AspectRatioBadge />
          </div>

          <Button size="sm" onClick={handleExport} disabled={exporting}>
            {exporting ? <Loader2Icon className="animate-spin" /> : <DownloadIcon />}
            {exporting ? `${exportProgress.current}/${exportProgress.total}` : 'Export ZIP'}
          </Button>
        </div>

        {/* Canvas + inspector */}
        <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)_minmax(0,min(280px,36vh))] overflow-hidden lg:grid-cols-[minmax(0,1fr)_260px] lg:grid-rows-1">
          <div className="relative flex min-h-0 flex-col overflow-hidden">
            <div className="studio-canvas-workspace relative flex min-h-0 flex-1 flex-col overflow-hidden p-2 sm:p-4">
              {activeSlide ? (
                <div className="flex h-full min-h-0 max-h-full flex-1 items-center justify-center">
                  <div className="h-full min-h-0 max-h-full w-full max-w-[600px]">
                    <SlidePreviewCarousel maxWidth={600} className="h-full min-h-0 max-h-full" />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No slide selected</p>
              )}

              {activeSlide && !activeLayerId && hasLayers ? (
                <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center px-4 lg:bottom-4">
                  <div className="flex items-center gap-2 rounded-full border bg-background/95 px-3 py-1.5 text-[11px] text-muted-foreground shadow-sm backdrop-blur-sm">
                    <MousePointer2Icon className="size-3.5 shrink-0" />
                    <span>Click background to edit · Zoom or crop image · Click text to select</span>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex h-full min-h-0 max-h-[min(380px,40vh)] flex-col overflow-hidden border-t bg-card lg:max-h-none lg:border-t-0 lg:border-l">
            <EditorInspector />
          </div>
        </div>

        {/* Filmstrip */}
        <div className="shrink-0 border-t bg-muted/20 px-3 py-2">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Slides</span>
            <span className="text-[11px] text-muted-foreground">
              Swipe preview · Drag to reorder · Right-click for duplicate &amp; delete
            </span>
          </div>
          <SlideNavigator variant="filmstrip" />
        </div>
      </div>
    </SlideImageEditProvider>
  )
}
