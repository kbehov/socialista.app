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
    <div className="flex w-full items-center gap-3">
      <button
        type="button"
        onClick={playback.toggle}
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background hover:opacity-90"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <PauseIcon className="size-3.5" /> : <PlayIcon className="size-3.5" />}
      </button>
      <div className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
        <span className="text-foreground">{formatTimecode(playhead, fps)}</span>
        <span className="mx-1.5 text-border">/</span>
        <span>{formatTimecode(duration, fps)}</span>
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
        className="min-w-0 flex-1 accent-primary"
      />
    </div>
  )
}
