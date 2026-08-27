'use client'

import { useVideoEditorStore } from '@/lib/video/store'
import { PlusIcon } from 'lucide-react'
import { TrackHeader } from './track-header'
import { TrackRow } from './track-row'

type TrackListProps = {
  pxPerSec: number
  timelineWidth: number
  headerWidth: number
  rowHeight: number
  scrollRef: React.RefObject<HTMLDivElement | null>
  onScrubPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void
  onScrubPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void
}

export function TrackList({
  pxPerSec,
  timelineWidth,
  headerWidth,
  rowHeight,
  scrollRef,
  onScrubPointerDown,
  onScrubPointerMove,
}: TrackListProps) {
  const tracks = useVideoEditorStore(s => s.project.tracks)
  const clips = useVideoEditorStore(s => s.project.clips)
  const addTrack = useVideoEditorStore(s => s.addTrack)
  const hasClips = Object.keys(clips).length > 0

  return (
    <div>
      {tracks.map((track, index) => (
        <div key={track.id} className="flex border-b border-border/40">
          <TrackHeader track={track} width={headerWidth} height={rowHeight} />
          <TrackRow
            track={track}
            pxPerSec={pxPerSec}
            width={timelineWidth}
            height={rowHeight}
            scrollRef={scrollRef}
            headerWidth={headerWidth}
            onScrubPointerDown={onScrubPointerDown}
            onScrubPointerMove={onScrubPointerMove}
            emptyHint={!hasClips && index === 0 ? 'Drag media here to start' : undefined}
          />
        </div>
      ))}
      <div className="flex items-center gap-1.5 p-2.5">
        <button
          type="button"
          onClick={() => addTrack('video')}
          className="flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <PlusIcon className="size-3" strokeWidth={1.75} /> Video track
        </button>
        <button
          type="button"
          onClick={() => addTrack('audio')}
          className="flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <PlusIcon className="size-3" strokeWidth={1.75} /> Audio track
        </button>
      </div>
    </div>
  )
}
