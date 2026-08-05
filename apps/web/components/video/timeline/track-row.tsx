'use client'

import { useState } from 'react'
import { useVideoEditorStore } from '@/lib/video/store'
import { browseVideoFiles } from '@/lib/video/editor-events'
import { ASSET_DRAG_MIME, addAssetToTimeline } from '@/lib/video/timeline-placement'
import { timeFromTimelineClientX } from '@/lib/video/timeline-seek'
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
  headerWidth: number
  onScrubPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void
  onScrubPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void
  emptyHint?: string
}

export function TrackRow({
  track,
  pxPerSec,
  width,
  height,
  scrollRef,
  headerWidth,
  onScrubPointerDown,
  onScrubPointerMove,
  emptyHint,
}: TrackRowProps) {
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

    const scrollEl = scrollRef.current
    if (!scrollEl) return
    const startTime = timeFromTimelineClientX(
      e.clientX,
      scrollEl,
      headerWidth,
      pxPerSec,
      fps,
      duration,
    )
    const result = addAssetToTimeline(assetId, startTime, track.id)
    if (result !== 'ok') {
      toast.error('Could not place clip here — try another position')
    }
  }

  const handleBackgroundPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('[data-clip-block]')) return
    onScrubPointerDown(e)
  }

  return (
    <div
      className={`relative cursor-crosshair bg-surface-2 ${track.locked ? 'opacity-60' : ''} ${isDropTarget ? 'ring-2 ring-inset ring-primary/50' : ''}`}
      style={{ width, height }}
      onPointerDown={handleBackgroundPointerDown}
      onPointerMove={onScrubPointerMove}
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
      {emptyHint ? (
        <div className="absolute inset-0 z-[1] flex items-center justify-center">
          <button
            type="button"
            className="video-studio-press rounded-xl border border-dashed border-border/60 bg-muted/15 px-3 py-1.5 text-[11px] leading-[1.45] text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
            onClick={e => {
              e.stopPropagation()
              browseVideoFiles()
            }}
            onPointerDown={e => e.stopPropagation()}
          >
            {emptyHint}
          </button>
        </div>
      ) : track.clips.length === 0 && !track.locked ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            type="button"
            className="video-studio-press text-[10px] text-muted-foreground/70 hover:text-muted-foreground"
            onClick={e => {
              e.stopPropagation()
              browseVideoFiles()
            }}
            onPointerDown={e => e.stopPropagation()}
          >
            Drop media here · click to browse
          </button>
        </div>
      ) : null}
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
