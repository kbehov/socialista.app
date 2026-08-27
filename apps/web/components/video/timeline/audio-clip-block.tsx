'use client'

import { useVideoEditorStore } from '@/lib/video/store'
import { useDragClip } from '@/hooks/video/use-drag-clip'
import { useTrimHandles } from '@/hooks/video/use-trim-handles'
import { useTimelineFocus } from '@/components/video/timeline/timeline-focus-context'
import { previewTrimWidthPx } from '@/lib/video/trim-preview'
import { cn } from '@/lib/utils'
import type { AudioClip, Track } from '@socialista/types'
import { memo, useMemo } from 'react'

type Props = {
  clip: AudioClip
  left: number
  width: number
  height: number
  pxPerSec: number
  track: Track
}

export const AudioClipBlock = memo(function AudioClipBlock({
  clip,
  left,
  width,
  height,
  pxPerSec,
  track,
}: Props) {
  const selectedClipId = useVideoEditorStore(s => s.selectedClipId)
  const selectClip = useVideoEditorStore(s => s.selectClip)
  const assets = useVideoEditorStore(s => s.assets)
  const { beginDrag, drag } = useDragClip(pxPerSec)
  const { beginTrim, draft, isDragging: isTrimming } = useTrimHandles(pxPerSec)
  const focusAtTime = useTimelineFocus()

  const asset = assets[clip.assetId]
  const waveform = asset && 'waveform' in asset ? asset.waveform : undefined
  const selected = selectedClipId === clip.id
  const isDragging = drag?.clipId === clip.id
  const trimDraft = draft?.clipId === clip.id ? draft : null

  const draftLeft = isDragging ? left + drag.deltaSec * pxPerSec : left
  const draftWidth = trimDraft
    ? previewTrimWidthPx(clip, asset, trimDraft.trimIn, trimDraft.trimOut, pxPerSec)
    : width

  return (
    <div
      data-clip-block
      data-clip-id={clip.id}
      onPointerDown={e => {
        if (track.locked) return
        selectClip(clip.id)
        beginDrag(clip.id, clip.startTime, clip.trackId, e, () => focusAtTime?.(clip.startTime))
      }}
      className={cn(
        'group/clip absolute top-1 flex items-center overflow-hidden rounded-lg border text-emerald-600/80 transition-[box-shadow,border-color] dark:text-emerald-300/80',
        isDragging ? 'z-[3] cursor-grabbing shadow-md' : 'cursor-grab',
        selected
          ? 'z-[2] border-primary bg-emerald-500/20 ring-2 ring-primary/20'
          : 'border-emerald-500/30 bg-emerald-500/10 hover:border-emerald-500/50',
        isTrimming && trimDraft ? 'z-[3]' : null,
      )}
      style={{ left: draftLeft, width: draftWidth, height: height - 8 }}
    >
      <WaveformSvg peaks={waveform} className="h-full w-full" />
      <div className="absolute left-1.5 top-0.5 max-w-[calc(100%-8px)] truncate text-[10px] font-medium text-emerald-800/90 dark:text-emerald-100/90">
        {asset ? asset.name : 'Missing audio'}
      </div>
      {!track.locked ? (
        <>
          <div
            onPointerDown={e =>
              beginTrim(clip.id, 'in', clip.trimIn, clip.trimOut, clip.duration, e, clip.startTime)
            }
            className={cn(
              'absolute left-0 top-0 h-full w-2.5 cursor-ew-resize transition-opacity',
              selected
                ? 'bg-primary/80 opacity-100 hover:bg-primary'
                : 'bg-emerald-300/30 opacity-0 group-hover/clip:opacity-100 hover:bg-emerald-300/60',
            )}
            aria-label="Trim start"
          />
          <div
            onPointerDown={e =>
              beginTrim(clip.id, 'out', clip.trimIn, clip.trimOut, clip.duration, e, clip.startTime)
            }
            className={cn(
              'absolute right-0 top-0 h-full w-2.5 cursor-ew-resize transition-opacity',
              selected
                ? 'bg-primary/80 opacity-100 hover:bg-primary'
                : 'bg-emerald-300/30 opacity-0 group-hover/clip:opacity-100 hover:bg-emerald-300/60',
            )}
            aria-label="Trim end"
          />
        </>
      ) : null}
    </div>
  )
})

function buildWaveformPath(peaks: Int8Array): string {
  const pairCount = Math.floor(peaks.length / 2)
  const width = 100
  const height = 100
  const stepX = width / pairCount
  const mid = height / 2
  let top = `M 0 ${mid}`
  let bottom = `L 0 ${mid}`
  for (let i = 0; i < pairCount; i++) {
    const min = (peaks[i * 2] ?? 0) / 128
    const max = (peaks[i * 2 + 1] ?? 0) / 128
    const x = i * stepX
    top += ` L ${x.toFixed(2)} ${(mid + min * mid).toFixed(2)}`
    bottom = ` L ${x.toFixed(2)} ${(mid + max * mid).toFixed(2)}` + bottom
  }
  return top + ' L ' + width + ' ' + mid + bottom + ' Z'
}

const WaveformSvg = memo(function WaveformSvg({
  peaks,
  className,
}: {
  peaks?: Int8Array
  className?: string
}) {
  const d = useMemo(() => (peaks && peaks.length > 0 ? buildWaveformPath(peaks) : null), [peaks])

  if (!d) {
    return <div className={className} />
  }

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={className}>
      <path d={d} fill="currentColor" opacity={0.55} />
    </svg>
  )
})
