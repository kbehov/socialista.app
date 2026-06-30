'use client'

import { useCallback, useState } from 'react'
import { DownloadIcon, Loader2Icon, Redo2Icon, Undo2Icon, PlusIcon } from 'lucide-react'
import { useEditorStore } from '@/lib/carousel/store'
import { useEditorShortcuts } from '@/hooks/carousel/use-editor-shortcuts'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { exportSlidesAsZip } from '@/lib/carousel/export'
import { toast } from 'sonner'
import { AspectRatioBadge } from './slideshow-generator-panel'
import { SlideNavigator } from './slide-navigator'
import { SlideCanvas } from './slide-canvas'
import { SlideBackgroundPanel } from './slide-background-panel'
import { TextToolbar } from './text-toolbar'
import { LayerList } from './layer-list'

export function CarouselEditor() {
  useEditorShortcuts()

  const slides = useEditorStore(s => s.slides)
  const activeSlideId = useEditorStore(s => s.activeSlideId)
  const undo = useEditorStore(s => s.undo)
  const redo = useEditorStore(s => s.redo)
  const addTextLayer = useEditorStore(s => s.addTextLayer)
  const past = useEditorStore(s => s.past)
  const future = useEditorStore(s => s.future)

  const [exporting, setExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 0 })

  const activeSlide = slides.find(s => s.id === activeSlideId) ?? slides[0]
  const activeIndex = activeSlide ? slides.findIndex(s => s.id === activeSlide.id) + 1 : 1

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
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border bg-card shadow-xs">
      {/* Top toolbar */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2">
        <div className="flex items-center gap-0.5">
          <Button size="icon-sm" variant="ghost" onClick={undo} disabled={!canUndo} aria-label="Undo">
            <Undo2Icon />
          </Button>
          <Button size="icon-sm" variant="ghost" onClick={redo} disabled={!canRedo} aria-label="Redo">
            <Redo2Icon />
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            Slide {activeIndex} of {slides.length}
          </span>
          <span className="hidden sm:inline">·</span>
          <AspectRatioBadge className="hidden sm:inline" />
        </div>

        <Button size="sm" onClick={handleExport} disabled={exporting}>
          {exporting ? <Loader2Icon className="animate-spin" /> : <DownloadIcon />}
          {exporting ? `${exportProgress.current}/${exportProgress.total}` : 'Export'}
        </Button>
      </div>

      {/* Canvas + properties */}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1fr_240px]">
        <div className="relative flex min-h-0 flex-col bg-muted/50">
          <div className="flex items-center justify-between border-b bg-background/80 px-3 py-1.5 backdrop-blur-sm">
            <span className="text-[11px] font-medium text-muted-foreground">Canvas</span>
            {activeSlide ? (
              <Button size="xs" variant="ghost" onClick={() => addTextLayer(activeSlide.id)}>
                <PlusIcon /> Text
              </Button>
            ) : null}
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-4">
            {activeSlide ? (
              <SlideCanvas slide={activeSlide} interactive maxWidth={480} />
            ) : (
              <p className="text-sm text-muted-foreground">No slide selected</p>
            )}
          </div>
        </div>

        <div className="min-h-0 overflow-hidden border-t lg:border-t-0 lg:border-l">
          <ScrollArea className="h-full min-h-0 **:data-[slot=scroll-area-viewport]:h-full **:data-[slot=scroll-area-viewport]:overscroll-contain">
            <div className="flex flex-col gap-2 p-2">
              <SlideBackgroundPanel />
              <TextToolbar />
              <LayerList />
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Bottom filmstrip */}
      <div className="shrink-0 border-t bg-muted/30 px-3 py-2">
        <SlideNavigator variant="filmstrip" />
      </div>
    </div>
  )
}
