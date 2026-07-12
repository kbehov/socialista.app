'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { useCanvasWorkspaceSize } from '@/components/carousel/canvas-workspace-context'
import { seekPreview } from '@/hooks/video/use-playback'
import { fitVideoPreviewInWorkspace } from '@/lib/carousel/canvas-viewport'
import { pickActiveVideoClip } from '@/lib/video/active-clip'
import { hitTestOverlayAt, pointerToCanvasPercent } from '@/lib/video/canvas-hit-test'
import { useVideoEditorStore } from '@/lib/video/store'
import { isMediaAssetAvailable } from '@/lib/video/types'
import { cn } from '@/lib/utils'
import { FilmIcon, Loader2Icon } from 'lucide-react'
import { SelectedClipActionBar } from '../timeline/selected-clip-action-bar'
import { TextOverlayRenderer } from './text-overlay-renderer'
import { ClipInteractionLayer } from './clip-interaction-layer'
import {
  CanvasElementContextMenu,
  type CanvasContextTarget,
} from './element-context-menu'
import { SelectedOverlayActionBar } from './selected-overlay-action-bar'

type PreviewCanvasProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>
  previewZoom: number
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
  const selectedOverlayId = useVideoEditorStore(s => s.selectedOverlayId)
  const textOverlays = useVideoEditorStore(s => s.project.textOverlays)
  const selectClip = useVideoEditorStore(s => s.selectClip)
  const selectOverlay = useVideoEditorStore(s => s.selectOverlay)
  const workspaceSize = useCanvasWorkspaceSize()
  const [contextTarget, setContextTarget] = useState<CanvasContextTarget | null>(null)
  const [editOverlayRequestId, setEditOverlayRequestId] = useState<string | null>(null)

  const isEmpty = duration <= 0
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
  const isOverlaySelected = Boolean(selectedOverlayId && !isPlaying)

  const handleContextMenuResolve = useCallback(
    (e: React.MouseEvent): CanvasContextTarget => {
      const rect = artboardRef.current?.getBoundingClientRect()
      if (!rect) return { kind: 'empty' }

      const { x, y } = pointerToCanvasPercent(e.clientX, e.clientY, rect)
      const hitOverlay = hitTestOverlayAt(textOverlays, playhead, x, y)
      if (hitOverlay) {
        selectOverlay(hitOverlay.id)
        return { kind: 'overlay', overlayId: hitOverlay.id }
      }

      if (activeClip) {
        selectClip(activeClip.id)
        return { kind: 'clip', clipId: activeClip.id }
      }

      return { kind: 'empty' }
    },
    [activeClip, playhead, selectClip, selectOverlay, textOverlays],
  )

  const mediaWidth = activeAsset?.width ?? (activeClip?.type === 'image' ? 1080 : 1920)
  const mediaHeight = activeAsset?.height ?? (activeClip?.type === 'image' ? 1080 : 1080)

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
  const artboardFrameInset = 8
  const visualWidth = Math.round(baseWidth * zoom) + artboardFrameInset
  const showCanvasActions = isActiveClipSelected || isOverlaySelected
  const isMeasured = baseWidth > 0 && baseHeight > 0
  const scale = isMeasured ? (baseWidth * zoom) / resolution.width : 0

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
      <div className="box-border flex h-full w-max min-w-full items-center justify-center p-4">
        <div
          className={cn('relative flex w-auto shrink-0 flex-col items-center gap-2', !isMeasured && 'invisible')}
        >
          <div style={{ width: isMeasured ? visualWidth : undefined }}>
            <CanvasElementContextMenu
              target={contextTarget}
              onTargetChange={setContextTarget}
              onContextMenuResolve={handleContextMenuResolve}
              onEditOverlay={id => {
                selectOverlay(id)
                setEditOverlayRequestId(id)
              }}
            >
              <div
                className={cn(
                  'rounded-xl bg-background/80 p-1 shadow-lg ring-1 ring-border/50 backdrop-blur-[2px]',
                  showCanvasActions ? 'ring-primary/35' : undefined,
                )}
              >
                <div
                  className="relative"
                  style={
                    isMeasured
                      ? {
                          width: Math.round(baseWidth * zoom),
                          height: Math.round(baseHeight * zoom),
                        }
                      : undefined
                  }
                >
                  <div
                    ref={artboardRef}
                    data-video-canvas
                    className={cn(
                      'absolute left-0 top-0 overflow-hidden rounded-lg bg-black shadow-[0_12px_40px_-12px_rgba(0,0,0,0.55)]',
                      showCanvasActions ? 'ring-2 ring-primary/40' : 'ring-1 ring-black/20',
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
                    editRequestId={editOverlayRequestId}
                    onEditRequestHandled={() => setEditOverlayRequestId(null)}
                  />
                  {isActiveClipSelected && activeClip ? (
                    <ClipInteractionLayer
                      clipId={activeClip.id}
                      artboardRef={artboardRef}
                      canvasWidth={resolution.width}
                      canvasHeight={resolution.height}
                      mediaWidth={mediaWidth}
                      mediaHeight={mediaHeight}
                    />
                  ) : null}
                  {isBuffering && isPlaying ? (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
                      <Loader2Icon className="size-6 animate-spin text-white/70" aria-hidden />
                    </div>
                  ) : null}
                  </div>
                </div>
              </div>
            </CanvasElementContextMenu>
          </div>

          {isActiveClipSelected && activeClip ? (
            <SelectedClipActionBar clipId={activeClip.id} variant="floating" />
          ) : null}
          {isOverlaySelected && selectedOverlayId ? (
            <SelectedOverlayActionBar
              overlayId={selectedOverlayId}
              variant="floating"
              onEditText={() => setEditOverlayRequestId(selectedOverlayId)}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}
