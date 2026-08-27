'use client'

import type { CSSProperties } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useVideoEditorStore } from '@/lib/video/store'
import { formatTimecode, parseTimecode } from '@/lib/video/timecode'
import { cn } from '@/lib/utils'
import { PauseIcon, PlayIcon, SkipBackIcon, SkipForwardIcon } from 'lucide-react'

type Playback = {
  toggle: () => void
  seekTo: (time: number) => void
}

const SKIP_SECONDS = 1

function EditableTimecode({
  playback,
  className,
}: {
  playback: Playback
  className?: string
}) {
  const playhead = useVideoEditorStore(s => s.playhead)
  const duration = useVideoEditorStore(s => s.project.duration)
  const fps = useVideoEditorStore(s => s.project.fps)
  const seek = useVideoEditorStore(s => s.seek)
  const pause = useVideoEditorStore(s => s.pause)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const display = formatTimecode(playhead, fps)

  const startEditing = useCallback(() => {
    pause()
    setDraft(formatTimecode(playhead, fps))
    setEditing(true)
  }, [fps, pause, playhead])

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  const commit = useCallback(() => {
    const parsed = parseTimecode(draft, fps)
    setEditing(false)
    if (parsed == null) return
    const next = Math.max(0, Math.min(duration, parsed))
    seek(next)
    playback.seekTo(next)
  }, [draft, duration, fps, playback, seek])

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault()
            commit()
          }
          if (e.key === 'Escape') {
            e.preventDefault()
            setEditing(false)
          }
        }}
        className={cn(
          'h-6 w-22 rounded-md border bg-muted/50 px-1.5 font-mono text-xs tabular-nums outline-none focus-visible:border-ring',
          className,
        )}
        aria-label="Jump to timecode"
      />
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={startEditing}
          className={cn(
            'video-studio-press rounded-md px-1 py-0.5 font-mono text-xs tabular-nums hover:bg-muted/50',
            className,
          )}
          aria-label="Edit timecode"
        >
          <span className="font-medium text-foreground">{display}</span>
          <span className="mx-1.5 text-muted-foreground/40">|</span>
          <span className="text-muted-foreground">{formatTimecode(duration, fps)}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent>Click to jump to time</TooltipContent>
    </Tooltip>
  )
}

export function PreviewControls({
  playback,
  variant = 'default',
}: {
  playback: Playback
  variant?: 'default' | 'transport'
}) {
  const isPlaying = useVideoEditorStore(s => s.isPlaying)
  const playhead = useVideoEditorStore(s => s.playhead)
  const duration = useVideoEditorStore(s => s.project.duration)
  const fps = useVideoEditorStore(s => s.project.fps)
  const seek = useVideoEditorStore(s => s.seek)

  const hasContent = duration > 0
  const progress = duration > 0 ? (playhead / duration) * 100 : 0

  const seekBy = (delta: number) => {
    const next = Math.max(0, Math.min(duration, playhead + delta))
    seek(next)
    playback.seekTo(next)
  }

  if (variant === 'transport') {
    return (
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        <div className="flex shrink-0 items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                className="video-studio-press size-8 rounded-full text-muted-foreground"
                onClick={() => seekBy(-SKIP_SECONDS)}
                disabled={!hasContent}
                aria-label={`Skip back ${SKIP_SECONDS} second`}
              >
                <SkipBackIcon className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Back {SKIP_SECONDS}s</TooltipContent>
          </Tooltip>

          <button
            type="button"
            onClick={playback.toggle}
            disabled={!hasContent}
            className={cn(
              'video-studio-press flex size-8 shrink-0 items-center justify-center rounded-full transition-all',
              'bg-foreground text-background hover:opacity-90',
              'disabled:cursor-not-allowed disabled:opacity-40',
            )}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <PauseIcon className="size-3.5" /> : <PlayIcon className="ml-0.5 size-3.5" />}
          </button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                className="video-studio-press size-8 rounded-full text-muted-foreground"
                onClick={() => seekBy(SKIP_SECONDS)}
                disabled={!hasContent}
                aria-label={`Skip forward ${SKIP_SECONDS} second`}
              >
                <SkipForwardIcon className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Forward {SKIP_SECONDS}s</TooltipContent>
          </Tooltip>
        </div>

        <EditableTimecode playback={playback} />
      </div>
    )
  }

  return (
    <div className="flex w-full items-center gap-2 sm:gap-3">
      <div className="flex shrink-0 items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              className="video-studio-press size-8 rounded-full text-muted-foreground"
              onClick={() => seekBy(-SKIP_SECONDS)}
              disabled={!hasContent}
              aria-label={`Skip back ${SKIP_SECONDS} second`}
            >
              <SkipBackIcon className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Back {SKIP_SECONDS}s</TooltipContent>
        </Tooltip>

        <button
          type="button"
          onClick={playback.toggle}
          disabled={!hasContent}
          className={cn(
            'video-studio-press flex size-10 shrink-0 items-center justify-center rounded-full transition-all',
            'bg-foreground text-background shadow-md hover:opacity-90',
            'disabled:cursor-not-allowed disabled:opacity-40',
          )}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <PauseIcon className="size-4" /> : <PlayIcon className="ml-0.5 size-4" />}
        </button>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              className="video-studio-press size-8 rounded-full text-muted-foreground"
              onClick={() => seekBy(SKIP_SECONDS)}
              disabled={!hasContent}
              aria-label={`Skip forward ${SKIP_SECONDS} second`}
            >
              <SkipForwardIcon className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Forward {SKIP_SECONDS}s</TooltipContent>
        </Tooltip>
      </div>

      <div className="hidden shrink-0 sm:block">
        <EditableTimecode playback={playback} />
      </div>

      <div className="relative min-w-0 flex-1">
        <input
          type="range"
          min={0}
          max={Math.max(0.1, duration)}
          step={1 / Math.max(1, fps)}
          value={Math.min(playhead, duration)}
          disabled={!hasContent}
          onChange={e => {
            const t = parseFloat(e.target.value)
            seek(t)
            playback.seekTo(t)
          }}
          className="video-scrubber h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          style={
            {
              '--scrub-progress': `${progress}%`,
            } as CSSProperties
          }
          aria-label="Seek timeline"
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={playhead}
        />
      </div>

      <div className="shrink-0 font-mono text-[11px] tabular-nums sm:hidden">
        <span className="text-foreground">{formatTimecode(playhead, fps)}</span>
      </div>

      <p className="hidden shrink-0 text-[10px] text-muted-foreground xl:block">
        <Kbd>Space</Kbd> play · <Kbd>←</Kbd>
        <Kbd>→</Kbd> seek
      </p>
    </div>
  )
}
