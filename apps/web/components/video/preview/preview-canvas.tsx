'use client'

import { useCallback, useEffect, useMemo, useRef, type RefObject } from 'react'
import { useCanvasWorkspaceSize } from '@/components/carousel/canvas-workspace-context'
import { fitArtboardInWorkspace } from '@/lib/carousel/canvas-viewport'
import { pickActiveVideoClip } from '@/lib/video/active-clip'
import { useVideoEditorStore } from '@/lib/video/store'
import { isMediaAssetAvailable } from '@/lib/video/types'
import { seekPreview } from '@/hooks/video/use-playback'
import { TextOverlayRenderer } from './text-overlay-renderer'
import { SafeZoneOverlay, isVerticalReelsFormat } from './safe-zone-overlay'
import { VideoResolutionBadge } from '@/components/video/video-format-selector'
import { Button } from '@/components/ui/button'
import { FilmIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type PreviewCanvasProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>
  previewZoom: number
  showSafeZone: boolean
  onToggleSafeZone: () => void
}

export function PreviewCanvas({
  canvasRef,
  previewZoom,
  showSafeZone,
  onToggleSafeZone,
}: PreviewCanvasProps) {
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
  const workspaceSize = useCanvasWorkspaceSize()

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

  const baseSize = useMemo(() => {
    if (workspaceSize.width <= 0 || workspaceSize.height <= 0) {
      return { width: 0, height: 0 }
    }

    return fitArtboardInWorkspace(
      workspaceSize.width,
      workspaceSize.height,
      resolution.width,
      resolution.height,
    )
  }, [workspaceSize.width, workspaceSize.height, resolution.width, resolution.height])

  const baseWidth = baseSize.width
  const baseHeight = baseSize.height
  const visualWidth = Math.round(baseWidth * previewZoom)
  const visualHeight = Math.round(baseHeight * previewZoom)
  const isMeasured = baseWidth > 0 && baseHeight > 0
  const scale = baseWidth > 0 ? baseWidth / resolution.width : 0

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
    seekPreview(useVideoEditorStore.getState().playhead)
  }, [canvasRef, resolution.width, resolution.height])

  if (isEmpty) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
        <div className="max-w-xs rounded-xl border bg-card/95 p-6 shadow-lg backdrop-blur-sm">
          <FilmIcon className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">Import media to start</p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
            Use the panel on the left to import files, paste a URL, or pull a TikTok video. Clips are added at the playhead.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div
        className={cn('relative shrink-0', !isMeasured && 'invisible')}
        style={{
          width: isMeasured ? visualWidth : undefined,
          height: isMeasured ? visualHeight : undefined,
        }}
      >
        <div
          ref={artboardRef}
          data-video-canvas
          className={cn(
            'relative overflow-hidden bg-black',
            'rounded-sm shadow-lg ring-1 ring-black/10',
            isActiveClipSelected && 'ring-2 ring-primary/40',
          )}
          style={{
            width: isMeasured ? baseWidth : undefined,
            height: isMeasured ? baseHeight : undefined,
            transform: isMeasured && previewZoom !== 1 ? `scale(${previewZoom})` : undefined,
            transformOrigin: 'top left',
          }}
        >
          <canvas
            ref={canvasRef}
            className="pointer-events-none block"
            style={
              isMeasured
                ? { width: baseWidth, height: baseHeight }
                : undefined
            }
          />
          <SafeZoneOverlay visible={showReelsSafeZone} />
          <TextOverlayRenderer
            artboardRef={artboardRef}
            scale={scale}
            canSelectClip={canSelectClip}
            onBackgroundPointerDown={handleCanvasPointerDown}
          />
        </div>

        <div className="pointer-events-none absolute top-3 right-3 z-20">
          <span className="pointer-events-auto">
            <VideoResolutionBadge />
          </span>
        </div>

        {isVerticalReelsFormat(resolution.width, resolution.height) ? (
          <div className="pointer-events-none absolute top-3 left-3 z-20">
            <Button
              type="button"
              size="sm"
              variant={showSafeZone ? 'secondary' : 'ghost'}
              className="pointer-events-auto h-7 bg-background/85 text-[11px] shadow-md backdrop-blur-sm"
              onClick={onToggleSafeZone}
            >
              Safe zone
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
