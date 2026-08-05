'use client'

import { useCallback, useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import { useClipInteraction } from '@/hooks/video/use-clip-interaction'
import { useLayerSnap } from '@/hooks/editor/use-layer-snap'
import { LayerTransformHandles } from '@/components/editor/layer-transform-handles'
import {
  getClipHeightPercent,
  resolveClipTransform,
} from '@/lib/video/clip-transform'
import { useVideoEditorStore } from '@/lib/video/store'
import type { ClipId, ClipTransform } from '@socialista/types'
import type { Corner } from '@/hooks/editor/use-drag-resize'

type ClipInteractionLayerProps = {
  clipId: ClipId
  artboardRef: RefObject<HTMLDivElement | null>
  canvasWidth: number
  canvasHeight: number
  mediaWidth: number
  mediaHeight: number
}

export function ClipInteractionLayer({
  clipId,
  artboardRef,
  canvasWidth,
  canvasHeight,
  mediaWidth,
  mediaHeight,
}: ClipInteractionLayerProps) {
  const clip = useVideoEditorStore(s => s.project.clips[clipId])
  const updateClipTransform = useVideoEditorStore(s => s.updateClipTransform)
  const updateClipTransformLive = useVideoEditorStore(s => s.updateClipTransformLive)
  const canvasSnapEnabled = useVideoEditorStore(s => s.canvasSnapEnabled)

  const baseTransform = useMemo(() => {
    if (!clip || clip.type === 'audio') return null
    return resolveClipTransform(clip, canvasWidth, canvasHeight, mediaWidth, mediaHeight)
  }, [clip, canvasWidth, canvasHeight, mediaWidth, mediaHeight])

  const ensureTransform = useCallback(
    (partial: Partial<ClipTransform>) => {
      if (!clip || clip.type === 'audio' || !baseTransform) return
      const seed = clip.transform ?? baseTransform
      updateClipTransform(clipId, { ...seed, ...partial })
    },
    [baseTransform, clip, clipId, updateClipTransform],
  )

  const ensureTransformLive = useCallback(
    (partial: Partial<ClipTransform>) => {
      if (!clip || clip.type === 'audio' || !baseTransform) return
      // Live updates may already include the full transform from the interaction draft.
      const seed = clip.transform ?? baseTransform
      updateClipTransformLive(clipId, {
        x: partial.x ?? seed.x,
        y: partial.y ?? seed.y,
        width: partial.width ?? seed.width,
        rotation: partial.rotation ?? seed.rotation,
      })
    },
    [baseTransform, clip, clipId, updateClipTransformLive],
  )

  if (!clip || clip.type === 'audio' || !baseTransform) return null

  const mediaAspect = mediaWidth > 0 && mediaHeight > 0 ? mediaWidth / mediaHeight : 1
  const transform = clip.transform ?? baseTransform
  const heightPct = getClipHeightPercent(transform, canvasWidth, canvasHeight, mediaWidth, mediaHeight)

  return (
    <ClipInteractionBox
      transform={transform}
      heightPct={heightPct}
      mediaAspect={mediaAspect}
      canvasWidth={canvasWidth}
      canvasHeight={canvasHeight}
      mediaWidth={mediaWidth}
      mediaHeight={mediaHeight}
      artboardRef={artboardRef}
      onCommit={ensureTransform}
      onLiveUpdate={ensureTransformLive}
      snapEnabled={canvasSnapEnabled}
    />
  )
}

function ClipInteractionBox({
  transform,
  heightPct,
  mediaAspect,
  canvasWidth,
  canvasHeight,
  mediaWidth,
  mediaHeight,
  artboardRef,
  onCommit,
  onLiveUpdate,
  snapEnabled,
}: {
  transform: ClipTransform
  heightPct: number
  mediaAspect: number
  canvasWidth: number
  canvasHeight: number
  mediaWidth: number
  mediaHeight: number
  artboardRef: RefObject<HTMLElement | null>
  onCommit: (partial: Partial<ClipTransform>) => void
  onLiveUpdate: (partial: Partial<ClipTransform>) => void
  snapEnabled: boolean
}) {
  const layerRef = useRef<HTMLDivElement>(null)
  const snap = useLayerSnap({ others: [], enabled: snapEnabled })

  const { draft, beginDrag, beginResize, beginRotate } = useClipInteraction({
    transform,
    heightPct,
    mediaAspect,
    canvasRef: artboardRef,
    onCommit,
    onLiveUpdate,
    snapTargets: snap.snapTargets,
    onGuidesChange: snap.onGuidesChange,
    snapEnabled,
  })

  const effective = draft ? { ...transform, ...draft } : transform
  const effectiveHeight = getClipHeightPercent(
    effective,
    canvasWidth,
    canvasHeight,
    mediaWidth,
    mediaHeight,
  )

  const handleCornerResize = (corner: Corner) => beginResize(corner)

  return (
    <div
      ref={layerRef}
      className="absolute z-[25] touch-none"
      style={{
        left: `${effective.x}%`,
        top: `${effective.y}%`,
        width: `${effective.width}%`,
        height: `${effectiveHeight}%`,
        transform: `rotate(${effective.rotation}deg)`,
        transformOrigin: 'center center',
      }}
    >
      {/* Drag surface — keep below handles so corner resize stays easy to grab */}
      <div
        className="absolute inset-0 cursor-move"
        onPointerDown={beginDrag}
      />
      <LayerTransformHandles onResize={handleCornerResize} onRotate={beginRotate} />
    </div>
  )
}
