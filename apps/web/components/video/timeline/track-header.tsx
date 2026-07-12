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
      className="flex shrink-0 flex-col justify-center gap-0.5 border-r bg-background px-1.5 py-1"
      style={{ width, height }}
    >
      <div className="flex items-center gap-1">
        <span className="truncate text-[11px] font-medium leading-tight" title={track.name}>
          {track.name}
        </span>
        <span className="ml-auto shrink-0 rounded bg-muted px-1 text-[9px] uppercase text-muted-foreground">
          {track.type}
        </span>
      </div>
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => toggleMute(track.id)}
          className={`flex size-5 items-center justify-center rounded hover:bg-muted ${track.muted ? 'text-red-500' : 'text-muted-foreground'}`}
          aria-label={track.muted ? 'Unmute' : 'Mute'}
        >
          {track.muted ? <VolumeXIcon className="size-3" /> : <Volume2Icon className="size-3" />}
        </button>
        <button
          type="button"
          onClick={() => toggleLock(track.id)}
          className={`flex size-5 items-center justify-center rounded hover:bg-muted ${track.locked ? 'text-blue-500' : 'text-muted-foreground'}`}
          aria-label={track.locked ? 'Unlock' : 'Lock'}
        >
          <LockIcon className="size-3" />
        </button>
        <button
          type="button"
          onClick={() => removeTrack(track.id)}
          className="flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-red-500"
          aria-label="Delete track"
        >
          <Trash2Icon className="size-3" />
        </button>
      </div>
    </div>
  )
}
