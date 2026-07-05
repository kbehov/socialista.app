'use client'

import { useState } from 'react'
import { useVideoEditorStore } from '@/lib/video/store'
import { ASSET_DRAG_MIME, addAssetToTimeline } from '@/lib/video/timeline-placement'
import { timeFromTimelinePointer } from '@/lib/video/timeline-seek'
import type { Track } from '@socialista/types'
import { toast } from 'sonner'
import { VideoClipBlock } from './video-clip-block'
import { AudioClipBlock } from './audio-clip-block'

type TrackRowProps = {
  track: Track
  pxPerSec: number
  width: number
  height: number
  scrollRef: React.RefObject<HTMLDivElement | null>
  onSeekAtClientX: (clientX: number, targetRect: DOMRect) => void
}

export function TrackRow({ track, pxPerSec, width, height, scrollRef, onSeekAtClientX }: TrackRowProps) {
  const clips = useVideoEditorStore(s => s.project.clips)
  const assets = useVideoEditorStore(s => s.assets)
  const fps = useVideoEditorStore(s => s.project.fps)
  const duration = useVideoEditorStore(s => s.project.duration)
  const [isDropTarget, setIsDropTarget] = useState(false)

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDropTarget(false)
    if (track.locked) {
      toast.error('This track is locked')
      return
    }

    const assetId = e.dataTransfer.getData(ASSET_DRAG_MIME)
    if (!assetId) return

    const asset = assets[assetId]
    if (!asset) return

    const expectedTrackType = asset.type === 'audio' ? 'audio' : 'video'
    if (track.type !== expectedTrackType) {
      toast.error(`Drop ${asset.type} files on a ${expectedTrackType} track`)
      return
    }

    const scrollLeft = scrollRef.current?.scrollLeft ?? 0
    const rect = e.currentTarget.getBoundingClientRect()
    const startTime = timeFromTimelinePointer(e.clientX, rect, scrollLeft, pxPerSec, fps, duration)
    const result = addAssetToTimeline(assetId, startTime, track.id)
    if (result !== 'ok') {
      toast.error('Could not place clip here — try another position')
    }
  }

  const handleBackgroundPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('[data-clip-block]')) return
    onSeekAtClientX(e.clientX, e.currentTarget.getBoundingClientRect())
  }

  return (
    <div
      className={`relative cursor-crosshair bg-neutral-100 dark:bg-neutral-900 ${track.locked ? 'opacity-60' : ''} ${isDropTarget ? 'ring-2 ring-inset ring-primary/50' : ''}`}
      style={{ width, height }}
      onPointerDown={handleBackgroundPointerDown}
      onDragOver={e => {
        if (track.locked) return
        if (!e.dataTransfer.types.includes(ASSET_DRAG_MIME)) return
        e.preventDefault()
        e.dataTransfer.dropEffect = 'copy'
        setIsDropTarget(true)
      }}
      onDragLeave={e => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsDropTarget(false)
        }
      }}
      onDrop={handleDrop}
    >
      {track.clips.length === 0 && !track.locked && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] text-muted-foreground/70">
          Drop media here · click to seek
        </div>
      )}
      {track.clips.map(clipId => {
        const clip = clips[clipId]
        if (!clip) return null
        const left = clip.startTime * pxPerSec
        const clipWidth = Math.max(8, clip.duration * pxPerSec)
        return clip.type === 'audio' ? (
          <AudioClipBlock
            key={clipId}
            clip={clip}
            left={left}
            width={clipWidth}
            height={height}
            pxPerSec={pxPerSec}
            track={track}
          />
        ) : (
          <VideoClipBlock
            key={clipId}
            clip={clip}
            left={left}
            width={clipWidth}
            height={height}
            pxPerSec={pxPerSec}
            track={track}
          />
        )
      })}
    </div>
  )
}
