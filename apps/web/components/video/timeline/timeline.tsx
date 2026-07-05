'use client'

import { useCallback, useRef } from 'react'
import { seekPreview } from '@/hooks/video/use-playback'
import { useVideoEditorStore } from '@/lib/video/store'
import { formatRulerTick } from '@/lib/video/timecode'
import { timeFromTimelineClientX } from '@/lib/video/timeline-seek'
import { Playhead } from './playhead'
import { TrackList } from './track-list'
import { TextOverlayBar } from './text-overlay-bar'

const TRACK_HEADER_WIDTH = 160
const TRACK_ROW_HEIGHT = 64
const RULER_HEIGHT = 28
const MIN_TIMELINE_WIDTH = 800

export function Timeline() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const zoom = useVideoEditorStore(s => s.zoom)
  const duration = useVideoEditorStore(s => s.project.duration)
  const durationGuide = useVideoEditorStore(s => s.durationGuide)
  const tracks = useVideoEditorStore(s => s.project.tracks)
  const seek = useVideoEditorStore(s => s.seek)
  const fps = useVideoEditorStore(s => s.project.fps)
  const pause = useVideoEditorStore(s => s.pause)

  const timelineWidth = Math.max(MIN_TIMELINE_WIDTH, Math.ceil(duration * zoom) + 80)

  const seekAtClientX = useCallback(
    (clientX: number) => {
      const el = scrollRef.current
      if (!el) return
      const time = timeFromTimelineClientX(clientX, el, TRACK_HEADER_WIDTH, zoom, fps, duration)
      pause()
      seek(time)
      seekPreview(time)
    },
    [duration, fps, pause, seek, zoom],
  )

  const handleScrubPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return
      if ((e.target as HTMLElement).closest('[data-clip-block], [data-overlay-bar]')) return
      e.preventDefault()
      e.currentTarget.setPointerCapture(e.pointerId)
      seekAtClientX(e.clientX)
    },
    [seekAtClientX],
  )

  const handleScrubPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
      seekAtClientX(e.clientX)
    },
    [seekAtClientX],
  )

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-md border bg-background">
      <div className="flex items-center gap-2 border-b px-3 py-2 text-sm">
        <span className="font-medium">Timeline</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">{tracks.length} tracks</span>
        <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
          <ZoomButton direction={-1}>−</ZoomButton>
          <span className="w-12 text-center tabular-nums">{zoom}px/s</span>
          <ZoomButton direction={1}>+</ZoomButton>
        </div>
      </div>
      <div ref={scrollRef} className="relative flex-1 overflow-auto">
        <div className="relative" style={{ width: TRACK_HEADER_WIDTH + timelineWidth }}>
          <Playhead
            pxPerSec={zoom}
            headerWidth={TRACK_HEADER_WIDTH}
            onSeekAtClientX={seekAtClientX}
          />

          {/* Ruler row */}
          <div className="sticky top-0 z-10 flex bg-background">
            <div
              className="shrink-0 border-b border-r bg-muted/40"
              style={{ width: TRACK_HEADER_WIDTH, height: RULER_HEIGHT }}
            />
            <div
              data-timeline-ruler
              className="relative cursor-crosshair touch-none border-b"
              style={{ width: timelineWidth, height: RULER_HEIGHT }}
              onPointerDown={handleScrubPointerDown}
              onPointerMove={handleScrubPointerMove}
            >
              <TimelineRuler duration={duration} pxPerSec={zoom} fps={fps} durationGuide={durationGuide} />
            </div>
          </div>

          {/* Text overlay lane */}
          <div className="flex border-b">
            <div
              className="shrink-0 border-r px-2 py-1 text-xs font-medium text-muted-foreground"
              style={{ width: TRACK_HEADER_WIDTH, height: 36 }}
            >
              Text overlays
            </div>
            <div
              className="relative cursor-crosshair touch-none"
              style={{ width: timelineWidth, height: 36 }}
              onPointerDown={handleScrubPointerDown}
              onPointerMove={handleScrubPointerMove}
            >
              <TextOverlayBar pxPerSec={zoom} />
            </div>
          </div>

          {/* Tracks */}
          <TrackList
            pxPerSec={zoom}
            timelineWidth={timelineWidth}
            headerWidth={TRACK_HEADER_WIDTH}
            rowHeight={TRACK_ROW_HEIGHT}
            scrollRef={scrollRef}
            onScrubPointerDown={handleScrubPointerDown}
            onScrubPointerMove={handleScrubPointerMove}
          />
        </div>
      </div>
    </div>
  )
}

function ZoomButton({ direction, children }: { direction: 1 | -1; children: React.ReactNode }) {
  const zoomIn = useVideoEditorStore(s => s.zoomIn)
  const zoomOut = useVideoEditorStore(s => s.zoomOut)
  return (
    <button
      type="button"
      className="flex h-6 w-6 items-center justify-center rounded border hover:bg-muted"
      onClick={() => (direction === 1 ? zoomIn() : zoomOut())}
    >
      {children}
    </button>
  )
}

function TimelineRuler({
  duration,
  pxPerSec,
  fps,
  durationGuide,
}: {
  duration: number
  pxPerSec: number
  fps: number
  durationGuide: number | null
}) {
  const targetSpacing = 100
  const minSec = targetSpacing / pxPerSec
  const candidates = [0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600]
  let step = candidates[candidates.length - 1] ?? 1
  for (const c of candidates) {
    if (c >= minSec) {
      step = c
      break
    }
  }
  const ticks: number[] = []
  const total = Math.max(duration, 10)
  for (let t = 0; t <= total; t += step) {
    ticks.push(t)
  }
  return (
    <div className="pointer-events-none absolute inset-0">
      {ticks.map(t => (
        <div
          key={t}
          className="absolute top-0 h-full border-l text-[10px] text-muted-foreground"
          style={{ left: t * pxPerSec }}
        >
          <span className="absolute left-1 top-1">{formatRulerTick(t)}</span>
        </div>
      ))}
      {durationGuide != null && durationGuide > 0 ? (
        <div
          className="absolute top-0 h-full border-l-2 border-dashed border-amber-500/80"
          style={{ left: durationGuide * pxPerSec }}
        >
          <span className="absolute left-1 top-1 text-[9px] font-medium text-amber-600 dark:text-amber-400">
            {durationGuide}s
          </span>
        </div>
      ) : null}
      <span className="hidden">{fps}</span>
    </div>
  )
}
