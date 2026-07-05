'use client'

import { useVideoEditorStore } from '@/lib/video/store'
import { useDragClip } from '@/hooks/video/use-drag-clip'
import { useTrimHandles } from '@/hooks/video/use-trim-handles'
import type { AudioClip, Track } from '@socialista/types'

type Props = {
  clip: AudioClip
  left: number
  width: number
  height: number
  pxPerSec: number
  track: Track
}

export function AudioClipBlock({ clip, left, width, height, pxPerSec, track }: Props) {
  const selectedClipId = useVideoEditorStore(s => s.selectedClipId)
  const selectClip = useVideoEditorStore(s => s.selectClip)
  const assets = useVideoEditorStore(s => s.assets)
  const { beginDrag } = useDragClip(pxPerSec)
  const { beginTrim } = useTrimHandles(pxPerSec)

  const asset = assets[clip.assetId]
  const waveform = asset && 'waveform' in asset ? asset.waveform : undefined
  const selected = selectedClipId === clip.id

  return (
    <div
      data-clip-block
      onPointerDown={e => {
        if (track.locked) return
        selectClip(clip.id)
        beginDrag(clip.id, clip.startTime, clip.trackId, e)
      }}
      className={`absolute top-1 flex items-center overflow-hidden rounded border ${selected ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-emerald-600'} bg-emerald-500/20`}
      style={{ left, width, height: height - 8 }}
    >
      <WaveformSvg peaks={waveform} className="h-full w-full" />
      <div className="absolute left-1 top-0.5 max-w-[calc(100%-8px)] truncate text-[10px] text-emerald-900 dark:text-emerald-100">
        {asset ? asset.name : 'Missing audio'}
      </div>
      {!track.locked && (
        <>
          <div
            onPointerDown={e => beginTrim(clip.id, 'in', clip.trimIn, clip.trimOut, clip.duration, e)}
            className="absolute left-0 top-0 h-full w-2 cursor-ew-resize bg-blue-500/60 hover:bg-blue-500"
          />
          <div
            onPointerDown={e => beginTrim(clip.id, 'out', clip.trimIn, clip.trimOut, clip.duration, e)}
            className="absolute right-0 top-0 h-full w-2 cursor-ew-resize bg-blue-500/60 hover:bg-blue-500"
          />
        </>
      )}
    </div>
  )
}

function WaveformSvg({ peaks, className }: { peaks?: Int8Array; className?: string }) {
  if (!peaks || peaks.length === 0) {
    return <div className={className} />
  }
  // peaks: int8 min/max pairs; render as a centered SVG path
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
  const d = top + ' L ' + width + ' ' + mid + bottom + ' Z'
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className}
    >
      <path d={d} fill="currentColor" opacity={0.6} />
    </svg>
  )
}
