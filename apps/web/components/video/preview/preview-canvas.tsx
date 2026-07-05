'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CanvasWorkspaceProvider, useCanvasWorkspaceSize } from '@/components/carousel/canvas-workspace-context'
import { fitArtboardInWorkspace } from '@/lib/carousel/canvas-viewport'
import { pickActiveVideoClip } from '@/lib/video/active-clip'
import { useVideoEditorStore } from '@/lib/video/store'
import { isMediaAssetAvailable } from '@/lib/video/types'
import { usePlayback } from '@/hooks/video/use-playback'
import { TextOverlayRenderer } from './text-overlay-renderer'
import { PreviewControls } from './preview-controls'
import { VideoZoomControls } from './video-zoom-controls'
import { SafeZoneOverlay, isVerticalReelsFormat } from './safe-zone-overlay'
import { VideoResolutionBadge } from '@/components/video/video-format-selector'
import { FilmIcon, SparklesIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function PreviewCanvas() {
  const workspaceRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const artboardRef = useRef<HTMLDivElement>(null)
  const resolution = useVideoEditorStore(s => s.project.resolution)
  const duration = useVideoEditorStore(s => s.project.duration)
  const playhead = useVideoEditorStore(s => s.playhead)
  const isPlaying = useVideoEditorStore(s => s.isPlaying)
  const tracks = useVideoEditorStore(s => s.project.tracks)
  const clips = useVideoEditorStore(s => s.project.clips)
  const assets = useVideoEditorStore(s => s.assets)
  const selectedClipId = useVideoEditorStore(s => s.selectedClipId)
  const selectClip = useVideoEditorStore(s => s.selectClip)
  const selectOverlay = useVideoEditorStore(s => s.selectOverlay)
  const [previewZoom, setPreviewZoom] = useState(1)
  const [showSafeZone, setShowSafeZone] = useState(true)
  const playback = usePlayback(canvasRef)

  const isEmpty = duration <= 0
  const showReelsSafeZone =
    showSafeZone && isVerticalReelsFormat(resolution.width, resolution.height)

  const activeClip = useMemo(
    () => pickActiveVideoClip(tracks, clips, assets, playhead),
    [tracks, clips, assets, playhead],
  )

  const activeAsset = activeClip ? assets[activeClip.assetId] : undefined
  const canSelectClip = Boolean(
    !isPlaying && activeClip && activeAsset && isMediaAssetAvailable(activeAsset),
  )
  const isActiveClipSelected = canSelectClip && selectedClipId === activeClip?.id

  const handleCanvasPointerDown = useCallback(() => {
    if (isPlaying) return
    selectOverlay(null)
    if (activeClip) {
      selectClip(activeClip.id)
    } else {
      selectClip(null)
    }
  }, [activeClip, isPlaying, selectClip, selectOverlay])

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

          <Artboard
            artboardRef={artboardRef}
            canvasRef={canvasRef}
            resolution={resolution}
            previewZoom={previewZoom}
            isClipSelected={isActiveClipSelected}
            canSelectClip={canSelectClip}
          >
            {scale => (
              <>
                <SafeZoneOverlay visible={showReelsSafeZone && !isEmpty} />
                <TextOverlayRenderer
                  artboardRef={artboardRef}
                  scale={scale}
                  canSelectClip={canSelectClip}
                  onBackgroundPointerDown={handleCanvasPointerDown}
                />
                {canSelectClip && !isActiveClipSelected ? (
                  <div className="pointer-events-none absolute inset-x-0 bottom-3 z-30 flex justify-center px-3">
                    <span className="rounded-full border border-white/15 bg-black/55 px-2.5 py-1 text-[10px] font-medium text-white/90 backdrop-blur-sm">
                      Click to select clip
                    </span>
                  </div>
                ) : null}
                {isActiveClipSelected && activeAsset ? (
                  <div className="pointer-events-none absolute inset-x-0 bottom-3 z-30 flex justify-center px-3">
                    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-primary/30 bg-primary/90 px-2.5 py-1 text-[10px] font-medium text-primary-foreground shadow-sm backdrop-blur-sm">
                      <SparklesIcon className="size-3 shrink-0" />
                      <span className="truncate">{activeAsset.name}</span>
                    </span>
                  </div>
                ) : null}
              </>
            )}
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
  artboardRef,
  canvasRef,
  resolution,
  previewZoom,
  isClipSelected,
  canSelectClip,
  children,
}: {
  artboardRef: React.RefObject<HTMLDivElement | null>
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  resolution: { width: number; height: number }
  previewZoom: number
  isClipSelected: boolean
  canSelectClip: boolean
  children: (scale: number) => React.ReactNode
}) {
  const size = useCanvasWorkspaceSize()
  const fitted = fitArtboardInWorkspace(size.width, size.height, resolution.width, resolution.height)
  const scaled = {
    width: Math.round(fitted.width * previewZoom),
    height: Math.round(fitted.height * previewZoom),
  }
  const scale = scaled.width / resolution.width

  return (
    <div
      ref={artboardRef}
      className={cn(
        'relative bg-black shadow-xl transition-shadow',
        canSelectClip && 'ring-1 ring-white/10',
        isClipSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
      )}
      style={{ width: scaled.width, height: scaled.height }}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ imageRendering: 'auto' }}
      />
      {children(scale)}
    </div>
  )
}
