'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { useCanvasWorkspaceSize } from '@/components/carousel/canvas-workspace-context'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { seekPreview } from '@/hooks/video/use-playback'
import { fitVideoPreviewInWorkspace } from '@/lib/carousel/canvas-viewport'
import { pickActiveVideoClip } from '@/lib/video/active-clip'
import { hitTestOverlayAt, pointerToCanvasPercent } from '@/lib/video/canvas-hit-test'
import { browseVideoFiles, focusVideoUrlImport } from '@/lib/video/editor-events'
import { useVideoEditorStore } from '@/lib/video/store'
import { isMediaAssetAvailable } from '@/lib/video/types'
import { cn } from '@/lib/utils'
import { FilmIcon, FolderOpenIcon, LinkIcon, Loader2Icon } from 'lucide-react'
import { TextOverlayRenderer } from './text-overlay-renderer'
import { ClipInteractionLayer } from './clip-interaction-layer'
import {
  CanvasElementContextMenu,
  type CanvasContextTarget,
} from './element-context-menu'
import { SelectionToolbar } from './selection-toolbar'
import { SafeZoneOverlay } from './safe-zone-overlay'
import { VideoZoomControls } from './video-zoom-controls'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ScanIcon } from 'lucide-react'

type PreviewCanvasProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>
  previewZoom: number
  onPreviewZoomChange: (zoom: number) => void
  isBuffering?: boolean
}

function PreviewEmptyState() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="flex w-full max-w-sm flex-col gap-3 rounded-2xl border border-border/60 bg-background/95 p-4 shadow-lg backdrop-blur-sm">
        <div className="flex size-10 items-center justify-center rounded-xl border border-border/50 bg-muted/30">
          <FilmIcon className="size-5 text-muted-foreground/70" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-sm font-medium tracking-tight text-foreground">Drop media to start</p>
          <p className="mt-1 text-[11px] leading-[1.45] text-muted-foreground">
            Browse files from the Media panel, import a link, or drag clips onto the timeline.
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Button
            type="button"
            size="sm"
            className="video-studio-press w-full justify-start"
            onClick={() => browseVideoFiles()}
          >
            <FolderOpenIcon className="size-3.5" />
            Browse files
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="video-studio-press w-full justify-start"
            onClick={() => focusVideoUrlImport()}
          >
            <LinkIcon className="size-3.5" />
            Import from URL
          </Button>
        </div>
        <p className="text-center text-[11px] leading-[1.45] text-muted-foreground">
          Press <Kbd className="mx-0.5">?</Kbd> anytime for shortcuts
        </p>
      </div>
    </div>
  )
}

export function PreviewCanvas({
  canvasRef,
  previewZoom,
  onPreviewZoomChange,
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
  const showSafeZones = useVideoEditorStore(s => s.showSafeZones)
  const setShowSafeZones = useVideoEditorStore(s => s.setShowSafeZones)
  const workspaceSize = useCanvasWorkspaceSize()
  const [contextTarget, setContextTarget] = useState<CanvasContextTarget | null>(null)
  const [editOverlayRequestId, setEditOverlayRequestId] = useState<string | null>(null)
  const pendingOverlayEditId = useVideoEditorStore(s => s.pendingOverlayEditId)
  const requestOverlayEdit = useVideoEditorStore(s => s.requestOverlayEdit)

  const activeEditOverlayId = editOverlayRequestId ?? pendingOverlayEditId

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
    <div className="relative h-full min-h-0 w-full">
      <div className="video-editor-preview-scroll h-full min-h-0 w-full overflow-auto overscroll-contain">
        <div className="box-border flex h-full w-max min-w-full items-center justify-center p-4 pb-14">
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
                        editRequestId={activeEditOverlayId}
                        onEditRequestHandled={() => {
                          setEditOverlayRequestId(null)
                          requestOverlayEdit(null)
                        }}
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
                      <SafeZoneOverlay />
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

            <SelectionToolbar
              onEditOverlayText={id => {
                setEditOverlayRequestId(id)
                requestOverlayEdit(id)
              }}
            />
          </div>
        </div>
      </div>

      <div
        data-canvas-controls
        className="pointer-events-none absolute bottom-3 right-3 z-10 flex items-center gap-1.5"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              className={cn(
                'video-studio-glass video-studio-press pointer-events-auto size-8 rounded-full shadow-sm',
                showSafeZones && 'bg-primary/15 text-primary',
              )}
              onClick={() => setShowSafeZones(!showSafeZones)}
              aria-pressed={showSafeZones}
              aria-label={showSafeZones ? 'Hide safe zones' : 'Show safe zones'}
            >
              <ScanIcon className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{showSafeZones ? 'Hide safe zones' : 'Safe zones'}</TooltipContent>
        </Tooltip>

        <VideoZoomControls
          zoom={previewZoom}
          onZoomChange={onPreviewZoomChange}
          className="video-studio-glass pointer-events-auto shadow-sm"
        />
      </div>
    </div>
  )
}
