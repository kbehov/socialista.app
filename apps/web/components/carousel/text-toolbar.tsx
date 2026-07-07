'use client'

import { CopyIcon, Trash2Icon, ArrowUpIcon, ArrowDownIcon, BoldIcon, PlusIcon } from 'lucide-react'
import { useEditorStore } from '@/lib/carousel/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useActiveLayer } from '@/hooks/carousel/use-active-layer'
import { cn } from '@/lib/utils'
import { ColorPicker } from './primitives/color-picker'
import { FontPicker } from './primitives/font-picker'
import { AlignmentControl } from './primitives/alignment-control'
import { TextPresetPicker } from './text-preset-picker'

export function TextToolbar() {
  const { slide, layer } = useActiveLayer()
  const addTextLayer = useEditorStore(s => s.addTextLayer)
  const updateLayerStyle = useEditorStore(s => s.updateLayerStyle)
  const updateLayer = useEditorStore(s => s.updateLayer)
  const removeLayer = useEditorStore(s => s.removeLayer)
  const duplicateLayer = useEditorStore(s => s.duplicateLayer)
  const bringForward = useEditorStore(s => s.bringForward)
  const sendBackward = useEditorStore(s => s.sendBackward)

  if (!slide) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/20 px-3 py-6 text-center text-xs text-muted-foreground">
        Select a slide in the filmstrip to edit its background.
      </div>
    )
  }

  if (!layer || layer.type !== 'text') {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed bg-muted/20 px-3 py-6 text-center">
        <p className="text-xs text-muted-foreground">
          Click a text box on the canvas, or add one below.
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
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-muted-foreground">Text</span>
        <div className="flex gap-1">
          <Button size="icon-xs" variant="ghost" onClick={() => bringForward(slide.id, layer.id)} aria-label="Bring forward">
            <ArrowUpIcon />
          </Button>
          <Button size="icon-xs" variant="ghost" onClick={() => sendBackward(slide.id, layer.id)} aria-label="Send backward">
            <ArrowDownIcon />
          </Button>
          <Button size="icon-xs" variant="ghost" onClick={() => duplicateLayer(slide.id, layer.id)} aria-label="Duplicate layer">
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

      <Field label="Text">
        <textarea
          value={layer.content}
          onChange={e => updateLayer(slide.id, layer.id, { content: e.target.value })}
          rows={2}
          className="w-full resize-none rounded-md border border-input bg-transparent px-2 py-1.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </Field>

      <Field label="Font">
        <FontPicker value={style.fontFamily} onChange={v => updateLayerStyle(slide.id, layer.id, { fontFamily: v })} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Size">
          <Input
            type="number"
            min={8}
            max={400}
            value={Math.round(style.fontSize)}
            onChange={e => updateLayerStyle(slide.id, layer.id, { fontSize: Number(e.target.value) || 16 })}
          />
        </Field>
        <Field label="Weight">
          <Button
            type="button"
            variant={style.fontWeight === 'bold' ? 'default' : 'outline'}
            size="sm"
            onClick={() =>
              updateLayerStyle(slide.id, layer.id, {
                fontWeight: style.fontWeight === 'bold' ? 'normal' : 'bold',
              })
            }
            className="w-full"
          >
            <BoldIcon /> Bold
          </Button>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
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

      <Field label="Alignment">
        <AlignmentControl
          value={style.textAlign}
          onChange={v => updateLayerStyle(slide.id, layer.id, { textAlign: v })}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Letter spacing">
          <Input
            type="number"
            min={-10}
            max={40}
            step={0.5}
            value={style.letterSpacing ?? 0}
            onChange={e => updateLayerStyle(slide.id, layer.id, { letterSpacing: Number(e.target.value) || 0 })}
          />
        </Field>
        <Field label="Line height">
          <Input
            type="number"
            min={0.8}
            max={3}
            step={0.05}
            value={style.lineHeight ?? 1.2}
            onChange={e => updateLayerStyle(slide.id, layer.id, { lineHeight: Number(e.target.value) || 1.2 })}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Padding">
          <Input
            type="number"
            min={0}
            max={120}
            value={style.padding ?? 0}
            onChange={e => updateLayerStyle(slide.id, layer.id, { padding: Number(e.target.value) || 0 })}
          />
        </Field>
        <Field label="Corner radius">
          <Input
            type="number"
            min={0}
            max={120}
            value={style.borderRadius ?? 0}
            onChange={e => updateLayerStyle(slide.id, layer.id, { borderRadius: Number(e.target.value) || 0 })}
          />
        </Field>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={cn('flex flex-col gap-1.5')}>
      <Label className="text-[11px] font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}
