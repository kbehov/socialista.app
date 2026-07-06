'use client'

import { CanvasWorkspaceProvider } from '@/components/carousel/canvas-workspace-context'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ClipAiProvider } from '@/components/video/ai/clip-ai-provider'
import { usePlayback } from '@/hooks/video/use-playback'
import { useVideoShortcuts } from '@/hooks/video/use-video-shortcuts'
import { DEFAULT_VIDEO_PREVIEW_ZOOM } from '@/lib/carousel/defaults'
import { formatTimecode } from '@/lib/video/timecode'
import { cn } from '@/lib/utils'
import { useVideoEditorStore } from '@/lib/video/store'
import { VideoFormatSelector, VideoResolutionBadge } from '@/components/video/video-format-selector'
import { VideoSaveBar } from '@/components/video/video-save-bar'
import { isVerticalReelsFormat } from '@/components/video/preview/safe-zone-overlay'
import { DownloadIcon, Redo2Icon, ShieldCheckIcon, Undo2Icon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ExportModal } from './export/export-modal'
import { PreviewCanvas } from './preview/preview-canvas'
import { VideoZoomControls } from './preview/video-zoom-controls'
import { Timeline } from './timeline/timeline'
import { SelectedClipActionBar } from './timeline/selected-clip-action-bar'
import { TimelineTransport } from './timeline/timeline-transport'

export function VideoEditor() {
  return (
    <ClipAiProvider>
      <VideoEditorContent />
    </ClipAiProvider>
  )
}

function VideoEditorTimecode({ fps, duration }: { fps: number; duration: number }) {
  const spanRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const formatTime = (playhead: number) =>
      `${formatTimecode(playhead, fps)} / ${formatTimecode(duration, fps)}`

    if (spanRef.current) {
      spanRef.current.textContent = formatTime(useVideoEditorStore.getState().playhead)
    }

    return useVideoEditorStore.subscribe((state, prevState) => {
      if (state.playhead === prevState.playhead) return
      if (spanRef.current) {
        spanRef.current.textContent = formatTime(state.playhead)
      }
    })
  }, [fps, duration])

  const initialPlayhead = useVideoEditorStore.getState().playhead
  return (
    <span ref={spanRef}>
      {formatTimecode(initialPlayhead, fps)} / {formatTimecode(duration, fps)}
    </span>
  )
}

function VideoEditorContent() {
  useVideoShortcuts()
  const workspaceRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const playback = usePlayback(canvasRef)
  const [previewZoom, setPreviewZoom] = useState(DEFAULT_VIDEO_PREVIEW_ZOOM)
  const [showSafeZone, setShowSafeZone] = useState(true)
  const undo = useVideoEditorStore(s => s.undo)
  const redo = useVideoEditorStore(s => s.redo)
  const past = useVideoEditorStore(s => s.past)
  const future = useVideoEditorStore(s => s.future)
  const duration = useVideoEditorStore(s => s.project.duration)
  const fps = useVideoEditorStore(s => s.project.fps)
  const resolution = useVideoEditorStore(s => s.project.resolution)
  const selectedClipId = useVideoEditorStore(s => s.selectedClipId)
  const selectedOverlayId = useVideoEditorStore(s => s.selectedOverlayId)
  const selectClip = useVideoEditorStore(s => s.selectClip)
  const addTextOverlay = useVideoEditorStore(s => s.addTextOverlay)
  const splitClip = useVideoEditorStore(s => s.splitClip)
  const splitOverlay = useVideoEditorStore(s => s.splitOverlay)
  const [exportOpen, setExportOpen] = useState(false)

  const canUndo = past.length > 0
  const canRedo = future.length > 0
  const canSplit = Boolean(selectedClipId || selectedOverlayId)
  const canExport = duration > 0
  const isReelsFormat = isVerticalReelsFormat(resolution.width, resolution.height)

  const handleSplit = useCallback(() => {
    const playhead = useVideoEditorStore.getState().playhead
    if (selectedClipId) {
      splitClip(selectedClipId, playhead)
    } else if (selectedOverlayId) {
      splitOverlay(selectedOverlayId, playhead)
    }
  }, [selectedClipId, selectedOverlayId, splitClip, splitOverlay])

  const handleAddText = useCallback(() => {
    const playhead = useVideoEditorStore.getState().playhead
    const end = Math.min(duration > 0 ? duration : playhead + 3, playhead + 3)
    addTextOverlay(playhead, Math.max(playhead + 0.5, end))
  }, [addTextOverlay, duration])

  const handleWorkspacePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('[data-video-canvas]')) return
    if (target.closest('[data-canvas-controls]')) return
    if (target.closest('[data-preview-playback]')) return
    if (target.closest('[data-clip-actions]')) return
    if (useVideoEditorStore.getState().isPlaying) return
    selectClip(null)
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
      <div className="video-editor-canvas-bar flex min-w-0 shrink-0 items-center gap-1.5 overflow-x-auto border-b px-2 py-1.5 sm:gap-2 sm:px-3">
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

        <div className="min-w-0 flex-1" />

        <VideoFormatSelector showLabel={false} className="hidden w-[min(100%,160px)] shrink-0 md:flex lg:w-[180px]" />
        <VideoSaveBar showLabel={false} className="hidden min-w-0 max-w-[160px] shrink-0 md:flex lg:max-w-[180px]" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              className={cn('h-8 gap-1.5 px-3', canExport && 'bg-primary hover:bg-primary/90')}
              onClick={() => setExportOpen(true)}
              disabled={!canExport}
            >
              <DownloadIcon className="size-3.5" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </TooltipTrigger>
          {!canExport ? (
            <TooltipContent>Add media before exporting</TooltipContent>
          ) : (
            <TooltipContent>Download MP4</TooltipContent>
          )}
        </Tooltip>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <CanvasWorkspaceProvider workspaceRef={workspaceRef}>
          <div
            ref={workspaceRef}
            className="video-editor-canvas-area relative min-h-0 w-full flex-1 overflow-hidden"
            onPointerDown={handleWorkspacePointerDown}
          >
            <PreviewCanvas
              canvasRef={canvasRef}
              previewZoom={previewZoom}
              showSafeZone={showSafeZone}
              isBuffering={playback.isBuffering}
            />
          </div>
        </CanvasWorkspaceProvider>

        <div className="video-editor-status-bar mt-auto flex min-w-0 shrink-0 items-center justify-between gap-2 border-t px-3 py-1.5">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 text-xs tabular-nums text-muted-foreground">
              <span className="font-medium text-foreground">Time</span>
              <VideoEditorTimecode fps={fps} duration={duration} />
            </div>
            <span className="hidden h-4 w-px shrink-0 bg-border sm:block" aria-hidden />
            <VideoResolutionBadge className="hidden sm:inline-flex" />
            {isReelsFormat ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    data-canvas-controls
                    className={cn(
                      'h-7 gap-1.5 px-2 text-xs text-muted-foreground',
                      showSafeZone && 'bg-primary/10 text-primary',
                    )}
                    onClick={() => setShowSafeZone(value => !value)}
                    aria-pressed={showSafeZone}
                    aria-label={showSafeZone ? 'Hide safe area guides' : 'Show safe area guides'}
                  >
                    <ShieldCheckIcon className="size-3.5 shrink-0" />
                    <span className="hidden md:inline">Safe area</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[200px]">
                  {showSafeZone ? 'Hide safe area guides' : 'Show safe area for Reels & TikTok UI'}
                </TooltipContent>
              </Tooltip>
            ) : null}
          </div>
          <VideoZoomControls zoom={previewZoom} onZoomChange={setPreviewZoom} />
        </div>
      </div>

      <div className="video-editor-timeline-section flex min-w-0 shrink-0 flex-col overflow-hidden border-t">
        <TimelineTransport
          playback={playback}
          onAddText={handleAddText}
          onSplit={handleSplit}
          canSplit={canSplit}
        />
        {selectedClipId ? <SelectedClipActionBar clipId={selectedClipId} /> : null}
        <div className="h-[min(240px,32vh)] min-h-[180px] min-w-0 overflow-hidden lg:h-[220px]">
          <Timeline />
        </div>
      </div>

      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  )
}
