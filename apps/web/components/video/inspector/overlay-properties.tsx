'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { BoldIcon } from 'lucide-react'
import { useVideoEditorStore } from '@/lib/video/store'
import { ColorPicker } from '@/components/editor/primitives/color-picker'
import { FontPicker } from '@/components/editor/primitives/font-picker'
import { AlignmentControl } from '@/components/editor/primitives/alignment-control'
import { StyleSlider } from '@/components/editor/primitives/style-slider'
import { TextPresetPicker } from '@/components/editor/text-preset-picker'
import { AlignmentToolbar, type AlignmentAction } from '@/components/editor/alignment-toolbar'
import { Button } from '@/components/ui/button'
import type { TextAnimation, TextOverlayStyle } from '@socialista/types'
import {
  DEFAULT_TEXT_LAYER_BASE,
  layerStyleFromOverlay,
  overlayStyleFromLayer,
} from '@/lib/video/defaults'
import { measureOverlayHeightPct } from '@/lib/video/overlay-bounds'
import { cn } from '@/lib/utils'

const ANIMATIONS: { value: TextAnimation; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'fade', label: 'Fade' },
  { value: 'slide-up', label: 'Slide up' },
  { value: 'slide-down', label: 'Slide down' },
]

const fieldControlClass =
  'h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-[12px] shadow-xs outline-none transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

export function OverlayProperties({ overlayId }: { overlayId: string }) {
  const overlay = useVideoEditorStore(s => s.project.textOverlays.find(o => o.id === overlayId))
  const updateOverlay = useVideoEditorStore(s => s.updateOverlay)
  const updateOverlayLive = useVideoEditorStore(s => s.updateOverlayLive)
  const setOverlayTiming = useVideoEditorStore(s => s.setOverlayTiming)
  const updateOverlayStyle = useVideoEditorStore(s => s.updateOverlayStyle)
  const removeOverlay = useVideoEditorStore(s => s.removeOverlay)
  const reorderOverlay = useVideoEditorStore(s => s.reorderOverlay)
  const alignOverlayCenter = useVideoEditorStore(s => s.alignOverlayCenter)
  const alignOverlayEdge = useVideoEditorStore(s => s.alignOverlayEdge)
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

  const handleAlign = (action: AlignmentAction) => {
    if (action.type === 'distribute') return
    const artboard = document.querySelector('[data-video-canvas]') as HTMLElement | null
    const heightPct = measureOverlayHeightPct(artboard, overlay.id) ?? undefined
    if (action.type === 'center') alignOverlayCenter(overlay.id, action.axis, heightPct)
    else alignOverlayEdge(overlay.id, action.edge, heightPct)
  }

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-normal leading-none tracking-[0.02em] text-muted-foreground/65">
          Text overlay
        </p>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            className="rounded-md px-1.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={() => reorderOverlay(overlay.id, -1)}
            aria-label="Bring forward"
          >
            ↑
          </button>
          <button
            type="button"
            className="rounded-md px-1.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={() => reorderOverlay(overlay.id, 1)}
            aria-label="Send backward"
          >
            ↓
          </button>
          <button
            type="button"
            className="rounded-md px-1.5 py-1 text-[11px] text-red-500/90 transition-colors hover:bg-red-500/10"
            onClick={() => removeOverlay(overlay.id)}
          >
            Delete
          </button>
        </div>
      </div>

      <AlignmentToolbar
        onAlign={handleAlign}
        showDistribute={false}
        showToggles={false}
        size="xs"
        variant="inline"
      />

      <TextPresetPicker<TextOverlayStyle>
        currentStyle={overlay.style}
        onApply={style => updateOverlayStyle(overlay.id, style)}
        toLayerStyle={layerStyleFromOverlay}
        fromLayerStyle={overlayStyleFromLayer}
        baseStyle={DEFAULT_TEXT_LAYER_BASE}
        variant="accordion"
      />

      <Field label="Content" htmlFor="overlay-content">
        <textarea
          id="overlay-content"
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
          className="w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm leading-relaxed shadow-xs outline-none transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          placeholder="Write your caption…"
        />
      </Field>

      <div className="space-y-3 rounded-xl border border-border/50 bg-muted/15 p-3">
        <Field label="Font">
          <FontPicker
            value={overlay.style.fontFamily}
            onChange={v => updateOverlayStyle(overlay.id, { fontFamily: v })}
          />
        </Field>

        <StyleSlider
          label="Size"
          min={12}
          max={200}
          step={1}
          value={overlay.style.fontSize}
          onChange={v => updateOverlayStyle(overlay.id, { fontSize: v })}
          suffix="px"
        />

        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-normal leading-none tracking-[0.01em] text-muted-foreground/65">
            Weight
          </span>
          <Button
            type="button"
            variant={overlay.style.fontWeight === 'bold' ? 'default' : 'outline'}
            size="sm"
            className="h-7 gap-1.5 px-2.5"
            onClick={() =>
              updateOverlayStyle(overlay.id, {
                fontWeight: overlay.style.fontWeight === 'bold' ? 'normal' : 'bold',
              })
            }
          >
            <BoldIcon className="size-3.5" />
            Bold
          </Button>
        </div>

        <Field label="Alignment">
          <AlignmentControl
            value={overlay.style.textAlign}
            onChange={v => updateOverlayStyle(overlay.id, { textAlign: v })}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <Field label="Text color">
          <ColorPicker
            value={overlay.style.color}
            onChange={v => updateOverlayStyle(overlay.id, { color: v ?? '#ffffff' })}
            allowNone={false}
          />
        </Field>
        <Field label="Background">
          <ColorPicker
            value={overlay.style.backgroundColor}
            onChange={v => updateOverlayStyle(overlay.id, { backgroundColor: v })}
          />
        </Field>
      </div>

      <div className="space-y-3 rounded-xl border border-border/50 bg-muted/15 p-3">
        <StyleSlider
          label="Letter spacing"
          min={-2}
          max={20}
          step={0.5}
          value={overlay.style.letterSpacing ?? 0}
          onChange={v => updateOverlayStyle(overlay.id, { letterSpacing: v })}
          suffix="px"
        />
        <StyleSlider
          label="Line height"
          min={0.8}
          max={3}
          step={0.05}
          value={overlay.style.lineHeight ?? 1.2}
          onChange={v => updateOverlayStyle(overlay.id, { lineHeight: v })}
        />
        <StyleSlider
          label="Padding"
          min={0}
          max={48}
          step={1}
          value={overlay.style.padding ?? 0}
          onChange={v => updateOverlayStyle(overlay.id, { padding: v })}
          suffix="px"
        />
        <StyleSlider
          label="Corner radius"
          min={0}
          max={48}
          step={1}
          value={overlay.style.borderRadius ?? 0}
          onChange={v => updateOverlayStyle(overlay.id, { borderRadius: v })}
          suffix="px"
        />
      </div>

      <Field label="Animation" htmlFor="overlay-animation">
        <select
          id="overlay-animation"
          value={overlay.style.animation ?? 'none'}
          onChange={e => updateOverlayStyle(overlay.id, { animation: e.target.value as TextAnimation })}
          className={fieldControlClass}
        >
          {ANIMATIONS.map(a => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-2.5">
        <Field label="Start (s)" htmlFor="overlay-start">
          <input
            id="overlay-start"
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
            className={cn(fieldControlClass, 'font-mono text-[11px] tabular-nums')}
          />
        </Field>
        <Field label="End (s)" htmlFor="overlay-end">
          <input
            id="overlay-end"
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
            className={cn(fieldControlClass, 'font-mono text-[11px] tabular-nums')}
          />
        </Field>
      </div>
    </div>
  )
}

function Field({
  label,
  children,
  htmlFor,
}: {
  label: string
  children: ReactNode
  htmlFor?: string
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-[11px] font-normal leading-none tracking-[0.01em] text-muted-foreground/65"
      >
        {label}
      </label>
      {children}
    </div>
  )
}
