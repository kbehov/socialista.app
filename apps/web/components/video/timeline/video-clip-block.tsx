'use client'

import { useEffect, useRef } from 'react'
import { useVideoEditorStore } from '@/lib/video/store'
import { useDragClip } from '@/hooks/video/use-drag-clip'
import { useTrimHandles } from '@/hooks/video/use-trim-handles'
import { useTimelineFocus } from '@/components/video/timeline/timeline-focus-context'
import { previewTrimWidthPx } from '@/lib/video/trim-preview'
import { cn } from '@/lib/utils'
import type { Track, VideoClip } from '@socialista/types'

type Props = {
  clip: VideoClip
  left: number
  width: number
  height: number
  pxPerSec: number
  track: Track
}

export function VideoClipBlock({ clip, left, width, height, pxPerSec, track }: Props) {
  const selectedClipId = useVideoEditorStore(s => s.selectedClipId)
  const selectClip = useVideoEditorStore(s => s.selectClip)
  const assets = useVideoEditorStore(s => s.assets)
  const { beginDrag, drag } = useDragClip(pxPerSec)
  const { beginTrim, draft, isDragging: isTrimming } = useTrimHandles(pxPerSec)
  const focusAtTime = useTimelineFocus()

  const asset = assets[clip.assetId]
  const thumbnails = asset && 'thumbnails' in asset ? asset.thumbnails : undefined
  const selected = selectedClipId === clip.id
  const isDragging = drag?.clipId === clip.id
  const trimDraft = draft?.clipId === clip.id ? draft : null

  const draftLeft = isDragging ? left + drag.deltaSec * pxPerSec : left
  const draftWidth = trimDraft
    ? previewTrimWidthPx(clip, asset, trimDraft.trimIn, trimDraft.trimOut, pxPerSec)
    : width

  const blockRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!selected || !blockRef.current) return
    blockRef.current.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
  }, [selected])

  return (
    <div
      ref={blockRef}
      data-clip-block
      data-clip-id={clip.id}
      onPointerDown={e => {
        if (track.locked) return
        selectClip(clip.id)
        beginDrag(clip.id, clip.startTime, clip.trackId, e, () => focusAtTime?.(clip.startTime))
      }}
      className={cn(
        'group/clip absolute top-1 overflow-hidden rounded-lg border bg-neutral-800/90 transition-[box-shadow,border-color]',
        isDragging ? 'z-[3] cursor-grabbing shadow-md' : 'cursor-grab',
        selected
          ? 'z-[2] border-primary ring-2 ring-primary/20'
          : 'border-border/50 hover:border-border',
        isTrimming && trimDraft ? 'z-[3]' : null,
      )}
      style={{ left: draftLeft, width: draftWidth, height: height - 8 }}
    >
      <div className="flex h-full w-full">
        {thumbnails && thumbnails.length > 0 ? (
          thumbnails.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className="h-full flex-1 object-cover opacity-90"
              draggable={false}
            />
          ))
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-white/70">
            {asset ? asset.name : 'Missing media'}
          </div>
        )}
      </div>
      <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/55 to-transparent px-1.5 pt-0.5 pb-3">
        <div className="max-w-full truncate text-[10px] font-medium text-white drop-shadow">
          {asset ? asset.name : 'Missing media'}
        </div>
      </div>
      {!track.locked ? (
        <>
          <div
            onPointerDown={e =>
              beginTrim(clip.id, 'in', clip.trimIn, clip.trimOut, clip.duration, e, clip.startTime)
            }
            className={cn(
              'absolute left-0 top-0 h-full w-2.5 cursor-ew-resize transition-opacity',
              selected
                ? 'bg-primary/80 opacity-100 hover:bg-primary'
                : 'bg-white/25 opacity-0 group-hover/clip:opacity-100 hover:bg-white/50',
            )}
            aria-label="Trim start"
          />
          <div
            onPointerDown={e =>
              beginTrim(clip.id, 'out', clip.trimIn, clip.trimOut, clip.duration, e, clip.startTime)
            }
            className={cn(
              'absolute right-0 top-0 h-full w-2.5 cursor-ew-resize transition-opacity',
              selected
                ? 'bg-primary/80 opacity-100 hover:bg-primary'
                : 'bg-white/25 opacity-0 group-hover/clip:opacity-100 hover:bg-white/50',
            )}
            aria-label="Trim end"
          />
        </>
      ) : null}
      {clip.speed !== 1 ? (
        <div className="absolute right-1.5 bottom-0.5 rounded bg-black/60 px-1 text-[9px] text-white">
          {clip.speed}x
        </div>
      ) : null}
    </div>
  )
}
