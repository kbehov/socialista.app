'use client'

import { useVideoEditorStore } from '@/lib/video/store'
import type { Track } from '@socialista/types'
import { LockIcon, Trash2Icon, Volume2Icon, VolumeXIcon } from 'lucide-react'

type TrackHeaderProps = {
  track: Track
  width: number
  height: number
}

export function TrackHeader({ track, width, height }: TrackHeaderProps) {
  const toggleMute = useVideoEditorStore(s => s.toggleMute)
  const toggleLock = useVideoEditorStore(s => s.toggleLock)
  const removeTrack = useVideoEditorStore(s => s.removeTrack)

  return (
    <div
      data-track-header
      className="shrink-0 border-r bg-muted/30 px-2 py-1"
      style={{ width, height }}
    >
      <div className="flex h-full flex-col justify-between gap-1">
        <div className="flex items-center gap-1">
          <span className="truncate text-xs font-medium" title={track.name}>
            {track.name}
          </span>
          <span className="ml-auto rounded bg-muted px-1 text-[10px] uppercase text-muted-foreground">
            {track.type}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => toggleMute(track.id)}
            className={`flex h-6 w-6 items-center justify-center rounded hover:bg-muted ${track.muted ? 'text-red-500' : 'text-muted-foreground'}`}
            aria-label={track.muted ? 'Unmute' : 'Mute'}
          >
            {track.muted ? <VolumeXIcon className="h-3.5 w-3.5" /> : <Volume2Icon className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => toggleLock(track.id)}
            className={`flex h-6 w-6 items-center justify-center rounded hover:bg-muted ${track.locked ? 'text-blue-500' : 'text-muted-foreground'}`}
            aria-label={track.locked ? 'Unlock' : 'Lock'}
          >
            <LockIcon className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => removeTrack(track.id)}
            className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-red-500"
            aria-label="Delete track"
          >
            <Trash2Icon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
