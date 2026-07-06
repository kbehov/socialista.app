'use client'

import { useCallback, useEffect, useMemo, useRef, type RefObject } from 'react'
import { useCanvasWorkspaceSize } from '@/components/carousel/canvas-workspace-context'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { VideoResolutionBadge } from '@/components/video/video-format-selector'
import { seekPreview } from '@/hooks/video/use-playback'
import { fitVideoPreviewInWorkspace } from '@/lib/carousel/canvas-viewport'
import { pickActiveVideoClip } from '@/lib/video/active-clip'
import { useVideoEditorStore } from '@/lib/video/store'
import { isMediaAssetAvailable } from '@/lib/video/types'
import { cn } from '@/lib/utils'
import { FilmIcon, ShieldCheckIcon } from 'lucide-react'
import { SafeZoneOverlay, isVerticalReelsFormat } from './safe-zone-overlay'
import { TextOverlayRenderer } from './text-overlay-renderer'

/** Horizontal + vertical padding on the preview centering container (`p-1` × 2 sides). */
const PREVIEW_CONTAINER_INSET = 8

type PreviewCanvasProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>
  previewZoom: number
  showSafeZone: boolean
  onToggleSafeZone: () => void
}

function PreviewEmptyState() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="max-w-xs text-center">
        <FilmIcon className="mx-auto size-7 text-muted-foreground/60" strokeWidth={1.5} />
        <p className="mt-3 text-sm font-medium tracking-tight">Import media to preview</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Add videos or images from the left panel. Clips appear here once placed on the timeline.
        </p>
      </div>
    </div>
  )
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
  const isReelsFormat = isVerticalReelsFormat(resolution.width, resolution.height)
  const showReelsSafeZone = showSafeZone && isReelsFormat

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

    const zoom = Math.max(previewZoom, 0.01)

    return fitVideoPreviewInWorkspace(
      Math.max(1, (workspaceSize.width - PREVIEW_CONTAINER_INSET) / zoom),
      Math.max(1, (workspaceSize.height - PREVIEW_CONTAINER_INSET) / zoom),
      resolution.width,
      resolution.height,
    )
  }, [workspaceSize.width, workspaceSize.height, resolution.width, resolution.height, previewZoom])

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
    return <PreviewEmptyState />
  }

  return (
    <div className="flex h-full w-full min-w-0 items-center justify-center overflow-hidden p-1">
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
            'rounded-sm shadow-lg ring-1 ring-inset ring-foreground/10',
            isActiveClipSelected && 'ring-2 ring-inset ring-primary/45',
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
            style={isMeasured ? { width: baseWidth, height: baseHeight } : undefined}
          />
          <TextOverlayRenderer
            artboardRef={artboardRef}
            scale={scale}
            canSelectClip={canSelectClip}
            onBackgroundPointerDown={handleCanvasPointerDown}
          />
          <SafeZoneOverlay visible={showReelsSafeZone} />
        </div>

        <div
          data-canvas-controls
          className="pointer-events-none absolute top-2 right-2 z-40 flex items-center gap-1"
        >
          {isReelsFormat ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  className={cn(
                    'pointer-events-auto size-7 bg-background/80 text-muted-foreground backdrop-blur-sm hover:text-foreground',
                    showSafeZone && 'bg-primary/10 text-primary',
                  )}
                  onPointerDown={e => e.preventDefault()}
                  onClick={e => {
                    e.stopPropagation()
                    onToggleSafeZone()
                  }}
                  aria-pressed={showSafeZone}
                  aria-label={showSafeZone ? 'Hide safe area guides' : 'Show safe area guides'}
                >
                  <ShieldCheckIcon className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[200px]">
                {showSafeZone ? 'Hide safe area guides' : 'Show safe area for Reels & TikTok UI'}
              </TooltipContent>
            </Tooltip>
          ) : null}
          <span className="pointer-events-none rounded-md bg-background/80 px-2 py-1 text-[10px] text-muted-foreground backdrop-blur-sm">
            <VideoResolutionBadge />
          </span>
        </div>
      </div>
    </div>
  )
}
