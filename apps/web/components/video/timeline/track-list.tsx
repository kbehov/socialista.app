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
  const addTrack = useVideoEditorStore(s => s.addTrack)

  return (
    <div>
      {tracks.map(track => (
        <div key={track.id} className="flex border-b">
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
          />
        </div>
      ))}
      <div className="flex items-center gap-2 p-3">
        <button
          type="button"
          onClick={() => addTrack('video')}
          className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-muted"
        >
          <PlusIcon className="h-3 w-3" /> Video track
        </button>
        <button
          type="button"
          onClick={() => addTrack('audio')}
          className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-muted"
        >
          <PlusIcon className="h-3 w-3" /> Audio track
        </button>
      </div>
    </div>
  )
}
