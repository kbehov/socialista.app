'use client'

import { useCallback, useMemo } from 'react'
import type { RefObject } from 'react'
import { useClipInteraction } from '@/hooks/video/use-clip-interaction'
import {
  getClipHeightPercent,
  resolveClipTransform,
} from '@/lib/video/clip-transform'
import { useVideoEditorStore } from '@/lib/video/store'
import type { ClipId, ClipTransform } from '@socialista/types'
import { cn } from '@/lib/utils'

type ClipInteractionLayerProps = {
  clipId: ClipId
  artboardRef: RefObject<HTMLDivElement | null>
  canvasWidth: number
  canvasHeight: number
  mediaWidth: number
  mediaHeight: number
}

const HANDLES = [
  { handle: 'nw' as const, className: 'left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize' },
  { handle: 'n' as const, className: 'left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize' },
  { handle: 'ne' as const, className: 'right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize' },
  { handle: 'e' as const, className: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2 cursor-ew-resize' },
  { handle: 'se' as const, className: 'right-0 bottom-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize' },
  { handle: 's' as const, className: 'left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-ns-resize' },
  { handle: 'sw' as const, className: 'left-0 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize' },
  { handle: 'w' as const, className: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize' },
]

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
      const seed = clip.transform ?? baseTransform
      updateClipTransformLive(clipId, { ...seed, ...partial })
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
}) {
  const { draft, beginDrag, beginResize, beginRotate } = useClipInteraction({
    transform,
    heightPct,
    mediaAspect,
    canvasRef: artboardRef,
    onCommit,
    onLiveUpdate,
  })

  const effective = draft ? { ...transform, ...draft } : transform
  const effectiveHeight = getClipHeightPercent(
    effective,
    canvasWidth,
    canvasHeight,
    mediaWidth,
    mediaHeight,
  )

  return (
    <div
      className="absolute z-[25] cursor-move"
      style={{
        left: `${effective.x}%`,
        top: `${effective.y}%`,
        width: `${effective.width}%`,
        height: `${effectiveHeight}%`,
        transform: `rotate(${effective.rotation}deg)`,
        transformOrigin: 'center center',
      }}
      onPointerDown={beginDrag}
    >
      <div className="pointer-events-none absolute inset-0 border border-dashed border-primary/80" />
      {HANDLES.map(({ handle, className }) => (
        <Handle key={handle} className={className} onPointerDown={beginResize(handle)} />
      ))}
      <Handle
        className="left-1/2 -top-4 -translate-x-1/2 cursor-grab"
        onPointerDown={beginRotate}
      />
    </div>
  )
}

function Handle({
  className,
  onPointerDown,
}: {
  className: string
  onPointerDown: (e: React.PointerEvent) => void
}) {
  return (
    <div
      onPointerDown={onPointerDown}
      className={cn(
        'absolute z-10 h-3 w-3 rounded-full border-2 border-primary bg-background shadow-sm',
        className,
      )}
    />
  )
}
