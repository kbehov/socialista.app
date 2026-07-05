'use client'

import { useVideoEditorStore } from '@/lib/video/store'
import { useDragOverlay } from '@/hooks/video/use-drag-overlay'
import { useTimelineFocus } from '@/components/video/timeline/timeline-focus-context'
import type { TextOverlay } from '@socialista/types'
import { TypeIcon } from 'lucide-react'

export function TextOverlayBar({ pxPerSec }: { pxPerSec: number }) {
  const overlays = useVideoEditorStore(s => s.project.textOverlays)
  const selectedOverlayId = useVideoEditorStore(s => s.selectedOverlayId)
  const selectOverlay = useVideoEditorStore(s => s.selectOverlay)
  const selectClip = useVideoEditorStore(s => s.selectClip)
  const { beginMove, beginTrim, draft } = useDragOverlay(pxPerSec)
  const focusAtTime = useTimelineFocus()

  return (
    <div className="absolute inset-0 z-[1] touch-none">
      {overlays.map(overlay => {
        const timingDraft = draft?.overlayId === overlay.id ? draft : null
        const startTime = timingDraft?.startTime ?? overlay.startTime
        const endTime = timingDraft?.endTime ?? overlay.endTime
        const left = startTime * pxPerSec
        const width = Math.max(16, (endTime - startTime) * pxPerSec)
        const selected = overlay.id === selectedOverlayId

        return (
          <TextOverlayBlock
            key={overlay.id}
            overlay={overlay}
            left={left}
            width={width}
            selected={selected}
            onSelect={() => {
              selectClip(null)
              selectOverlay(overlay.id)
            }}
            onMove={e => {
              selectClip(null)
              selectOverlay(overlay.id)
              beginMove(overlay.id, startTime, endTime, e, () => focusAtTime?.(overlay.startTime))
            }}
            onTrimStart={e => {
              selectClip(null)
              selectOverlay(overlay.id)
              beginTrim(overlay.id, 'start', startTime, endTime, e)
            }}
            onTrimEnd={e => {
              selectClip(null)
              selectOverlay(overlay.id)
              beginTrim(overlay.id, 'end', startTime, endTime, e)
            }}
          />
        )
      })}
    </div>
  )
}

function TextOverlayBlock({
  overlay,
  left,
  width,
  selected,
  onSelect,
  onMove,
  onTrimStart,
  onTrimEnd,
}: {
  overlay: TextOverlay
  left: number
  width: number
  selected: boolean
  onSelect: () => void
  onMove: (e: React.PointerEvent) => void
  onTrimStart: (e: React.PointerEvent) => void
  onTrimEnd: (e: React.PointerEvent) => void
}) {
  return (
    <div
      data-overlay-bar
      data-overlay-id={overlay.id}
      className={`absolute top-0.5 flex h-[26px] touch-none select-none items-center overflow-hidden rounded border ${
        selected
          ? 'z-10 border-blue-500 bg-blue-500 ring-2 ring-blue-500/40'
          : 'border-purple-400/80 bg-purple-500/80 hover:bg-purple-500'
      }`}
      style={{ left, width }}
      title={`${overlay.content || 'Text overlay'} — drag to move, edges to trim, S to split at playhead`}
    >
      <div
        onPointerDown={onTrimStart}
        className="absolute left-0 top-0 z-20 h-full w-3 shrink-0 cursor-ew-resize bg-white/25 hover:bg-white/45"
        aria-label="Trim start"
      />
      <div
        onPointerDown={e => {
          onSelect()
          onMove(e)
        }}
        className="flex h-full min-w-0 flex-1 cursor-grab items-center gap-1 px-3 text-[10px] text-white active:cursor-grabbing"
      >
        <TypeIcon className="h-3 w-3 shrink-0 pointer-events-none" />
        <span className="truncate pointer-events-none">{overlay.content || 'Text overlay'}</span>
      </div>
      <div
        onPointerDown={onTrimEnd}
        className="absolute right-0 top-0 z-20 h-full w-3 shrink-0 cursor-ew-resize bg-white/25 hover:bg-white/45"
        aria-label="Trim end"
      />
    </div>
  )
}
