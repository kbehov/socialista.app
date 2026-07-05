'use client'

import { useEffect, useRef } from 'react'
import { useVideoEditorStore } from '@/lib/video/store'
import { useDragClip } from '@/hooks/video/use-drag-clip'
import { useTrimHandles } from '@/hooks/video/use-trim-handles'
import { useTimelineFocus } from '@/components/video/timeline/timeline-focus-context'
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
  const { beginTrim, draft } = useTrimHandles(pxPerSec)
  const focusAtTime = useTimelineFocus()

  const asset = assets[clip.assetId]
  const thumbnails = asset && 'thumbnails' in asset ? asset.thumbnails : undefined
  const selected = selectedClipId === clip.id

  const draftLeft = drag && drag.clipId === clip.id ? left + drag.deltaSec * pxPerSec : left
  const draftWidth = width
  void draft // referenced for re-render

  const trimDraft = draft && draft.clipId === clip.id ? draft : null
  const effectiveTrimIn = trimDraft ? trimDraft.trimIn : clip.trimIn
  const effectiveTrimOut = trimDraft ? trimDraft.trimOut : clip.trimOut
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
      className={`absolute top-1 cursor-grab overflow-hidden rounded border ${selected ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-neutral-400'} bg-neutral-800`}
      style={{ left: draftLeft, width: draftWidth, height: height - 8 }}
    >
      {/* Thumbnail strip */}
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
      {/* Label */}
      <div className="absolute left-1 top-0.5 max-w-[calc(100%-8px)] truncate text-[10px] text-white drop-shadow">
        {asset ? asset.name : 'Missing media'}
      </div>
      {/* Trim handles */}
      {!track.locked && (
        <>
          <div
            onPointerDown={e => beginTrim(clip.id, 'in', clip.trimIn, clip.trimOut, clip.duration, e)}
            className="absolute left-0 top-0 h-full w-2 cursor-ew-resize bg-blue-500/60 hover:bg-blue-500"
          />
          <div
            onPointerDown={e => beginTrim(clip.id, 'out', clip.trimIn, clip.trimOut, clip.duration, e)}
            className="absolute right-0 top-0 h-full w-2 cursor-ew-resize bg-blue-500/60 hover:bg-blue-500"
          />
        </>
      )}
      {/* Speed badge */}
      {clip.speed !== 1 && (
        <div className="absolute right-1 top-0.5 rounded bg-black/60 px-1 text-[9px] text-white">
          {clip.speed}x
        </div>
      )}
      <span className="hidden">{effectiveTrimIn}{effectiveTrimOut}</span>
    </div>
  )
}
