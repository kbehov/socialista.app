'use client'

import { CanvasWorkspaceProvider } from '@/components/carousel/canvas-workspace-context'
import { CanvasZoomControls } from '@/components/carousel/canvas-zoom-controls'
import { CarouselPreviewLayoutProvider } from '@/components/carousel/carousel-preview-layout'
import { FormatSelector } from '@/components/carousel/format-selector'
import { SlidePagesStrip } from '@/components/carousel/slide-pages-strip'
import { SlideshowSaveBar } from '@/components/carousel/slideshow-save-bar'
import { SlideshowStudioMobileSheet } from '@/components/carousel/slideshow-studio-sidebar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Kbd } from '@/components/ui/kbd'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useEditorShortcuts } from '@/hooks/carousel/use-editor-shortcuts'
import type { SidebarTab } from '@/hooks/carousel/use-sidebar-tab'
import { isBlankSlide } from '@/lib/carousel/defaults'
import { exportSlidesAsZip } from '@/lib/carousel/export'
import { useEditorStore } from '@/lib/carousel/store'
import { cn } from '@/lib/utils'
import {
  DownloadIcon,
  ImageIcon,
  LayersIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  Redo2Icon,
  SparklesIcon,
  TypeIcon,
  Undo2Icon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { SlideImageEditProvider, useSlideImageEdit } from './slide-image-edit-provider'
import { SlidePreviewStack } from './slide-preview-stack'

export function CarouselEditor({ panels }: { panels?: ReactNode }) {
  return (
    <SlideImageEditProvider>
      <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden lg:flex-row">
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
  const clearLayerSelection = useEditorStore(s => s.clearLayerSelection)
  const addTextLayer = useEditorStore(s => s.addTextLayer)
  const past = useEditorStore(s => s.past)
  const future = useEditorStore(s => s.future)
  const isDirty = useEditorStore(s => s.isDirty)

  const [exporting, setExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 0 })
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)
  const [mobileSheetTab, setMobileSheetTab] = useState<SidebarTab>('generate')
  const [hintDismissed, setHintDismissed] = useState(false)

  const workspaceRef = useRef<HTMLDivElement>(null)
  const { deselectBackgroundEdit } = useSlideImageEdit()

  const activeSlide = slides.find(s => s.id === activeSlideId) ?? slides[0]
  const activeIndex = slides.findIndex(slide => slide.id === activeSlideId)
  const currentPage = activeIndex >= 0 ? activeIndex + 1 : 0
  const canUndo = past.length > 0
  const canRedo = future.length > 0

  const showStarterHint = useMemo(() => {
    if (hintDismissed) return false
    if (slides.length !== 1 || !slides[0]) return false
    return isBlankSlide(slides[0])
  }, [hintDismissed, slides])

  const canvasHint = showStarterHint
    ? 'Start with Generate, or add text and a background from Edit.'
    : null

  useEditorShortcuts()

  useEffect(() => {
    if (slides.length > 0 && !activeSlideId) {
      useEditorStore.getState().setActiveSlide(slides[0].id)
    }
  }, [slides, activeSlideId])

  useEffect(() => {
    if (!showStarterHint) return
    const timer = window.setTimeout(() => setHintDismissed(true), 12_000)
    return () => window.clearTimeout(timer)
  }, [showStarterHint])

  const openMobileSheet = useCallback((tab: SidebarTab) => {
    setMobileSheetTab(tab)
    setMobileSheetOpen(true)
  }, [])

  const handleExport = useCallback(async () => {
    if (exporting || slides.length === 0) return
    setExporting(true)
    setExportProgress({ current: 0, total: slides.length })

    try {
      const canvasWidth = useEditorStore.getState().canvas.width
      await exportSlidesAsZip(slides, canvasWidth, {
        onProgress: (current, total) => setExportProgress({ current, total }),
      })
      toast.success('Export ready')
    } catch {
      toast.error('Export failed. Try removing external background images or re-uploading photos.')
    } finally {
      setExporting(false)
    }
  }, [exporting, slides])

  const handleAddText = useCallback(() => {
    if (!activeSlideId) return
    addTextLayer(activeSlideId)
    setHintDismissed(true)
  }, [activeSlideId, addTextLayer])

  const handleWorkspacePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('[data-slide-canvas]')) return
      if (target.closest('[data-bg-edit-toolbar]')) return
      if (target.closest('[data-canvas-controls]')) return
      if (target.closest('[data-slide-actions]')) return
      if (target.closest('[data-add-page]')) return
      if (target.closest('[data-pages-strip]')) return
      deselectBackgroundEdit()
      clearLayerSelection()
    },
    [clearLayerSelection, deselectBackgroundEdit],
  )

  return (
    <main className="slideshow-editor-main flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
      <div className="slideshow-editor-canvas-bar video-editor-canvas-bar flex min-h-12 min-w-0 shrink-0 items-end gap-1.5 overflow-x-auto border-b px-2 py-1.5 sm:gap-2 sm:px-3">
        <div className="flex h-8 items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-sm"
                variant="ghost"
                className="size-8"
                onClick={undo}
                disabled={!canUndo}
                aria-label={canUndo ? 'Undo' : 'Nothing to undo'}
              >
                <Undo2Icon className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Undo <Kbd className="ml-1">⌘Z</Kbd>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-sm"
                variant="ghost"
                className="size-8"
                onClick={redo}
                disabled={!canRedo}
                aria-label={canRedo ? 'Redo' : 'Nothing to redo'}
              >
                <Redo2Icon className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Redo <Kbd className="ml-1">⌘⇧Z</Kbd>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex h-8 items-center gap-0.5 lg:hidden">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 px-2.5"
            onClick={() => openMobileSheet('generate')}
            aria-label="Open generate panel"
          >
            <SparklesIcon className="size-3.5" />
            <span className="text-xs">Generate</span>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 px-2.5"
            onClick={() => openMobileSheet('edit')}
            aria-label="Open edit panel"
          >
            <LayersIcon className="size-3.5" />
            <span className="text-xs">Edit</span>
          </Button>
        </div>

        <div className="min-w-0 flex-1" />

        <FormatSelector
          showLabel={false}
          className="hidden h-8 w-[min(100%,160px)] shrink-0 justify-end sm:flex lg:w-[180px]"
        />
        <SlideshowSaveBar
          showLabel={false}
          compact
          className="hidden min-w-0 w-[min(100%,220px)] shrink-0 sm:flex lg:w-[260px]"
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              className="size-8 shrink-0 sm:hidden"
              aria-label="Project menu"
            >
              <MoreHorizontalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-2">
              <SlideshowSaveBar showLabel={false} compact className="w-full" />
            </div>
            <DropdownMenuSeparator />
            <div className="px-2 py-2">
              <FormatSelector showLabel className="w-full" />
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={!activeSlideId}
              onSelect={() => {
                handleAddText()
                openMobileSheet('edit')
              }}
            >
              <TypeIcon className="size-3.5" />
              Add text
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => openMobileSheet('edit')}>
              <ImageIcon className="size-3.5" />
              Edit slide background
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          size="sm"
          className={cn('h-8 gap-1.5 px-3', slides.length > 0 && 'bg-primary hover:bg-primary/90')}
          onClick={() => void handleExport()}
          disabled={exporting || slides.length === 0}
          aria-label={exporting ? `Exporting ${exportProgress.current} of ${exportProgress.total}` : 'Export images'}
          aria-busy={exporting}
        >
          {exporting ? <Loader2Icon className="size-3.5 animate-spin" /> : <DownloadIcon className="size-3.5" />}
          <span className="hidden sm:inline">
            {exporting ? `${exportProgress.current}/${exportProgress.total}` : 'Export'}
          </span>
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <CanvasWorkspaceProvider workspaceRef={workspaceRef}>
          <div
            ref={workspaceRef}
            className="slideshow-editor-canvas-area video-editor-canvas-area relative min-h-0 w-full flex-1 overflow-hidden"
            onPointerDown={handleWorkspacePointerDown}
          >
            <CarouselPreviewLayoutProvider>
              {activeSlide ? (
                <SlidePreviewStack canvasHint={canvasHint} />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                  <ImageIcon className="size-8 text-muted-foreground/50" />
                  <p className="text-sm font-medium text-muted-foreground">No slides yet</p>
                  <p className="max-w-xs text-xs text-muted-foreground/80">
                    Use Generate to create carousels with AI, import from TikTok, or add a blank slide.
                  </p>
                  <Button size="sm" variant="outline" className="mt-1 lg:hidden" onClick={() => openMobileSheet('generate')}>
                    <SparklesIcon className="size-3.5" />
                    Open Generate
                  </Button>
                </div>
              )}
            </CarouselPreviewLayoutProvider>

            {showStarterHint ? (
              <div className="pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-center px-3 lg:hidden">
                <div className="pointer-events-auto max-w-sm rounded-full border border-border/60 bg-background/95 px-3 py-1.5 text-center text-[11px] text-muted-foreground shadow-sm backdrop-blur-sm">
                  Tip: Generate copy, then style pages below
                </div>
              </div>
            ) : null}
          </div>
        </CanvasWorkspaceProvider>

        <div className="slideshow-editor-status-bar flex min-h-10 min-w-0 shrink-0 items-center justify-between gap-2 border-t px-3 py-1.5">
          <div className="flex min-w-0 items-center gap-2 text-xs tabular-nums text-muted-foreground">
            <span className="font-medium text-foreground">Pages</span>
            <span>
              {currentPage} / {slides.length}
            </span>
            {isDirty ? (
              <span className="truncate text-[10px] text-muted-foreground" aria-live="polite">
                · Unsaved
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  className="size-8"
                  onClick={handleAddText}
                  disabled={!activeSlideId}
                  aria-label="Add text"
                >
                  <TypeIcon className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add text</TooltipContent>
            </Tooltip>
            <CanvasZoomControls />
          </div>
        </div>

        <SlidePagesStrip />
      </div>

      <span className="sr-only" aria-live="polite">
        {exporting ? `Exporting page ${exportProgress.current} of ${exportProgress.total}` : ''}
      </span>

      <SlideshowStudioMobileSheet
        open={mobileSheetOpen}
        onOpenChange={setMobileSheetOpen}
        initialTab={mobileSheetTab}
      />
    </main>
  )
}
