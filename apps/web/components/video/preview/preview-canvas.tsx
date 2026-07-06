'use client'

import { useCallback, useEffect, useMemo, useRef, type RefObject } from 'react'
import { useCanvasWorkspaceSize } from '@/components/carousel/canvas-workspace-context'
import { seekPreview } from '@/hooks/video/use-playback'
import { fitVideoPreviewInWorkspace } from '@/lib/carousel/canvas-viewport'
import { pickActiveVideoClip } from '@/lib/video/active-clip'
import { useVideoEditorStore } from '@/lib/video/store'
import { isMediaAssetAvailable } from '@/lib/video/types'
import { cn } from '@/lib/utils'
import { FilmIcon, Loader2Icon } from 'lucide-react'
import { SafeZoneOverlay, isVerticalReelsFormat } from './safe-zone-overlay'
import { SelectedClipActionBar } from '../timeline/selected-clip-action-bar'
import { TextOverlayRenderer } from './text-overlay-renderer'

type PreviewCanvasProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>
  previewZoom: number
  showSafeZone: boolean
  isBuffering?: boolean
}

function PreviewEmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
      <FilmIcon className="size-8 text-muted-foreground/50" strokeWidth={1.5} />
      <p className="text-sm font-medium text-muted-foreground">Import media to preview</p>
      <p className="max-w-xs text-xs text-muted-foreground/80">
        Add videos or images from the left panel. Clips appear here once placed on the timeline.
      </p>
    </div>
  )
}

export function PreviewCanvas({
  canvasRef,
  previewZoom,
  showSafeZone,
  isBuffering = false,
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
  const formatPresetId = useVideoEditorStore(s => s.formatPresetId)
  const isReelsFormat = isVerticalReelsFormat(resolution.width, resolution.height)
  const showReelsSafeZone = showSafeZone && isReelsFormat
  const zoom = Math.max(previewZoom, 0.01)

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

    return fitVideoPreviewInWorkspace(
      workspaceSize.width,
      workspaceSize.height,
      resolution.width,
      resolution.height,
    )
  }, [workspaceSize.width, workspaceSize.height, resolution.width, resolution.height])

  const baseWidth = baseSize.width
  const baseHeight = baseSize.height
  const visualWidth = Math.round(baseWidth * zoom)
  const visualHeight = Math.round(baseHeight * zoom)
  const isMeasured = baseWidth > 0 && baseHeight > 0
  const scale = isMeasured ? visualWidth / resolution.width : 0

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
    return <PreviewEmptyState />
  }

  return (
    <div className="video-editor-preview-scroll h-full min-h-0 w-full overflow-auto overscroll-contain">
      <div className="flex min-h-full min-w-full items-center justify-center p-8">
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
              'relative overflow-hidden rounded-lg bg-black shadow-md',
              isActiveClipSelected
                ? 'ring-2 ring-primary/25'
                : 'ring-1 ring-border/40',
            )}
            style={{
              width: isMeasured ? baseWidth : undefined,
              height: isMeasured ? baseHeight : undefined,
              transform: isMeasured && zoom !== 1 ? `scale(${zoom})` : undefined,
              transformOrigin: 'top left',
            }}
          >
            <canvas
              ref={canvasRef}
              className="pointer-events-none block"
              style={isMeasured ? { width: baseWidth, height: baseHeight } : undefined}
            />
            <TextOverlayRenderer
              artboardRef={artboardRef}
              scale={scale}
              canSelectClip={canSelectClip}
              onBackgroundPointerDown={handleCanvasPointerDown}
            />
            <SafeZoneOverlay
              visible={showReelsSafeZone}
              canvasWidth={resolution.width}
              canvasHeight={resolution.height}
              formatId={formatPresetId}
            />
            {isActiveClipSelected && activeClip ? (
              <SelectedClipActionBar clipId={activeClip.id} variant="floating" />
            ) : null}
            {isBuffering && isPlaying ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
                <Loader2Icon className="size-6 animate-spin text-white/70" aria-hidden />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
