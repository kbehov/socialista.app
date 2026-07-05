'use client'

import { useVideoEditorStore } from '@/lib/video/store'
import { formatTimecode } from '@/lib/video/timecode'
import { PauseIcon, PlayIcon } from 'lucide-react'

type Playback = {
  toggle: () => void
  seekTo: (time: number) => void
}

export function PreviewControls({ playback }: { playback: Playback }) {
  const isPlaying = useVideoEditorStore(s => s.isPlaying)
  const playhead = useVideoEditorStore(s => s.playhead)
  const duration = useVideoEditorStore(s => s.project.duration)
  const fps = useVideoEditorStore(s => s.project.fps)
  const seek = useVideoEditorStore(s => s.seek)

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={playback.toggle}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
      </button>
      <div className="font-mono text-sm tabular-nums text-neutral-700 dark:text-neutral-300">
        <span>{formatTimecode(playhead, fps)}</span>
        <span className="mx-2 text-neutral-400">/</span>
        <span className="text-neutral-500">{formatTimecode(duration, fps)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={Math.max(0.1, duration)}
        step={1 / Math.max(1, fps)}
        value={Math.min(playhead, duration)}
        onChange={e => {
          const t = parseFloat(e.target.value)
          seek(t)
          playback.seekTo(t)
        }}
        className="hidden flex-1 md:block"
      />
    </div>
  )
}
