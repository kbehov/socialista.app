'use client'

import { useCallback, useRef, useState } from 'react'
import { seekPreview } from '@/hooks/video/use-playback'
import { useVideoEditorStore } from '@/lib/video/store'
import { formatRulerTick, formatTimecode } from '@/lib/video/timecode'
import { scrollTimelineToTime, timeFromTimelineClientX } from '@/lib/video/timeline-seek'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { ClipSpeedContextMenuSection } from '@/components/video/clip-speed-menu'
import {
  CopyIcon,
  FilmIcon,
  MusicIcon,
  ScissorsIcon,
  Trash2Icon,
  TypeIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from 'lucide-react'
import { Playhead } from './playhead'
import { TimelineFocusContext } from './timeline-focus-context'
import { TrackList } from './track-list'
import { TextOverlayBar } from './text-overlay-bar'
import type { Clip } from '@socialista/types'

const TRACK_HEADER_WIDTH = 120
const TRACK_ROW_HEIGHT = 48
const RULER_HEIGHT = 22
const TEXT_OVERLAY_ROW_HEIGHT = 28
const MIN_TIMELINE_WIDTH = 800

type TimelineMenuTarget =
  | { kind: 'clip'; clipId: string }
  | { kind: 'overlay'; overlayId: string }
  | { kind: 'timeline'; time: number }

function canSplitClipAt(clip: Clip, playhead: number): boolean {
  const localTime = playhead - clip.startTime
  return localTime > 0 && localTime < clip.duration
}

export function Timeline() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const zoom = useVideoEditorStore(s => s.zoom)
  const duration = useVideoEditorStore(s => s.project.duration)
  const durationGuide = useVideoEditorStore(s => s.durationGuide)
  const seek = useVideoEditorStore(s => s.seek)
  const fps = useVideoEditorStore(s => s.project.fps)
  const pause = useVideoEditorStore(s => s.pause)
  const playhead = useVideoEditorStore(s => s.playhead)
  const selectClip = useVideoEditorStore(s => s.selectClip)
  const selectOverlay = useVideoEditorStore(s => s.selectOverlay)

  const [menuTarget, setMenuTarget] = useState<TimelineMenuTarget | null>(null)

  const timelineWidth = Math.max(MIN_TIMELINE_WIDTH, Math.ceil(duration * zoom) + 80)

  const resolveMenuTarget = useCallback(
    (clientX: number, targetEl: EventTarget | null): TimelineMenuTarget => {
      const el = targetEl as HTMLElement | null
      const clipId = el?.closest('[data-clip-id]')?.getAttribute('data-clip-id')
      if (clipId) return { kind: 'clip', clipId }

      const overlayId = el?.closest('[data-overlay-id]')?.getAttribute('data-overlay-id')
      if (overlayId) return { kind: 'overlay', overlayId }

      const scrollEl = scrollRef.current
      if (!scrollEl) return { kind: 'timeline', time: playhead }
      const time = timeFromTimelineClientX(clientX, scrollEl, TRACK_HEADER_WIDTH, zoom, fps, duration)
      return { kind: 'timeline', time }
    },
    [duration, fps, playhead, zoom],
  )

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      const el = e.target as HTMLElement
      if (el.closest('[data-track-header], [data-timeline-chrome]')) {
        e.preventDefault()
        return
      }

      const target = resolveMenuTarget(e.clientX, e.target)
      setMenuTarget(target)

      if (target.kind === 'clip') {
        selectClip(target.clipId)
        selectOverlay(null)
        return
      }

      if (target.kind === 'overlay') {
        selectOverlay(target.overlayId)
        selectClip(null)
        return
      }

      pause()
      seek(target.time)
      seekPreview(target.time)
      selectClip(null)
      selectOverlay(null)
    },
    [pause, resolveMenuTarget, seek, selectClip, selectOverlay],
  )

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

  const focusAtTime = useCallback(
    (time: number) => {
      const el = scrollRef.current
      if (!el) return
      const clamped = Math.max(0, Math.min(time, duration))
      pause()
      seek(clamped)
      seekPreview(clamped)
      scrollTimelineToTime(el, clamped, TRACK_HEADER_WIDTH, zoom)
    },
    [duration, pause, seek, zoom],
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
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-background">
      <div
        ref={scrollRef}
        className="relative min-h-0 min-w-0 w-full max-w-full flex-1 overflow-x-auto overflow-y-auto"
      >
        <TimelineFocusContext value={focusAtTime}>
          <ContextMenu onOpenChange={open => { if (!open) setMenuTarget(null) }}>
            <ContextMenuTrigger asChild onContextMenu={handleContextMenu}>
              <div className="relative" style={{ width: TRACK_HEADER_WIDTH + timelineWidth }}>
                <Playhead
                  pxPerSec={zoom}
                  headerWidth={TRACK_HEADER_WIDTH}
                  onSeekAtClientX={seekAtClientX}
                />

                {/* Ruler row */}
                <div className="sticky top-0 z-10 flex bg-background">
                  <div
                    data-timeline-chrome
                    className="shrink-0 border-b border-r bg-background"
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
                    data-timeline-chrome
                    className="flex shrink-0 items-center border-r px-2 text-[11px] font-medium text-muted-foreground"
                    style={{ width: TRACK_HEADER_WIDTH, height: TEXT_OVERLAY_ROW_HEIGHT }}
                  >
                    Text
                  </div>
                  <div
                    className="relative cursor-crosshair touch-none"
                    style={{ width: timelineWidth, height: TEXT_OVERLAY_ROW_HEIGHT }}
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
            </ContextMenuTrigger>
            <TimelineContextMenuContent target={menuTarget} focusAtTime={focusAtTime} />
          </ContextMenu>
        </TimelineFocusContext>
      </div>
    </div>
  )
}

function TimelineContextMenuContent({
  target,
  focusAtTime,
}: {
  target: TimelineMenuTarget | null
  focusAtTime: (time: number) => void
}) {
  const playhead = useVideoEditorStore(s => s.playhead)
  const fps = useVideoEditorStore(s => s.project.fps)
  const duration = useVideoEditorStore(s => s.project.duration)
  const clips = useVideoEditorStore(s => s.project.clips)
  const tracks = useVideoEditorStore(s => s.project.tracks)
  const overlays = useVideoEditorStore(s => s.project.textOverlays)
  const assets = useVideoEditorStore(s => s.assets)
  const splitClip = useVideoEditorStore(s => s.splitClip)
  const splitOverlay = useVideoEditorStore(s => s.splitOverlay)
  const duplicateClip = useVideoEditorStore(s => s.duplicateClip)
  const duplicateOverlay = useVideoEditorStore(s => s.duplicateOverlay)
  const removeClip = useVideoEditorStore(s => s.removeClip)
  const removeOverlay = useVideoEditorStore(s => s.removeOverlay)
  const addTextOverlay = useVideoEditorStore(s => s.addTextOverlay)
  const addTrack = useVideoEditorStore(s => s.addTrack)
  const zoomIn = useVideoEditorStore(s => s.zoomIn)
  const zoomOut = useVideoEditorStore(s => s.zoomOut)

  const addTextAt = (time: number) => {
    const end = Math.min(duration > 0 ? duration : time + 3, time + 3)
    addTextOverlay(time, Math.max(time + 0.5, end))
  }

  if (!target) return null

  if (target.kind === 'clip') {
    const clip = clips[target.clipId]
    if (!clip) return null
    const track = tracks.find(t => t.id === clip.trackId)
    const locked = track?.locked ?? false
    const asset = assets[clip.assetId]
    const canSplit = !locked && canSplitClipAt(clip, playhead)
    const label = asset?.name ?? 'Clip'

    return (
      <ContextMenuContent className="w-52">
        <ContextMenuLabel className="truncate">{label}</ContextMenuLabel>
        <ContextMenuItem disabled={locked} onSelect={() => focusAtTime(clip.startTime)}>
          Go to clip start
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem disabled={!canSplit} onSelect={() => splitClip(target.clipId, playhead)}>
          <ScissorsIcon />
          Split at playhead
          <ContextMenuShortcut>S</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem disabled={locked} onSelect={() => duplicateClip(target.clipId)}>
          <CopyIcon />
          Duplicate
          <ContextMenuShortcut>⌘D</ContextMenuShortcut>
        </ContextMenuItem>
        <ClipSpeedContextMenuSection clipId={target.clipId} disabled={locked} />
        <ContextMenuSeparator />
        <ContextMenuItem disabled={locked} variant="destructive" onSelect={() => removeClip(target.clipId)}>
          <Trash2Icon />
          Delete clip
          <ContextMenuShortcut>⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    )
  }

  if (target.kind === 'overlay') {
    const overlay = overlays.find(o => o.id === target.overlayId)
    if (!overlay) return null
    const canSplit = playhead > overlay.startTime && playhead < overlay.endTime
    const label = overlay.content?.trim() || 'Text overlay'

    return (
      <ContextMenuContent className="w-52">
        <ContextMenuLabel className="truncate">{label}</ContextMenuLabel>
        <ContextMenuItem onSelect={() => focusAtTime(overlay.startTime)}>
          Go to overlay start
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={() => duplicateOverlay(target.overlayId)}>
          <CopyIcon />
          Duplicate
          <ContextMenuShortcut>⌘D</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem disabled={!canSplit} onSelect={() => splitOverlay(target.overlayId, playhead)}>
          <ScissorsIcon />
          Split at playhead
          <ContextMenuShortcut>S</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive" onSelect={() => removeOverlay(target.overlayId)}>
          <Trash2Icon />
          Delete overlay
          <ContextMenuShortcut>⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    )
  }

  const timeLabel = formatTimecode(target.time, fps)

  return (
    <ContextMenuContent className="w-52">
      <ContextMenuLabel>At {timeLabel}</ContextMenuLabel>
      <ContextMenuItem onSelect={() => addTextAt(target.time)}>
        <TypeIcon />
        Add text overlay
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem onSelect={() => addTrack('video')}>
        <FilmIcon />
        Add video track
      </ContextMenuItem>
      <ContextMenuItem onSelect={() => addTrack('audio')}>
        <MusicIcon />
        Add audio track
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem onSelect={() => zoomIn()}>
        <ZoomInIcon />
        Zoom in
        <ContextMenuShortcut>+</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem onSelect={() => zoomOut()}>
        <ZoomOutIcon />
        Zoom out
        <ContextMenuShortcut>−</ContextMenuShortcut>
      </ContextMenuItem>
    </ContextMenuContent>
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
