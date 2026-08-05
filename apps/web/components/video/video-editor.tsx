'use client'

import { CanvasWorkspaceProvider } from '@/components/carousel/canvas-workspace-context'
import { ClipAiProvider } from '@/components/video/ai/clip-ai-provider'
import { VideoEditorTopBar } from '@/components/video/video-editor-top-bar'
import { VideoOnboardingTour } from '@/components/video/onboarding-tour'
import { usePlayback } from '@/hooks/video/use-playback'
import { useVideoShortcuts } from '@/hooks/video/use-video-shortcuts'
import { DEFAULT_VIDEO_PREVIEW_ZOOM } from '@/lib/carousel/defaults'
import {
  MAX_TIMELINE_HEIGHT,
  MIN_TIMELINE_HEIGHT,
  TIMELINE_HEIGHT_STOPS,
} from '@/lib/video/defaults'
import { useVideoEditorStore } from '@/lib/video/store'
import { useCallback, useRef, useState } from 'react'
import { ExportModal } from './export/export-modal'
import { PreviewCanvas } from './preview/preview-canvas'
import { Timeline } from './timeline/timeline'
import { TimelineTransport } from './timeline/timeline-transport'

export function VideoEditor() {
  return (
    <ClipAiProvider>
      <VideoEditorContent />
    </ClipAiProvider>
  )
}

function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot))
}

function snapTimelineHeight(height: number): number {
  let best: number = TIMELINE_HEIGHT_STOPS[0]
  let bestDist = Infinity
  for (const stop of TIMELINE_HEIGHT_STOPS) {
    const dist = Math.abs(stop - height)
    if (dist < bestDist) {
      best = stop
      bestDist = dist
    }
  }
  // Only snap when close to a stop
  if (bestDist <= 24) return best
  return Math.round(height)
}

function VideoEditorContent() {
  useVideoShortcuts()
  const workspaceRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const playback = usePlayback(canvasRef)
  const [previewZoom, setPreviewZoom] = useState(DEFAULT_VIDEO_PREVIEW_ZOOM)
  const duration = useVideoEditorStore(s => s.project.duration)
  const selectClip = useVideoEditorStore(s => s.selectClip)
  const addTextOverlay = useVideoEditorStore(s => s.addTextOverlay)
  const selectedClipId = useVideoEditorStore(s => s.selectedClipId)
  const selectedOverlayId = useVideoEditorStore(s => s.selectedOverlayId)
  const splitClip = useVideoEditorStore(s => s.splitClip)
  const splitOverlay = useVideoEditorStore(s => s.splitOverlay)
  const timelineHeight = useVideoEditorStore(s => s.timelineHeight)
  const setTimelineHeight = useVideoEditorStore(s => s.setTimelineHeight)
  const [exportOpen, setExportOpen] = useState(false)
  const resizeRef = useRef<{ startY: number; startHeight: number } | null>(null)

  const canSplit = Boolean(selectedClipId || selectedOverlayId)
  const canExport = duration > 0

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

  const handleResizePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    resizeRef.current = { startY: e.clientY, startHeight: timelineHeight }

    const onMove = (ev: PointerEvent) => {
      const start = resizeRef.current
      if (!start) return
      const delta = start.startY - ev.clientY
      let next = start.startHeight + delta
      if (next < MIN_TIMELINE_HEIGHT) {
        next = MIN_TIMELINE_HEIGHT - rubberband(MIN_TIMELINE_HEIGHT - next, 80)
      } else if (next > MAX_TIMELINE_HEIGHT) {
        next = MAX_TIMELINE_HEIGHT + rubberband(next - MAX_TIMELINE_HEIGHT, 80)
      }
      setTimelineHeight(Math.round(next))
    }

    const onUp = (ev: PointerEvent) => {
      const start = resizeRef.current
      resizeRef.current = null
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      if (!start) return
      const delta = start.startY - ev.clientY
      const raw = start.startHeight + delta
      const clamped = Math.min(MAX_TIMELINE_HEIGHT, Math.max(MIN_TIMELINE_HEIGHT, raw))
      setTimelineHeight(snapTimelineHeight(clamped))
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
      <VideoEditorTopBar onExport={() => setExportOpen(true)} canExport={canExport} />

      <CanvasWorkspaceProvider workspaceRef={workspaceRef}>
        <div
          ref={workspaceRef}
          className="video-editor-canvas-area relative min-h-0 w-full flex-1 overflow-hidden"
          onPointerDown={handleWorkspacePointerDown}
        >
          <PreviewCanvas
            canvasRef={canvasRef}
            previewZoom={previewZoom}
            onPreviewZoomChange={setPreviewZoom}
            isBuffering={playback.isBuffering}
          />
        </div>
      </CanvasWorkspaceProvider>

      <div
        role="separator"
        aria-orientation="horizontal"
        aria-label="Resize timeline"
        className="video-studio-timeline-resize group relative z-10 flex h-2 shrink-0 cursor-ns-resize items-center justify-center border-t bg-background"
        onPointerDown={handleResizePointerDown}
      >
        <span className="h-0.5 w-8 rounded-full bg-border transition-colors group-hover:bg-muted-foreground/50" />
      </div>

      <div className="video-editor-timeline-section flex min-w-0 shrink-0 flex-col overflow-hidden">
        <TimelineTransport
          playback={playback}
          onAddText={handleAddText}
          onSplit={handleSplit}
          canSplit={canSplit}
        />
        <div
          data-tour-anchor="timeline"
          className="min-h-0 min-w-0 overflow-hidden"
          style={{ height: timelineHeight }}
        >
          <Timeline />
        </div>
      </div>

      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} />
      <VideoOnboardingTour />
    </div>
  )
}
