'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { useCanvasWorkspaceSize } from '@/components/editor/canvas-workspace-context'
import { CanvasGuidesProvider } from '@/components/editor/canvas-guides'
import { CanvasRulers, CANVAS_RULER_SIZE } from '@/components/editor/canvas-rulers'
import { CanvasZoomControls } from '@/components/editor/canvas-zoom-controls'
import { AlignmentToolbar, type AlignmentAction } from '@/components/editor/alignment-toolbar'
import { Button } from '@/components/ui/button'
import { VideoCanvasViewMenu } from '@/components/video/preview/video-canvas-view-menu'
import { seekPreview } from '@/hooks/video/use-playback'
import { openVideoStudioPanel } from '@/lib/video/editor-events'
import { fitVideoPreviewInWorkspace } from '@/lib/editor/canvas-viewport'
import { pickActiveVideoClip } from '@/lib/video/active-clip'
import { hitTestOverlayAt, pointerToCanvasPercent } from '@/lib/video/canvas-hit-test'
import { measureOverlayHeightPct } from '@/lib/video/overlay-bounds'
import { useVideoEditorStore } from '@/lib/video/store'
import { isMediaAssetAvailable } from '@/lib/video/types'
import type { SnapGuide } from '@/lib/editor/snap-guides'
import { cn } from '@/lib/utils'
import { Loader2Icon } from 'lucide-react'
import { TextOverlayRenderer } from './text-overlay-renderer'
import { ClipInteractionLayer } from './clip-interaction-layer'
import {
  CanvasElementContextMenu,
  type CanvasContextTarget,
} from './element-context-menu'
import { SelectionToolbar } from './selection-toolbar'
import { SafeZoneOverlay } from './safe-zone-overlay'

type PreviewCanvasProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>
  previewZoom: number
  onPreviewZoomChange: (zoom: number) => void
  isBuffering?: boolean
}

export function PreviewCanvas({
  canvasRef,
  previewZoom,
  onPreviewZoomChange,
  isBuffering = false,
}: PreviewCanvasProps) {
  const artboardRef = useRef<HTMLDivElement>(null)
  const resolution = useVideoEditorStore(s => s.project.resolution)
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
  const showRulers = useVideoEditorStore(s => s.showRulers)
  const showGuides = useVideoEditorStore(s => s.showGuides)
  const duration = useVideoEditorStore(s => s.project.duration)
  const workspaceSize = useCanvasWorkspaceSize()
  const [contextTarget, setContextTarget] = useState<CanvasContextTarget | null>(null)
  const [editOverlayRequestId, setEditOverlayRequestId] = useState<string | null>(null)
  const pendingOverlayEditId = useVideoEditorStore(s => s.pendingOverlayEditId)
  const requestOverlayEdit = useVideoEditorStore(s => s.requestOverlayEdit)

  const activeEditOverlayId = editOverlayRequestId ?? pendingOverlayEditId

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
  const showSelectionChrome = isActiveClipSelected || isOverlaySelected
  const showAlignmentBar = showSelectionChrome && !isPlaying
  const isEmptyProject = duration <= 0 && Object.keys(clips).length === 0

  const centerGuides = useMemo<SnapGuide[]>(() => {
    if (!showGuides) return []
    return [
      { orientation: 'vertical', position: 50 },
      { orientation: 'horizontal', position: 50 },
    ]
  }, [showGuides])

  const handleAlign = useCallback((action: AlignmentAction) => {
    if (action.type === 'distribute') return

    const state = useVideoEditorStore.getState()
    const overlayId = state.selectedOverlayId

    if (overlayId) {
      const heightPct = measureOverlayHeightPct(artboardRef.current, overlayId) ?? undefined
      if (action.type === 'center') state.alignOverlayCenter(overlayId, action.axis, heightPct)
      else state.alignOverlayEdge(overlayId, action.edge, heightPct)
      return
    }

    const clipId = state.selectedClipId ?? activeClip?.id ?? null
    if (!clipId) return

    if (!state.selectedClipId) state.selectClip(clipId)
    if (action.type === 'center') state.centerClipOnCanvas(clipId, action.axis)
    else state.alignClipEdge(clipId, action.edge)
  }, [activeClip])

  const canAlign = Boolean(selectedOverlayId || selectedClipId || canSelectClip)

  /** Empty artboard click selects the active background clip (unless hitting a text layer). */
  const handleCanvasPointerDown = useCallback(() => {
    if (isPlaying) return
    if (activeClip && canSelectClip) {
      selectClip(activeClip.id)
      return
    }
    selectOverlay(null)
    selectClip(null)
  }, [activeClip, canSelectClip, isPlaying, selectClip, selectOverlay])

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
      { reserveToolbarChrome: true, rulerGutter: showRulers ? CANVAS_RULER_SIZE : 0 },
    )
  }, [
    workspaceSize.width,
    workspaceSize.height,
    resolution.width,
    resolution.height,
    showRulers,
  ])

  const baseWidth = baseSize.width
  const baseHeight = baseSize.height
  const isMeasured = baseWidth > 0 && baseHeight > 0
  const scale = isMeasured ? (baseWidth * zoom) / resolution.width : 0
  const displayWidth = isMeasured ? Math.round(baseWidth * zoom) : 0
  const displayHeight = isMeasured ? Math.round(baseHeight * zoom) : 0
  const rulerGutter = showRulers ? CANVAS_RULER_SIZE : 0
  const stageWidth = isMeasured ? displayWidth + rulerGutter : 0
  const stageHeight = isMeasured ? displayHeight + rulerGutter : 0

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = resolution.width
    canvas.height = resolution.height
    seekPreview(useVideoEditorStore.getState().playhead)
  }, [canvasRef, resolution.width, resolution.height])

  return (
    <div className="relative h-full min-h-0 w-full">
      {/* Floating chrome — outside scroll so it never crops */}
      {showAlignmentBar ? (
        <div className="pointer-events-none absolute inset-x-0 top-2.5 z-30 flex justify-center px-3">
          <div
            className="pointer-events-auto flex max-w-full items-center gap-1.5 overflow-x-auto"
            onPointerDown={e => e.stopPropagation()}
          >
            <AlignmentToolbar
              onAlign={canAlign ? handleAlign : undefined}
              showDistribute={false}
              showToggles={false}
              size="xs"
              variant="floating"
              className="video-studio-glass shadow-none"
            />
          </div>
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 bottom-12 z-30 flex justify-center px-3">
        <SelectionToolbar
          onEditOverlayText={id => {
            setEditOverlayRequestId(id)
            requestOverlayEdit(id)
          }}
        />
      </div>

      <div className="video-editor-preview-scroll h-full min-h-0 w-full overflow-auto overscroll-contain">
        <div className="box-border flex h-full w-max min-w-full items-center justify-center px-3 pb-12 pt-14">
          <div
            className={cn('relative shrink-0', !isMeasured && 'invisible')}
            style={
              isMeasured
                ? {
                    width: stageWidth,
                    height: stageHeight,
                  }
                : undefined
            }
          >
            {showRulers && isMeasured ? (
              <CanvasRulers
                canvasWidth={resolution.width}
                canvasHeight={resolution.height}
                displayWidth={displayWidth}
                displayHeight={displayHeight}
              />
            ) : null}

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
                className="relative"
                style={
                  isMeasured
                    ? {
                        marginLeft: rulerGutter,
                        marginTop: rulerGutter,
                        width: displayWidth,
                        height: displayHeight,
                      }
                    : undefined
                }
              >
                <div
                  ref={artboardRef}
                  data-video-canvas
                  className={cn(
                    'absolute left-0 top-0 rounded-lg bg-black shadow-[0_12px_40px_-12px_rgba(0,0,0,0.55)]',
                    // Keep overflow visible when selected so rotate/resize handles are not clipped
                    showSelectionChrome ? 'overflow-visible ring-2 ring-primary/40' : 'overflow-hidden ring-1 ring-black/20',
                  )}
                  style={{
                    width: isMeasured ? baseWidth : undefined,
                    height: isMeasured ? baseHeight : undefined,
                    transform: isMeasured && zoom !== 1 ? `scale(${zoom})` : undefined,
                    transformOrigin: 'top left',
                  }}
                >
                  <CanvasGuidesProvider persistentGuides={centerGuides}>
                    <canvas
                      ref={canvasRef}
                      className="pointer-events-none block"
                      style={isMeasured ? { width: baseWidth, height: baseHeight } : undefined}
                    />
                    <TextOverlayRenderer
                      artboardRef={artboardRef}
                      scale={scale}
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
                    {isEmptyProject && !isPlaying ? (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="video-studio-press pointer-events-auto h-8 bg-white/10 text-[12px] font-medium text-white hover:bg-white/15"
                          onPointerDown={e => e.stopPropagation()}
                          onClick={() => openVideoStudioPanel('media')}
                        >
                          Add media
                        </Button>
                      </div>
                    ) : null}
                    {isBuffering && isPlaying ? (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
                        <Loader2Icon className="size-6 animate-spin text-white/70" aria-hidden />
                      </div>
                    ) : null}
                  </CanvasGuidesProvider>
                </div>
              </div>
            </CanvasElementContextMenu>
          </div>
        </div>
      </div>

      <div
        data-canvas-controls
        className="pointer-events-none absolute bottom-3 right-3 z-40 flex items-center gap-1.5"
      >
        <CanvasZoomControls
          zoom={previewZoom}
          onZoomChange={onPreviewZoomChange}
          className="video-studio-glass pointer-events-auto shadow-none"
          trailing={<VideoCanvasViewMenu />}
        />
      </div>
    </div>
  )
}
