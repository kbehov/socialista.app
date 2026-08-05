'use client'

import { useVideoEditorStore } from '@/lib/video/store'
import { useDragOverlay } from '@/hooks/video/use-drag-overlay'
import { useTimelineFocus } from '@/components/video/timeline/timeline-focus-context'
import { cn } from '@/lib/utils'
import type { TextOverlay } from '@socialista/types'
import { TypeIcon } from 'lucide-react'

export function TextOverlayBar({ pxPerSec }: { pxPerSec: number }) {
  const overlays = useVideoEditorStore(s => s.project.textOverlays)
  const selectedOverlayId = useVideoEditorStore(s => s.selectedOverlayId)
  const selectOverlay = useVideoEditorStore(s => s.selectOverlay)
  const selectClip = useVideoEditorStore(s => s.selectClip)
  const requestOverlayEdit = useVideoEditorStore(s => s.requestOverlayEdit)
  const seek = useVideoEditorStore(s => s.seek)
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
            onDoubleClick={() => {
              selectClip(null)
              selectOverlay(overlay.id)
              seek(overlay.startTime)
              focusAtTime?.(overlay.startTime)
              requestOverlayEdit(overlay.id)
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
  onDoubleClick,
  onMove,
  onTrimStart,
  onTrimEnd,
}: {
  overlay: TextOverlay
  left: number
  width: number
  selected: boolean
  onSelect: () => void
  onDoubleClick: () => void
  onMove: (e: React.PointerEvent) => void
  onTrimStart: (e: React.PointerEvent) => void
  onTrimEnd: (e: React.PointerEvent) => void
}) {
  return (
    <div
      data-overlay-bar
      data-overlay-id={overlay.id}
      onDoubleClick={onDoubleClick}
      className={cn(
        'absolute top-0.5 flex h-[26px] touch-none select-none items-center overflow-hidden rounded-md border transition-[box-shadow,border-color]',
        selected
          ? 'z-10 border-primary bg-violet-500/85 ring-2 ring-primary/20'
          : 'border-violet-400/40 bg-violet-500/65 hover:bg-violet-500/80',
      )}
      style={{ left, width }}
      title={`${overlay.content || 'Text overlay'} — double-click to edit`}
    >
      <div
        onPointerDown={onTrimStart}
        className="absolute left-0 top-0 z-20 h-full w-2.5 shrink-0 cursor-ew-resize bg-white/20 hover:bg-white/40"
        aria-label="Trim start"
      />
      <div
        onPointerDown={e => {
          onSelect()
          onMove(e)
        }}
        className="flex h-full min-w-0 flex-1 cursor-grab items-center gap-1 px-3 text-[10px] text-white active:cursor-grabbing"
      >
        <TypeIcon className="pointer-events-none h-3 w-3 shrink-0" />
        <span className="pointer-events-none truncate">{overlay.content || 'Text overlay'}</span>
      </div>
      <div
        onPointerDown={onTrimEnd}
        className="absolute right-0 top-0 z-20 h-full w-2.5 shrink-0 cursor-ew-resize bg-white/20 hover:bg-white/40"
        aria-label="Trim end"
      />
    </div>
  )
}
