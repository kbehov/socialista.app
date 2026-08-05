'use client'

import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoldIcon,
  CopyIcon,
  PlusIcon,
  Trash2Icon,
} from 'lucide-react'
import { useEditorStore } from '@/lib/carousel/store'
import { Button } from '@/components/ui/button'
import { useActiveLayer } from '@/hooks/carousel/use-active-layer'
import { cn } from '@/lib/utils'
import { ColorPicker } from './primitives/color-picker'
import { FontPicker } from './primitives/font-picker'
import { AlignmentControl } from './primitives/alignment-control'
import { StyleSlider } from './primitives/style-slider'
import { TextPresetPicker } from './text-preset-picker'

export function TextToolbar() {
  const { slide, layer } = useActiveLayer()
  const addTextLayer = useEditorStore(s => s.addTextLayer)
  const updateLayerStyle = useEditorStore(s => s.updateLayerStyle)
  const updateLayerStyleLive = useEditorStore(s => s.updateLayerStyleLive)
  const updateLayer = useEditorStore(s => s.updateLayer)
  const removeLayer = useEditorStore(s => s.removeLayer)
  const duplicateLayer = useEditorStore(s => s.duplicateLayer)
  const bringForward = useEditorStore(s => s.bringForward)
  const sendBackward = useEditorStore(s => s.sendBackward)

  if (!slide) {
    return (
      <div className="rounded-xl border border-dashed border-border/50 bg-muted/10 px-3 py-8 text-center text-xs text-muted-foreground">
        Select a page to edit text.
      </div>
    )
  }

  if (!layer || layer.type !== 'text') {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/50 bg-muted/10 px-3 py-8 text-center">
        <p className="text-xs text-muted-foreground">
          Select a text box on the canvas, or add one below.
        </p>
        <Button size="sm" variant="outline" onClick={() => addTextLayer(slide.id)}>
          <PlusIcon />
          Add text box
        </Button>
      </div>
    )
  }

  const style = layer.style

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium tracking-tight text-muted-foreground">Text</span>
        <div className="flex gap-0.5">
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={() => bringForward(slide.id, layer.id)}
            aria-label="Bring forward"
          >
            <ArrowUpIcon />
          </Button>
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={() => sendBackward(slide.id, layer.id)}
            aria-label="Send backward"
          >
            <ArrowDownIcon />
          </Button>
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={() => duplicateLayer(slide.id, layer.id)}
            aria-label="Duplicate layer"
          >
            <CopyIcon />
          </Button>
          <Button
            size="icon-xs"
            variant="ghost"
            className="text-destructive hover:bg-destructive/10"
            onClick={() => removeLayer(slide.id, layer.id)}
            aria-label="Delete layer"
          >
            <Trash2Icon />
          </Button>
        </div>
      </div>

      <TextPresetPicker
        currentStyle={style}
        onApply={next => updateLayerStyle(slide.id, layer.id, next)}
      />

      <Field label="Content" htmlFor="text-layer-content">
        <textarea
          id="text-layer-content"
          value={layer.content}
          onChange={e => updateLayer(slide.id, layer.id, { content: e.target.value })}
          rows={3}
          className="w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm leading-relaxed shadow-xs outline-none transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          placeholder="Write your caption…"
        />
      </Field>

      <div className="space-y-3 rounded-xl border border-border/50 bg-muted/15 p-3">
        <Field label="Font">
          <FontPicker
            value={style.fontFamily}
            onChange={v => updateLayerStyle(slide.id, layer.id, { fontFamily: v })}
          />
        </Field>

        <StyleSlider
          label="Size"
          value={Math.round(style.fontSize)}
          min={12}
          max={220}
          step={1}
          suffix="px"
          onChange={v => updateLayerStyleLive(slide.id, layer.id, { fontSize: v })}
          onCommit={v => updateLayerStyle(slide.id, layer.id, { fontSize: v })}
        />

        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-normal leading-none tracking-[0.01em] text-muted-foreground/65">
            Weight
          </span>
          <Button
            type="button"
            variant={style.fontWeight === 'bold' ? 'default' : 'outline'}
            size="sm"
            className="h-7 px-2.5"
            onClick={() =>
              updateLayerStyle(slide.id, layer.id, {
                fontWeight: style.fontWeight === 'bold' ? 'normal' : 'bold',
              })
            }
          >
            <BoldIcon className="size-3.5" />
            Bold
          </Button>
        </div>

        <Field label="Alignment">
          <AlignmentControl
            value={style.textAlign}
            onChange={v => updateLayerStyle(slide.id, layer.id, { textAlign: v })}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <Field label="Text color">
          <ColorPicker
            value={style.color}
            onChange={v => updateLayerStyle(slide.id, layer.id, { color: v ?? '#000000' })}
          />
        </Field>
        <Field label="Background">
          <ColorPicker
            value={style.backgroundColor}
            onChange={v => updateLayerStyle(slide.id, layer.id, { backgroundColor: v })}
          />
        </Field>
      </div>

      <div className="space-y-3 rounded-xl border border-border/50 bg-muted/15 p-3">
        <StyleSlider
          label="Letter spacing"
          value={style.letterSpacing ?? 0}
          min={-6}
          max={24}
          step={0.5}
          suffix="px"
          onChange={v => updateLayerStyleLive(slide.id, layer.id, { letterSpacing: v })}
          onCommit={v => updateLayerStyle(slide.id, layer.id, { letterSpacing: v })}
        />
        <StyleSlider
          label="Line height"
          value={style.lineHeight ?? 1.2}
          min={0.8}
          max={2.4}
          step={0.05}
          onChange={v => updateLayerStyleLive(slide.id, layer.id, { lineHeight: v })}
          onCommit={v => updateLayerStyle(slide.id, layer.id, { lineHeight: v })}
        />
        <StyleSlider
          label="Padding"
          value={style.padding ?? 0}
          min={0}
          max={64}
          step={1}
          suffix="px"
          onChange={v => updateLayerStyleLive(slide.id, layer.id, { padding: v })}
          onCommit={v => updateLayerStyle(slide.id, layer.id, { padding: v })}
        />
        <StyleSlider
          label="Corner radius"
          value={style.borderRadius ?? 0}
          min={0}
          max={64}
          step={1}
          suffix="px"
          onChange={v => updateLayerStyleLive(slide.id, layer.id, { borderRadius: v })}
          onCommit={v => updateLayerStyle(slide.id, layer.id, { borderRadius: v })}
        />
      </div>
    </div>
  )
}

function Field({ label, children, htmlFor }: { label: string; children: React.ReactNode; htmlFor?: string }) {
  return (
    <div className={cn('flex flex-col gap-1.5')}>
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
