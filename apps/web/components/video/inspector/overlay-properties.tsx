'use client'

import { useEffect, useState } from 'react'
import { useVideoEditorStore } from '@/lib/video/store'
import { ColorPicker } from '@/components/carousel/primitives/color-picker'
import { FontPicker } from '@/components/carousel/primitives/font-picker'
import { AlignmentControl } from '@/components/carousel/primitives/alignment-control'
import type { TextAnimation } from '@socialista/types'
import { Slider } from './slider'
import { VideoTextPresetPicker } from './video-text-preset-picker'

const ANIMATIONS: { value: TextAnimation; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'fade', label: 'Fade' },
  { value: 'slide-up', label: 'Slide up' },
  { value: 'slide-down', label: 'Slide down' },
]

export function OverlayProperties({ overlayId }: { overlayId: string }) {
  const overlay = useVideoEditorStore(s => s.project.textOverlays.find(o => o.id === overlayId))
  const updateOverlay = useVideoEditorStore(s => s.updateOverlay)
  const updateOverlayLive = useVideoEditorStore(s => s.updateOverlayLive)
  const setOverlayTiming = useVideoEditorStore(s => s.setOverlayTiming)
  const updateOverlayStyle = useVideoEditorStore(s => s.updateOverlayStyle)
  const removeOverlay = useVideoEditorStore(s => s.removeOverlay)
  const reorderOverlay = useVideoEditorStore(s => s.reorderOverlay)
  const [contentDraft, setContentDraft] = useState('')
  const [startDraft, setStartDraft] = useState('')
  const [endDraft, setEndDraft] = useState('')

  useEffect(() => {
    if (!overlay) return
    setContentDraft(overlay.content)
    setStartDraft(overlay.startTime.toFixed(2))
    setEndDraft(overlay.endTime.toFixed(2))
  }, [overlay?.id, overlay?.content, overlay?.startTime, overlay?.endTime])

  if (!overlay) {
    return <div className="text-xs text-muted-foreground">No overlay selected.</div>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase text-muted-foreground">Text overlay</div>
        <div className="flex gap-1">
          <button
            type="button"
            className="rounded px-1.5 py-0.5 text-xs hover:bg-muted"
            onClick={() => reorderOverlay(overlay.id, -1)}
          >
            ↑
          </button>
          <button
            type="button"
            className="rounded px-1.5 py-0.5 text-xs hover:bg-muted"
            onClick={() => reorderOverlay(overlay.id, 1)}
          >
            ↓
          </button>
          <button
            type="button"
            className="rounded px-1.5 py-0.5 text-xs text-red-500 hover:bg-muted"
            onClick={() => removeOverlay(overlay.id)}
          >
            Delete
          </button>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground">
        Drag on the timeline to move or trim. Press <kbd className="rounded border px-1">S</kbd> to split at the playhead.
      </p>

      <VideoTextPresetPicker
        currentStyle={overlay.style}
        onApply={style => updateOverlayStyle(overlay.id, style)}
      />

      <label className="flex flex-col gap-1 text-xs">
        <span className="text-muted-foreground">Content</span>
        <textarea
          value={contentDraft}
          onChange={e => {
            setContentDraft(e.target.value)
            updateOverlayLive(overlay.id, { content: e.target.value })
          }}
          onBlur={() => {
            if (contentDraft !== overlay.content) {
              updateOverlay(overlay.id, { content: contentDraft })
            }
          }}
          rows={2}
          className="rounded-md border border-input bg-transparent px-2 py-1 text-sm"
        />
      </label>

      <div className="flex flex-col gap-1 text-xs">
        <span className="text-muted-foreground">Font</span>
        <FontPicker value={overlay.style.fontFamily} onChange={v => updateOverlayStyle(overlay.id, { fontFamily: v })} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Slider
          label="Font size"
          min={12}
          max={200}
          step={1}
          value={overlay.style.fontSize}
          onChange={v => updateOverlayStyle(overlay.id, { fontSize: v })}
          format={v => `${Math.round(v)}px`}
        />
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-muted-foreground">Weight</span>
          <select
            value={overlay.style.fontWeight}
            onChange={e => updateOverlayStyle(overlay.id, { fontWeight: e.target.value as 'normal' | 'bold' })}
            className="h-8 rounded-md border border-input bg-transparent px-2"
          >
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-muted-foreground">Text color</span>
          <ColorPicker
            value={overlay.style.color}
            onChange={v => updateOverlayStyle(overlay.id, { color: v ?? '#ffffff' })}
            allowNone={false}
            label="Color"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-muted-foreground">Background</span>
          <ColorPicker
            value={overlay.style.backgroundColor}
            onChange={v => updateOverlayStyle(overlay.id, { backgroundColor: v })}
            label="Background"
          />
        </label>
      </div>

      <div className="flex flex-col gap-1 text-xs">
        <span className="text-muted-foreground">Alignment</span>
        <AlignmentControl
          value={overlay.style.textAlign}
          onChange={v => updateOverlayStyle(overlay.id, { textAlign: v })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Slider
          label="Letter spacing"
          min={-2}
          max={20}
          step={0.5}
          value={overlay.style.letterSpacing ?? 0}
          onChange={v => updateOverlayStyle(overlay.id, { letterSpacing: v })}
          format={v => `${v.toFixed(1)}px`}
        />
        <Slider
          label="Line height"
          min={0.8}
          max={3}
          step={0.05}
          value={overlay.style.lineHeight ?? 1.2}
          onChange={v => updateOverlayStyle(overlay.id, { lineHeight: v })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Slider
          label="Padding"
          min={0}
          max={48}
          step={1}
          value={overlay.style.padding ?? 0}
          onChange={v => updateOverlayStyle(overlay.id, { padding: v })}
          format={v => `${Math.round(v)}px`}
        />
        <Slider
          label="Radius"
          min={0}
          max={48}
          step={1}
          value={overlay.style.borderRadius ?? 0}
          onChange={v => updateOverlayStyle(overlay.id, { borderRadius: v })}
          format={v => `${Math.round(v)}px`}
        />
      </div>

      <label className="flex flex-col gap-1 text-xs">
        <span className="text-muted-foreground">Animation</span>
        <select
          value={overlay.style.animation ?? 'none'}
          onChange={e => updateOverlayStyle(overlay.id, { animation: e.target.value as TextAnimation })}
          className="h-8 rounded-md border border-input bg-transparent px-2"
        >
          {ANIMATIONS.map(a => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-muted-foreground">Start (s)</span>
          <input
            type="number"
            min={0}
            step={0.1}
            value={startDraft}
            onChange={e => setStartDraft(e.target.value)}
            onBlur={() => {
              const start = parseFloat(startDraft) || 0
              const end = parseFloat(endDraft) || overlay.endTime
              if (start !== overlay.startTime || end !== overlay.endTime) {
                setOverlayTiming(overlay.id, start, end)
              }
            }}
            className="h-8 rounded-md border border-input bg-transparent px-2 font-mono text-xs"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-muted-foreground">End (s)</span>
          <input
            type="number"
            min={0}
            step={0.1}
            value={endDraft}
            onChange={e => setEndDraft(e.target.value)}
            onBlur={() => {
              const start = parseFloat(startDraft) || overlay.startTime
              const end = parseFloat(endDraft) || 0
              if (start !== overlay.startTime || end !== overlay.endTime) {
                setOverlayTiming(overlay.id, start, end)
              }
            }}
            className="h-8 rounded-md border border-input bg-transparent px-2 font-mono text-xs"
          />
        </label>
      </div>
    </div>
  )
}
