'use client'

import { useEffect, useRef, useState } from 'react'
import { CanvasWorkspaceProvider, useCanvasWorkspaceSize } from '@/components/carousel/canvas-workspace-context'
import { fitArtboardInWorkspace } from '@/lib/carousel/canvas-viewport'
import { useVideoEditorStore } from '@/lib/video/store'
import { usePlayback } from '@/hooks/video/use-playback'
import { TextOverlayRenderer } from './text-overlay-renderer'
import { PreviewControls } from './preview-controls'
import { VideoZoomControls } from './video-zoom-controls'
import { SafeZoneOverlay, isVerticalReelsFormat } from './safe-zone-overlay'
import { VideoResolutionBadge } from '@/components/video/video-format-selector'
import { FilmIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function PreviewCanvas() {
  const workspaceRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const resolution = useVideoEditorStore(s => s.project.resolution)
  const duration = useVideoEditorStore(s => s.project.duration)
  const [previewZoom, setPreviewZoom] = useState(1)
  const [showSafeZone, setShowSafeZone] = useState(true)
  const playback = usePlayback(canvasRef)

  const isEmpty = duration <= 0
  const showReelsSafeZone =
    showSafeZone && isVerticalReelsFormat(resolution.width, resolution.height)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = resolution.width
    canvas.height = resolution.height
  }, [resolution.width, resolution.height])

  return (
    <CanvasWorkspaceProvider workspaceRef={workspaceRef}>
      <div className="flex h-full flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <VideoResolutionBadge />
          {isVerticalReelsFormat(resolution.width, resolution.height) ? (
            <Button
              type="button"
              size="sm"
              variant={showSafeZone ? 'secondary' : 'ghost'}
              className="h-7 text-[11px]"
              onClick={() => setShowSafeZone(v => !v)}
            >
              Safe zone
            </Button>
          ) : null}
        </div>

        <div
          ref={workspaceRef}
          className={cn(
            'studio-canvas-workspace relative flex flex-1 items-center justify-center overflow-hidden rounded-md',
          )}
        >
          {isEmpty ? (
            <div className="absolute inset-0 z-20 flex items-center justify-center p-6">
              <div className="max-w-xs rounded-xl border bg-card/95 p-6 text-center shadow-lg backdrop-blur-sm">
                <FilmIcon className="mx-auto size-8 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium">Import media to start</p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                  Use the panel on the left to import files, paste a URL, or pull a TikTok video. Clips are added at the playhead.
                </p>
              </div>
            </div>
          ) : null}

          <Artboard canvasRef={canvasRef} resolution={resolution} previewZoom={previewZoom}>
            <SafeZoneOverlay visible={showReelsSafeZone && !isEmpty} />
            <TextOverlayRenderer canvasRef={canvasRef} />
          </Artboard>
        </div>

        <div className="flex items-center justify-between gap-3">
          <PreviewControls playback={playback} />
          <VideoZoomControls zoom={previewZoom} onZoomChange={setPreviewZoom} />
        </div>
      </div>
    </CanvasWorkspaceProvider>
  )
}

function Artboard({
  canvasRef,
  resolution,
  previewZoom,
  children,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  resolution: { width: number; height: number }
  previewZoom: number
  children?: React.ReactNode
}) {
  const size = useCanvasWorkspaceSize()
  const fitted = fitArtboardInWorkspace(size.width, size.height, resolution.width, resolution.height)
  const scaled = {
    width: Math.round(fitted.width * previewZoom),
    height: Math.round(fitted.height * previewZoom),
  }
  return (
    <div
      className="relative bg-black shadow-xl"
      style={{ width: scaled.width, height: scaled.height }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ imageRendering: 'auto' }}
      />
      {children}
    </div>
  )
}
