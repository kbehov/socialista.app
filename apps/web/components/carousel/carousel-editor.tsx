'use client'

import { CanvasWorkspaceProvider } from '@/components/carousel/canvas-workspace-context'
import { CanvasZoomControls } from '@/components/carousel/canvas-zoom-controls'
import { CarouselPreviewLayoutProvider } from '@/components/carousel/carousel-preview-layout'
import { EditorInspector } from '@/components/carousel/editor-inspector'
import { FormatSelector } from '@/components/carousel/format-selector'
import { SlidePagesStrip } from '@/components/carousel/slide-pages-strip'
import { SlideshowPreviewDialog } from '@/components/carousel/slideshow-preview-dialog'
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
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { useEditorShortcuts } from '@/hooks/carousel/use-editor-shortcuts'
import type { SidebarTab } from '@/hooks/carousel/use-sidebar-tab'
import { isBlankSlide } from '@/lib/carousel/defaults'
import { exportSlidesAsZip } from '@/lib/carousel/export'
import { useEditorStore } from '@/lib/carousel/store'
import { cn } from '@/lib/utils'
import {
  ChevronLeftIcon,
  DownloadIcon,
  ImageIcon,
  LayersIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  PaletteIcon,
  PlayIcon,
  Redo2Icon,
  SendIcon,
  SparklesIcon,
  TypeIcon,
  Undo2Icon,
  VideoIcon,
} from 'lucide-react'
import Link from 'next/link'
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
        <EditorInspector className="hidden w-72 shrink-0 lg:flex xl:w-80" embedded />
      </div>
    </SlideImageEditProvider>
  )
}

function CarouselEditorMain() {
  const slides = useEditorStore(s => s.slides)
  const activeSlideId = useEditorStore(s => s.activeSlideId)
  const activeLayerId = useEditorStore(s => s.activeLayerId)
  const undo = useEditorStore(s => s.undo)
  const redo = useEditorStore(s => s.redo)
  const clearLayerSelection = useEditorStore(s => s.clearLayerSelection)
  const past = useEditorStore(s => s.past)
  const future = useEditorStore(s => s.future)
  const setStudioPanelTab = useEditorStore(s => s.setStudioPanelTab)

  const [exporting, setExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 0 })
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)
  const [mobileSheetTab, setMobileSheetTab] = useState<SidebarTab>('create')
  const [mobileInspectorOpen, setMobileInspectorOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [hintDismissed, setHintDismissed] = useState(false)

  const workspaceRef = useRef<HTMLDivElement>(null)
  const { deselectBackgroundEdit } = useSlideImageEdit()

  const activeSlide = slides.find(s => s.id === activeSlideId) ?? slides[0]
  const canUndo = past.length > 0
  const canRedo = future.length > 0

  const showStarterHint = useMemo(() => {
    if (hintDismissed) return false
    if (slides.length !== 1 || !slides[0]) return false
    return isBlankSlide(slides[0])
  }, [hintDismissed, slides])

  useEditorShortcuts({
    onSave: () => {
      window.dispatchEvent(new CustomEvent('slideshow:save'))
    },
    onPreview: () => setPreviewOpen(true),
  })

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
    setStudioPanelTab(tab)
  }, [setStudioPanelTab])

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

  const handleCreateVideo = useCallback(() => {
    window.dispatchEvent(new CustomEvent('slideshow:create-video'))
  }, [])

  const handlePostNow = useCallback(() => {
    window.dispatchEvent(new CustomEvent('slideshow:post-now'))
  }, [])

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

  const handleCanvasDragOver = useCallback((e: React.DragEvent) => {
    if (![...e.dataTransfer.types].includes('Files')) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  const handleCanvasDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const files = [...e.dataTransfer.files].filter(file => file.type.startsWith('image/'))
      if (files.length === 0) return
      const slideId = useEditorStore.getState().activeSlideId
      if (!slideId) return
      for (const file of files) {
        useEditorStore.getState().addImageLayer(slideId, URL.createObjectURL(file))
      }
      setHintDismissed(true)
      toast.success(files.length === 1 ? 'Image added' : `${files.length} images added`)
    },
    [],
  )

  return (
    <main className="slideshow-editor-main flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
      <div className="slideshow-editor-canvas-bar video-editor-canvas-bar flex h-10 min-w-0 shrink-0 items-center gap-1 overflow-x-auto border-b px-1.5 sm:gap-1.5 sm:px-2">
        <div className="flex min-w-0 items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                asChild
                size="icon-sm"
                variant="ghost"
                className="size-7 shrink-0"
                aria-label="Back to slideshows"
              >
                <Link href={DASHBOARD_ROUTES.STUDIO.SLIDESHOWS}>
                  <ChevronLeftIcon className="size-3.5" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>All slideshows</TooltipContent>
          </Tooltip>
          <SlideshowSaveBar showLabel={false} compact className="min-w-0 max-w-50 sm:max-w-60" />
        </div>

        <div className="flex h-7 items-center gap-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-sm"
                variant="ghost"
                className="size-7"
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
                className="size-7"
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

        <div className="flex h-7 items-center gap-0.5 lg:hidden">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 gap-1 px-2"
            onClick={() => openMobileSheet('create')}
            aria-label="Open create panel"
          >
            <SparklesIcon className="size-3.5" />
            <span className="text-[11px]">Create</span>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 gap-1 px-2"
            onClick={() => openMobileSheet('design')}
            aria-label="Open design panel"
          >
            <PaletteIcon className="size-3.5" />
            <span className="text-[11px]">Design</span>
          </Button>
          {activeLayerId ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-7 gap-1 px-2"
              onClick={() => setMobileInspectorOpen(true)}
              aria-label="Open inspector"
            >
              <LayersIcon className="size-3.5" />
              <span className="text-[11px]">Edit</span>
            </Button>
          ) : null}
        </div>

        <div className="min-w-0 flex-1" />

        <FormatSelector
          showLabel={false}
          className="hidden h-7 w-[min(100%,140px)] shrink-0 justify-end sm:flex lg:w-40"
        />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="hidden h-7 gap-1 px-2 sm:flex"
              onClick={() => setPreviewOpen(true)}
              disabled={slides.length === 0}
              aria-label="Preview slideshow"
            >
              <PlayIcon className="size-3.5" />
              <span className="hidden text-[11px] lg:inline">Preview</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Preview <Kbd className="ml-1">⌘⇧P</Kbd>
          </TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              className="size-7 shrink-0 sm:hidden"
              aria-label="Project menu"
            >
              <MoreHorizontalIcon className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-2">
              <FormatSelector showLabel className="w-full" />
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setPreviewOpen(true)} disabled={slides.length === 0}>
              <PlayIcon className="size-3.5" />
              Preview
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => openMobileSheet('text')}>
              <TypeIcon className="size-3.5" />
              Add text
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => openMobileSheet('media')}>
              <ImageIcon className="size-3.5" />
              Add media
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => openMobileSheet('design')}>
              <PaletteIcon className="size-3.5" />
              Design slide
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handlePostNow} disabled={slides.length === 0}>
              <SendIcon className="size-3.5" />
              Post now
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleCreateVideo}>
              <VideoIcon className="size-3.5" />
              Create video
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              className={cn('h-7 gap-1 px-2.5', slides.length > 0 && 'bg-primary hover:bg-primary/90')}
              disabled={exporting || slides.length === 0}
              aria-label={exporting ? `Exporting ${exportProgress.current} of ${exportProgress.total}` : 'Export'}
              aria-busy={exporting}
            >
              {exporting ? (
                <Loader2Icon className="size-3.5 animate-spin" />
              ) : (
                <DownloadIcon className="size-3.5" />
              )}
              <span className="hidden text-[11px] sm:inline">
                {exporting ? `${exportProgress.current}/${exportProgress.total}` : 'Export'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              disabled={exporting || slides.length === 0}
              onSelect={() => void handleExport()}
            >
              <DownloadIcon className="size-3.5" />
              Download images
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handlePostNow} disabled={slides.length === 0}>
              <SendIcon className="size-3.5" />
              Post now
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleCreateVideo}>
              <VideoIcon className="size-3.5" />
              Create video
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <CanvasWorkspaceProvider workspaceRef={workspaceRef}>
          <div
            ref={workspaceRef}
            className="slideshow-editor-canvas-area video-editor-canvas-area relative min-h-0 w-full flex-1 overflow-hidden"
            onPointerDown={handleWorkspacePointerDown}
            onDragOver={handleCanvasDragOver}
            onDrop={handleCanvasDrop}
          >
            <CarouselPreviewLayoutProvider>
              {activeSlide ? (
                <SlidePreviewStack
                  emptyState={
                    showStarterHint ? (
                      <EmptyCanvasState
                        onGenerate={() => {
                          setHintDismissed(true)
                          openMobileSheet('create')
                          setStudioPanelTab('create')
                        }}
                        onDesign={() => {
                          setHintDismissed(true)
                          openMobileSheet('design')
                          setStudioPanelTab('design')
                        }}
                        onDismiss={() => setHintDismissed(true)}
                      />
                    ) : null
                  }
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                  <ImageIcon className="size-8 text-muted-foreground/50" />
                  <p className="text-sm font-medium text-muted-foreground">No slides yet</p>
                  <p className="max-w-xs text-xs text-muted-foreground/80">
                    Use Create to generate carousels with AI, import from TikTok, or add a blank slide.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-1 lg:hidden"
                    onClick={() => openMobileSheet('create')}
                  >
                    <SparklesIcon className="size-3.5" />
                    Open Create
                  </Button>
                </div>
              )}
            </CarouselPreviewLayoutProvider>

            <div className="pointer-events-none absolute right-3 bottom-3 z-10">
              <CanvasZoomControls />
            </div>
          </div>
        </CanvasWorkspaceProvider>

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
      <SlideshowStudioMobileSheet
        open={mobileInspectorOpen}
        onOpenChange={setMobileInspectorOpen}
        showInspector
      />
      <SlideshowPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        onExport={() => void handleExport()}
      />
    </main>
  )
}

function EmptyCanvasState({
  onGenerate,
  onDesign,
  onDismiss,
}: {
  onGenerate: () => void
  onDesign: () => void
  onDismiss: () => void
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-6">
      <div className="pointer-events-auto flex w-full max-w-sm flex-col gap-3 rounded-2xl border border-border/60 bg-background/95 p-4 shadow-lg backdrop-blur-sm">
        <div>
          <p className="text-sm font-medium tracking-tight text-foreground">Start your carousel</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Generate copy with AI, import from TikTok, or design a blank slide.
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Button size="sm" className="w-full justify-start" onClick={onGenerate}>
            <SparklesIcon className="size-3.5" />
            Generate with AI
          </Button>
          <Button size="sm" variant="outline" className="w-full justify-start" onClick={onGenerate}>
            <ImageIcon className="size-3.5" />
            Import from TikTok
          </Button>
          <Button size="sm" variant="ghost" className="w-full justify-start" onClick={onDesign}>
            <PaletteIcon className="size-3.5" />
            Start blank
          </Button>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="self-center text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
