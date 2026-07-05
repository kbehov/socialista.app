'use client'

import { useState } from 'react'
import { useVideoEditorStore } from '@/lib/video/store'
import { formatTimecode } from '@/lib/video/timecode'
import type { ClipId } from '@socialista/types'
import { Loader2Icon, SparklesIcon } from 'lucide-react'
import { useClipAiOptional } from '@/components/video/ai/clip-ai-provider'
import { Button } from '@/components/ui/button'
import { FilterControls } from './filter-controls'
import { Slider } from './slider'
import { TransitionPicker } from './transition-picker'

export function ClipProperties({ clipId }: { clipId: ClipId }) {
  const clip = useVideoEditorStore(s => s.project.clips[clipId])
  const fps = useVideoEditorStore(s => s.project.fps)
  const assets = useVideoEditorStore(s => s.assets)
  const setClipVolume = useVideoEditorStore(s => s.setClipVolume)
  const setClipSpeed = useVideoEditorStore(s => s.setClipSpeed)
  const setClipVolumeLive = useVideoEditorStore(s => s.setClipVolumeLive)
  const setClipSpeedLive = useVideoEditorStore(s => s.setClipSpeedLive)
  const setClipFilter = useVideoEditorStore(s => s.setClipFilter)
  const setClipFilterLive = useVideoEditorStore(s => s.setClipFilterLive)
  const removeClipFilter = useVideoEditorStore(s => s.removeClipFilter)
  const removeClipFilterLive = useVideoEditorStore(s => s.removeClipFilterLive)
  const setClipTransition = useVideoEditorStore(s => s.setClipTransition)
  const trimClip = useVideoEditorStore(s => s.trimClip)
  const clipAi = useClipAiOptional()

  const [trimInDraft, setTrimInDraft] = useState(() => clip?.trimIn.toFixed(2) ?? '0')
  const [trimOutDraft, setTrimOutDraft] = useState(() => clip?.trimOut.toFixed(2) ?? '0')

  if (!clip) {
    return <div className="text-xs text-muted-foreground">No clip selected.</div>
  }

  const asset = assets[clip.assetId]
  const assetDuration = asset?.duration ?? clip.duration
  const aiMode = clipAi?.getClipAiMode(clipId) ?? null
  const canUseAi = clipAi?.canUseClipAi(clipId) ?? false
  const isAiProcessing = clipAi?.isProcessingClip(clipId) ?? false
  const aiLabel = aiMode === 'animate-image' ? 'Animate with AI' : 'Edit with AI'
  const aiDescription =
    aiMode === 'animate-image'
      ? 'Turn this still image into a short animated video clip.'
      : 'Apply AI edits to this video while keeping the same clip on the timeline.'

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="text-xs font-semibold uppercase text-muted-foreground">Clip</div>
        <div className="mt-1 truncate text-sm">{asset ? asset.name : 'Missing media'}</div>
      </div>

      {clip.type !== 'audio' && clipAi ? (
        <div className="rounded-lg border bg-muted/20 p-3">
          <div className="flex items-start gap-2">
            <SparklesIcon className="mt-0.5 size-4 shrink-0 text-primary" />
            <div className="min-w-0 flex-1 space-y-2">
              <div>
                <p className="text-xs font-medium">{aiLabel}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{aiDescription}</p>
              </div>
              <Button
                type="button"
                size="sm"
                className="h-8 w-full"
                onClick={() => clipAi.openClipAi(clipId)}
                disabled={!canUseAi || isAiProcessing}
              >
                {isAiProcessing ? <Loader2Icon className="animate-spin" /> : <SparklesIcon />}
                {isAiProcessing ? 'Generating…' : aiLabel}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <div className="text-xs font-medium text-muted-foreground">Timing</div>
        <div className="grid grid-cols-2 gap-2">
          <NumberField
            label="Start"
            value={clip.startTime}
            onChange={() => {}}
            format={v => formatTimecode(v, fps)}
            readOnly
          />
          <NumberField
            label="Duration"
            value={clip.duration}
            onChange={() => {}}
            format={v => formatTimecode(v, fps)}
            readOnly
          />
          <NumberField
            label="Trim in"
            value={trimInDraft}
            onChange={setTrimInDraft}
            onBlur={() => {
              const v = parseFloat(trimInDraft) || 0
              trimClip(clip.id, v, clip.trimOut)
            }}
            step={0.1}
            format={() => formatTimecode(clip.trimIn, fps)}
          />
          <NumberField
            label="Trim out"
            value={trimOutDraft}
            onChange={setTrimOutDraft}
            onBlur={() => {
              const v = parseFloat(trimOutDraft) || 0
              trimClip(clip.id, clip.trimIn, v)
            }}
            step={0.1}
            format={() => formatTimecode(clip.trimOut, fps)}
          />
        </div>
        <div className="text-[10px] text-muted-foreground">
          Asset duration: {formatTimecode(assetDuration, fps)}
        </div>
      </div>

      <Slider
        label="Volume"
        min={0}
        max={1}
        step={0.01}
        value={clip.volume}
        onChange={v => setClipVolumeLive(clip.id, v)}
        onCommit={v => setClipVolume(clip.id, v)}
        format={v => `${Math.round(v * 100)}%`}
      />

      {clip.type !== 'audio' && (
        <Slider
          label="Speed"
          min={0.25}
          max={4}
          step={0.05}
          value={clip.speed}
          onChange={v => setClipSpeedLive(clip.id, v)}
          onCommit={v => setClipSpeed(clip.id, v)}
          format={v => `${v.toFixed(2)}x`}
        />
      )}

      {clip.type !== 'audio' && (
        <>
          <FilterControls
            filters={clip.filters}
            onChange={f => setClipFilterLive(clip.id, f)}
            onCommit={f => setClipFilter(clip.id, f)}
            onRemove={t => removeClipFilterLive(clip.id, t)}
            onRemoveCommit={t => removeClipFilter(clip.id, t)}
          />
          <TransitionPicker
            value={clip.transition}
            onChange={t => setClipTransition(clip.id, t)}
          />
        </>
      )}
    </div>
  )
}

function NumberField({
  label,
  value,
  onChange,
  onBlur,
  step = 0.01,
  format,
  readOnly,
}: {
  label: string
  value: number | string
  onChange: (value: string) => void
  onBlur?: () => void
  step?: number
  format?: (value: number) => string
  readOnly?: boolean
}) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <input
        type={readOnly ? 'text' : 'number'}
        step={step}
        value={readOnly ? (typeof value === 'number' ? format?.(value) ?? value : value) : value}
        readOnly={readOnly}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        className="h-8 rounded-md border border-input bg-transparent px-2 font-mono text-xs tabular-nums"
      />
      {format && typeof value === 'number' ? (
        <span className="font-mono text-[10px] text-muted-foreground">{format(value)}</span>
      ) : null}
    </label>
  )
}
