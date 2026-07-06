'use client'

import { CanvasWorkspaceProvider } from '@/components/carousel/canvas-workspace-context'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ClipAiProvider, useClipAi } from '@/components/video/ai/clip-ai-provider'
import { usePlayback } from '@/hooks/video/use-playback'
import { useVideoShortcuts } from '@/hooks/video/use-video-shortcuts'
import { DEFAULT_VIDEO_PREVIEW_ZOOM } from '@/lib/carousel/defaults'
import { cn } from '@/lib/utils'
import { useVideoEditorStore } from '@/lib/video/store'
import { VideoFormatSelector } from '@/components/video/video-format-selector'
import { VideoSaveBar } from '@/components/video/video-save-bar'
import { DownloadIcon, Redo2Icon, Undo2Icon } from 'lucide-react'
import { useRef, useState } from 'react'
import { ExportModal } from './export/export-modal'
import { PreviewCanvas } from './preview/preview-canvas'
import { VideoZoomControls } from './preview/video-zoom-controls'
import { Timeline } from './timeline/timeline'
import { TimelineTransport } from './timeline/timeline-transport'

export function VideoEditor() {
  return (
    <ClipAiProvider>
      <VideoEditorContent />
    </ClipAiProvider>
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
  const playhead = useVideoEditorStore(s => s.playhead)
  const duration = useVideoEditorStore(s => s.project.duration)
  const selectedClipId = useVideoEditorStore(s => s.selectedClipId)
  const selectedOverlayId = useVideoEditorStore(s => s.selectedOverlayId)
  const selectClip = useVideoEditorStore(s => s.selectClip)
  const addTextOverlay = useVideoEditorStore(s => s.addTextOverlay)
  const splitClip = useVideoEditorStore(s => s.splitClip)
  const splitOverlay = useVideoEditorStore(s => s.splitOverlay)
  const { openClipAi, canUseClipAi, getClipAiMode, isProcessingClip } = useClipAi()
  const [exportOpen, setExportOpen] = useState(false)

  const canUndo = past.length > 0
  const canRedo = future.length > 0
  const canSplit = Boolean(selectedClipId || selectedOverlayId)
  const canExport = duration > 0
  const clipAiMode = selectedClipId ? getClipAiMode(selectedClipId) : null
  const canUseAi = selectedClipId ? canUseClipAi(selectedClipId) : false
  const isAiProcessing = selectedClipId ? isProcessingClip(selectedClipId) : false
  const aiLabel = clipAiMode === 'animate-image' ? 'Animate with AI' : 'Edit with AI'

  const handleSplit = () => {
    if (selectedClipId) {
      splitClip(selectedClipId, playhead)
    } else if (selectedOverlayId) {
      splitOverlay(selectedOverlayId, playhead)
    }
  }

  const handleAddText = () => {
    const end = Math.min(duration > 0 ? duration : playhead + 3, playhead + 3)
    addTextOverlay(playhead, Math.max(playhead + 0.5, end))
  }

  const handleWorkspacePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('[data-video-canvas]')) return
    if (target.closest('[data-canvas-controls]')) return
    if (target.closest('[data-preview-playback]')) return
    if (useVideoEditorStore.getState().isPlaying) return
    selectClip(null)
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
      {/* Canvas top bar — CapCut-style chrome */}
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

        <VideoZoomControls className="hidden sm:flex" zoom={previewZoom} onZoomChange={setPreviewZoom} />

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

      {/* Preview — full width, maximum height */}
      <CanvasWorkspaceProvider workspaceRef={workspaceRef}>
        <div
          ref={workspaceRef}
          className={cn(
            'video-editor-canvas-area relative min-h-0 min-w-0 flex-1 overflow-hidden',
          )}
          onPointerDown={handleWorkspacePointerDown}
        >
          <PreviewCanvas
            canvasRef={canvasRef}
            previewZoom={previewZoom}
            showSafeZone={showSafeZone}
            onToggleSafeZone={() => setShowSafeZone(value => !value)}
          />

          <div className="pointer-events-none absolute bottom-3 left-3 z-10 sm:hidden">
            <VideoZoomControls zoom={previewZoom} onZoomChange={setPreviewZoom} />
          </div>
        </div>
      </CanvasWorkspaceProvider>

      {/* Timeline section — transport bar + tracks */}
      <div className="video-editor-timeline-section flex min-w-0 shrink-0 flex-col overflow-hidden border-t">
        <TimelineTransport
          playback={playback}
          onAddText={handleAddText}
          onSplit={handleSplit}
          onOpenAi={() => selectedClipId && openClipAi(selectedClipId)}
          canSplit={canSplit}
          canUseAi={canUseAi}
          isAiProcessing={isAiProcessing}
          aiLabel={aiLabel}
        />
        <div className="h-[min(240px,32vh)] min-h-[180px] min-w-0 overflow-hidden lg:h-[220px]">
          <Timeline />
        </div>
      </div>

      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  )
}
